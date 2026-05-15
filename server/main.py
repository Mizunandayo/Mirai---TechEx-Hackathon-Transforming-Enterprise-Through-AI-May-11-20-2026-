from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import os
import json
import time
import socket
import subprocess
import signal
from pathlib import Path
from collections import defaultdict
from typing import AsyncGenerator, Any
import logging

import httpx

try:
    import google.generativeai as developer_genai
except ImportError:
    developer_genai = None

try:
    from google import genai as vertex_genai
    from google.genai import types as vertex_types
except ImportError:
    vertex_genai = None
    vertex_types = None

from dotenv import load_dotenv
from models.schemas import (
    TaskSpecRequest,
    TaskSpec,
    RepairRequest,
    SuggestRequest,
    SuggestResponse,
)
from models.arm_context import ArmContextBuilder, GeminiPromptAssembler
from models.validators import SafetyValidator

logger = logging.getLogger('mirai.backend')

app = FastAPI(title='Mirai AI Backend', version='1.2.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'https://mirai.vercel.app'],
    allow_credentials=True,
    allow_methods=['POST', 'GET'],
    allow_headers=['*'],
)

# Load env from backend/.env first (project convention), then server/.env fallback.
PROJECT_ROOT = Path(__file__).resolve().parents[1]
BACKEND_ENV_PATH = PROJECT_ROOT / 'backend' / '.env'
SERVER_ENV_PATH = Path(__file__).resolve().parent / '.env'

if BACKEND_ENV_PATH.exists():
    load_dotenv(BACKEND_ENV_PATH)
elif SERVER_ENV_PATH.exists():
    load_dotenv(SERVER_ENV_PATH)

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_PROVIDER = os.getenv('GEMINI_PROVIDER', 'developer').strip().lower()
VERTEX_PROJECT_ID = (
    os.getenv('VERTEX_PROJECT_ID')
    or os.getenv('GCP_PROJECT_ID')
    or os.getenv('GCP_PROJECT_NUMBER')
    or os.getenv('GOOGLE_CLOUD_PROJECT')
)
VERTEX_LOCATION = os.getenv('VERTEX_LOCATION', 'global')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-2.0-flash')
GEMINI_FALLBACK_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.0-flash-001',
    'gemini-flash-latest',
    'gemini-2.0-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
]
_vertex_client = None

def configure_provider() -> None:
    if GEMINI_PROVIDER == 'developer':
        if developer_genai is None:
            raise RuntimeError('google-generativeai package not installed for developer Gemini provider')
        if not GEMINI_API_KEY:
            raise RuntimeError('GEMINI_API_KEY not found for developer Gemini provider')
        developer_genai.configure(api_key=GEMINI_API_KEY)
        return

    if GEMINI_PROVIDER == 'vertex':
        if vertex_genai is None or vertex_types is None:
            raise RuntimeError('google-genai package not installed for Vertex AI Gemini provider')
        if not VERTEX_PROJECT_ID:
            raise RuntimeError('VERTEX_PROJECT_ID or GCP_PROJECT_ID is required for Vertex AI Gemini provider')
        return

    raise RuntimeError("GEMINI_PROVIDER must be either 'developer' or 'vertex'")

def normalize_model_name(name: str) -> str:
    return name if name.startswith('models/') else 'models/' + name

def model_suffix(name: str) -> str:
    return name.split('/', 1)[1] if name.startswith('models/') else name

def discover_generate_models() -> list[str]:
    if GEMINI_PROVIDER != 'developer' or developer_genai is None:
        return []

    try:
        discovered = []
        for model in developer_genai.list_models():
            methods = getattr(model, 'supported_generation_methods', []) or []
            if 'generateContent' in methods:
                discovered.append(getattr(model, 'name', ''))
        return [m for m in discovered if m]
    except Exception:
        return []

def build_model_candidates() -> list[str]:
    preferred_unique = list(dict.fromkeys([GEMINI_MODEL] + GEMINI_FALLBACK_MODELS))

    if GEMINI_PROVIDER == 'vertex':
        return preferred_unique

    preferred = [normalize_model_name(name) for name in preferred_unique]
    # De-duplicate while preserving order.
    preferred_unique = list(dict.fromkeys(preferred))

    discovered = discover_generate_models()
    if not discovered:
        return preferred_unique

    discovered_suffix_map = {model_suffix(m): m for m in discovered}
    candidates: list[str] = []

    # Keep explicit preference order but only if model is available for generateContent.
    for preferred_name in preferred_unique:
        resolved = discovered_suffix_map.get(model_suffix(preferred_name))
        if resolved and resolved not in candidates:
            candidates.append(resolved)

    return candidates or preferred_unique

def get_vertex_client():
    global _vertex_client
    if _vertex_client is None:
        client_kwargs: dict[str, Any] = {
            'vertexai': True,
            'project': VERTEX_PROJECT_ID,
            'location': VERTEX_LOCATION,
        }
        _vertex_client = vertex_genai.Client(**client_kwargs)
    return _vertex_client

def extract_chunk_text(chunk: Any) -> str:
    text = getattr(chunk, 'text', None)
    return text or ''

def generate_stream(model_name: str, system_prompt: str, user_prompt: str):
    if GEMINI_PROVIDER == 'vertex':
        client = get_vertex_client()
        config = vertex_types.GenerateContentConfig(system_instruction=system_prompt)
        return client.models.generate_content_stream(
            model=model_name,
            contents=user_prompt,
            config=config,
        )

    model = developer_genai.GenerativeModel(model_name)
    return model.generate_content([system_prompt, user_prompt], stream=True)

def generate_text(model_name: str, prompt: str, system_prompt: str | None = None) -> str:
    if GEMINI_PROVIDER == 'vertex':
        client = get_vertex_client()
        config = None
        if system_prompt:
            config = vertex_types.GenerateContentConfig(system_instruction=system_prompt)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config,
        )
        return getattr(response, 'text', None) or ''

    model = developer_genai.GenerativeModel(model_name)
    response = model.generate_content(prompt)
    return response.text or ''

def extract_json_dict(text: str) -> dict[str, Any]:
    start = text.find('{')
    end = text.rfind('}')
    if start == -1 or end == -1 or end <= start:
        raise ValueError('No valid JSON in model response')
    return json.loads(text[start:end + 1])

def normalize_step_dict(step: dict[str, Any], index: int) -> dict[str, Any]:
    normalized = dict(step)

    if 'stepId' not in normalized and 'step_id' in normalized:
        normalized['stepId'] = normalized.get('step_id')
    if 'targetName' not in normalized and 'target_name' in normalized:
        normalized['targetName'] = normalized.get('target_name')
    if 'durationMs' not in normalized and 'duration_ms' in normalized:
        normalized['durationMs'] = normalized.get('duration_ms')

    if 'stepId' not in normalized or normalized.get('stepId') in (None, ''):
        normalized['stepId'] = index + 1

    return normalized

def normalize_task_payload(task_dict: dict[str, Any], fallback: dict[str, Any] | None = None) -> dict[str, Any]:
    fallback = fallback or {}
    merged = dict(fallback)
    merged.update(task_dict)

    # Accept snake_case from model replies.
    if 'taskName' not in merged and 'task_name' in merged:
        merged['taskName'] = merged.get('task_name')
    if 'taskDescription' not in merged and 'task_description' in merged:
        merged['taskDescription'] = merged.get('task_description')
    if 'confidenceScore' not in merged and 'confidence_score' in merged:
        merged['confidenceScore'] = merged.get('confidence_score')

    steps = merged.get('steps')
    if not isinstance(steps, list):
        steps = []
    merged['steps'] = [normalize_step_dict(s if isinstance(s, dict) else {}, i) for i, s in enumerate(steps)]

    if 'warnings' not in merged or not isinstance(merged.get('warnings'), list):
        merged['warnings'] = []

    if not merged.get('taskName'):
        merged['taskName'] = fallback.get('taskName', 'AI Generated Task')
    if not merged.get('taskDescription'):
        merged['taskDescription'] = fallback.get('taskDescription', 'Generated from natural language request')
    if merged.get('confidenceScore') is None:
        merged['confidenceScore'] = fallback.get('confidenceScore', 0.72)

    return merged

def build_repair_prompt(base_task: dict[str, Any], failures: list[Any], arm_context: Any) -> str:
    failures_desc = '\n'.join(
        [
            'Step '
            + str(getattr(f, 'step_index', '?'))
            + ': '
            + str(getattr(f, 'error_code', 'unknown'))
            + ' - '
            + str(getattr(f, 'message', ''))
            for f in failures
        ]
    )

    return (
        'Rewrite the task to fix the listed failures and return valid JSON only.\n\n'
        'Task:\n' + json.dumps(base_task, indent=2) + '\n\n'
        'Failures:\n' + failures_desc + '\n\n'
        'Constraints:\n'
        'Max reach: ' + str(arm_context.max_reach) + 'm\n'
        'Payload limit: ' + str(arm_context.payload_limit) + 'kg\n\n'
        'Requirements:\n'
        '- Keep taskName, taskDescription, confidenceScore, warnings, and steps in output\n'
        '- Ensure object pickup is complete: move -> grip close -> carry move -> optional release\n'
        '- Avoid collision risk by adding safer intermediate waypoints when needed\n'
    )

def build_suggest_prompt(
    user_input: str,
    arm_context: dict[str, Any],
    scene_objects: list[str],
    task_spec: dict[str, Any] | None,
    preflight: dict[str, Any] | None,
) -> str:
    return (
        'Return a JSON array of concise motion-planning suggestions only.\n\n'
        'User request:\n' + user_input + '\n\n'
        'Arm context:\n' + json.dumps(arm_context, indent=2) + '\n\n'
        'Scene objects:\n' + json.dumps(scene_objects, indent=2) + '\n\n'
        'Current task spec:\n' + json.dumps(task_spec or {}, indent=2) + '\n\n'
        'Preflight:\n' + json.dumps(preflight or {}, indent=2) + '\n\n'
        'Rules:\n'
        '- Max 6 suggestions\n'
        '- Focus on collision avoidance, reachability, pickup robustness, and sequence correctness\n'
        '- No markdown, no explanation prose, JSON array only\n'
    )

def parse_suggestions_text(text: str) -> list[str]:
    text = (text or '').strip()
    if not text:
        return []

    # First try JSON array extraction.
    left = text.find('[')
    right = text.rfind(']')
    if left != -1 and right != -1 and right > left:
        try:
            arr = json.loads(text[left:right + 1])
            if isinstance(arr, list):
                return [str(item).strip() for item in arr if str(item).strip()]
        except Exception:
            pass

    suggestions: list[str] = []
    for line in text.splitlines():
        cleaned = line.strip().lstrip('-').lstrip('*').strip()
        if cleaned:
            suggestions.append(cleaned)
    return suggestions[:6]

def deterministic_suggestions_from_preflight(preflight: dict[str, Any] | None) -> list[str]:
    if not preflight:
        return [
            'Use explicit pick and place targets in the command for higher planning precision.',
            'Keep approach height above obstacles before lateral translation.',
        ]

    suggestions: list[str] = []
    seen: set[str] = set()

    def push(msg: str) -> None:
        if msg in seen:
            return
        seen.add(msg)
        suggestions.append(msg)

    for failure in preflight.get('errors', []):
        code = str(failure.get('error_code', '')).lower()
        if code == 'reach_violation':
            push('Reduce target distance or increase total arm reach before retrying the motion plan.')
        elif code == 'collision_risk':
            push('Insert higher approach/retreat waypoints to keep links clear of shelves and table surfaces.')
        elif code == 'payload_violation':
            push('Lower payload demand or switch to a stronger gripper profile for this pickup.')
        elif code in ('precondition_unmet', 'object_consistency'):
            push('Ensure move targets remain bound to the pickup object until grip-close is executed.')

    for warning in preflight.get('warnings', []):
        w = str(warning).lower()
        if 'confidence' in w:
            push('Use explicit object names and destination zones to improve confidence and determinism.')

    return suggestions[:6]

def reindex_steps(task_payload: dict[str, Any]) -> None:
    steps = task_payload.get('steps')
    if not isinstance(steps, list):
        return
    for i, step in enumerate(steps):
        if isinstance(step, dict):
            step['stepId'] = i + 1

def enforce_pickup_target_consistency(task_payload: dict[str, Any]) -> list[str]:
    """
    Deterministically enforce one pickup target across pre-close move steps.
    """
    steps = task_payload.get('steps')
    if not isinstance(steps, list) or not steps:
        return []

    first_close = next(
        (
            i
            for i, step in enumerate(steps)
            if isinstance(step, dict)
            and step.get('type') == 'grip'
            and str(step.get('action', '')).lower() == 'close'
        ),
        -1,
    )
    if first_close <= 0:
        return []

    pickup_target = None
    for i in range(first_close):
        step = steps[i]
        if not isinstance(step, dict) or step.get('type') != 'move':
            continue
        candidate = str(step.get('targetName') or step.get('target_name') or '').strip()
        if candidate:
            pickup_target = candidate
            break

    if not pickup_target:
        return []

    notes: list[str] = []
    for i in range(first_close):
        step = steps[i]
        if not isinstance(step, dict) or step.get('type') != 'move':
            continue
        existing = str(step.get('targetName') or step.get('target_name') or '').strip()
        if existing != pickup_target:
            step['targetName'] = pickup_target
            notes.append(
                f"Auto-corrected pre-close move at step {i + 1} to pickup target '{pickup_target}'"
            )

    return notes

def ensure_pickup_flow(task_payload: dict[str, Any], user_input: str) -> list[str]:
    """
    Deterministically add minimal pickup structure for pick/grab commands.
    """
    lower = (user_input or '').lower()
    wants_pick = any(verb in lower for verb in ['pick', 'pickup', 'pick up', 'grab'])
    if not wants_pick:
        return []

    steps = task_payload.get('steps')
    if not isinstance(steps, list) or not steps:
        return []

    notes: list[str] = []
    close_index = next(
        (
            i
            for i, step in enumerate(steps)
            if isinstance(step, dict)
            and step.get('type') == 'grip'
            and str(step.get('action', '')).lower() == 'close'
        ),
        -1,
    )

    first_move_index = next(
        (i for i, step in enumerate(steps) if isinstance(step, dict) and step.get('type') == 'move'),
        -1,
    )

    if close_index == -1 and first_move_index != -1:
        force_value = 60
        insert_index = first_move_index + 1
        steps.insert(
            insert_index,
            {
                'stepId': insert_index + 1,
                'type': 'grip',
                'action': 'close',
                'force': force_value,
            },
        )
        close_index = insert_index
        notes.append('Auto-inserted grip-close step for pickup command.')

    if close_index != -1:
        has_carry = any(
            isinstance(step, dict) and step.get('type') == 'move' for step in steps[close_index + 1 :]
        )
        if not has_carry:
            anchor_move = None
            for i in range(close_index - 1, -1, -1):
                step = steps[i]
                if isinstance(step, dict) and step.get('type') == 'move':
                    anchor_move = step
                    break
            if anchor_move:
                carry = dict(anchor_move)
                carry['stepId'] = close_index + 2
                carry['y'] = float((carry.get('y') or 0.05) + 0.08)
                carry['speed'] = min(float(carry.get('speed') or 0.5), 0.45)
                carry['approach'] = 'linear'
                steps.insert(close_index + 1, carry)
                notes.append('Auto-inserted carry move after grip-close for stable transport.')

    reindex_steps(task_payload)
    return notes

def apply_deterministic_refinements(
    task_payload: dict[str, Any],
    preflight_errors: list[dict[str, Any]],
    max_reach: float,
) -> list[str]:
    """
    Last-pass deterministic corrections when model repair still fails.
    """
    steps = task_payload.get('steps')
    if not isinstance(steps, list) or not steps:
        return []

    notes: list[str] = []
    errors_by_index: dict[int, list[str]] = {}
    for err in preflight_errors:
        idx = int(err.get('step_index', -1))
        if idx < 0:
            continue
        errors_by_index.setdefault(idx, []).append(str(err.get('error_code', '')).lower())

    for idx, codes in errors_by_index.items():
        if idx >= len(steps):
            continue
        step = steps[idx]
        if not isinstance(step, dict) or step.get('type') != 'move':
            continue

        x = float(step.get('x') or 0.0)
        y = float(step.get('y') or 0.0)
        z = float(step.get('z') or 0.0)

        if 'reach_violation' in codes:
            distance = max((x * x + y * y + z * z) ** 0.5, 1e-6)
            scale = min(1.0, (max_reach * 0.92) / distance)
            if scale < 1.0:
                step['x'] = round(x * scale, 4)
                step['y'] = round(max(0.02, y * scale), 4)
                step['z'] = round(z * scale, 4)
                step['speed'] = min(float(step.get('speed') or 0.5), 0.45)
                notes.append(f'Scaled move at step {idx + 1} into reachable workspace.')

        if 'collision_risk' in codes:
            step['y'] = round(max(0.08, y), 4)
            if x < -0.1 and z > 0.8:
                step['z'] = 0.72
            if abs(x) > 0.45 and step['y'] < 0.1:
                step['y'] = 0.12
            step['speed'] = min(float(step.get('speed') or 0.5), 0.38)
            notes.append(f'Adjusted move at step {idx + 1} to reduce collision risk.')

    reindex_steps(task_payload)
    return notes

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
        sock.settimeout(0.2)
        return sock.connect_ex(('127.0.0.1', port)) == 0

def find_pids_on_port(port: int) -> list[int]:
    if os.name == 'nt':
        cmd = f'netstat -ano -p tcp | findstr :{port}'
        proc = subprocess.run(
            ['cmd', '/c', cmd],
            capture_output=True,
            text=True,
            check=False,
        )
        lines = proc.stdout.splitlines()
        pids: set[int] = set()
        for line in lines:
            parts = line.split()
            if len(parts) < 5:
                continue
            local_addr = parts[1]
            state = parts[3].upper() if len(parts) > 4 else ''
            pid_raw = parts[-1]
            if not local_addr.endswith(f':{port}'):
                continue
            if state != 'LISTENING':
                continue
            if pid_raw.isdigit():
                pids.add(int(pid_raw))
        return list(pids)

    proc = subprocess.run(
        ['lsof', '-ti', f'tcp:{port}'],
        capture_output=True,
        text=True,
        check=False,
    )
    return [int(line.strip()) for line in proc.stdout.splitlines() if line.strip().isdigit()]

def terminate_process(pid: int) -> None:
    if pid == os.getpid():
        return
    if os.name == 'nt':
        subprocess.run(['taskkill', '/PID', str(pid), '/F'], capture_output=True, check=False)
        return
    os.kill(pid, signal.SIGTERM)

def ensure_port_available(port: int, retries: int = 10, wait_ms: int = 250) -> None:
    if not is_port_in_use(port):
        return

    pids = find_pids_on_port(port)
    for pid in pids:
        terminate_process(pid)

    for _ in range(retries):
        if not is_port_in_use(port):
            return
        time.sleep(wait_ms / 1000)

    raise RuntimeError(f'Port {port} is still occupied after automatic cleanup')

configure_provider()

GEMINI_MODELS = build_model_candidates()

_RATE_WINDOW_SEC = 60
_RATE_MAX_CALLS = 30
rate_buckets = defaultdict(list)

def is_quota_or_rate_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return (
        'quota exceeded' in msg
        or 'rate limit' in msg
        or 'resource_exhausted' in msg
        or '429' in msg
    )

def is_model_unavailable_error(exc: Exception) -> bool:
    msg = str(exc).lower()
    return (
        'not found for api version' in msg
        or 'not supported for generatecontent' in msg
        or '404' in msg
    )

def allow_request(ip: str) -> bool:
    now = time.time()
    bucket = rate_buckets[ip]
    while bucket and now - bucket[0] > _RATE_WINDOW_SEC:
        bucket.pop(0)
    if len(bucket) >= _RATE_MAX_CALLS:
        return False
    bucket.append(now)
    return True

@app.middleware('http')
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['Referrer-Policy'] = 'strict-origin-when-cross-origin'
    response.headers['Permissions-Policy'] = 'microphone=(self)'
    return response

@app.get('/health')
def health_check():
    return {
        'status': 'ok',
        'provider': GEMINI_PROVIDER,
        'gemini_key_loaded': bool(GEMINI_API_KEY),
        'vertex_project_id': VERTEX_PROJECT_ID,
        'vertex_location': VERTEX_LOCATION,
        'model': GEMINI_MODEL,
        'resolved_models': GEMINI_MODELS,
        'fallback_models': GEMINI_MODELS[1:],
    }

def build_startup_test_payload() -> dict[str, Any]:
    return {
        'user_input': 'Pick up cylinder A and place it on the shelf',
        'arm_context': {
            'segments': [
                {'name': 'Base', 'length': 0.34, 'mass': 0.8, 'jointLimits': {'min': -180, 'max': 180}},
                {'name': 'Mid', 'length': 0.31, 'mass': 0.6, 'jointLimits': {'min': -135, 'max': 135}},
                {'name': 'Top', 'length': 0.27, 'mass': 0.4, 'jointLimits': {'min': -120, 'max': 120}},
            ],
            'gripper': {'type': 'parallel', 'forceRange': {'min': 0, 'max': 100}},
            'maxReach': 1.02,
            'payloadLimit': 2.0,
            'jointCount': 3,
        },
        'scene_objects': [
            'Cylinder A (cylinder-a) type=cylinder pos=(0.320,0.060,0.180) size=(0.060,0.120,0.060)',
            'Shelf (shelf-zone) zone pos=(0.420,0.240,0.280) radius=0.090',
        ],
        'allowed_verbs': ['pick', 'place', 'move', 'stack', 'sort'],
    }

async def wait_for_local_server(base_url: str, retries: int = 20, delay_sec: float = 0.5) -> None:
    timeout = httpx.Timeout(5.0)
    async with httpx.AsyncClient(base_url=base_url, timeout=timeout) as client:
        last_exc: Exception | None = None
        for _ in range(retries):
            try:
                response = await client.get('/health')
                if response.status_code == 200:
                    return
            except Exception as exc:
                last_exc = exc
            await asyncio.sleep(delay_sec)
        if last_exc is not None:
            raise RuntimeError(f'Local server did not become healthy: {last_exc}')
        raise RuntimeError('Local server did not become healthy')

async def run_startup_endpoint_tests() -> None:
    if os.getenv('MIRAI_STARTUP_SELF_TEST', '1').strip().lower() not in ('1', 'true', 'yes', 'on'):
        return

    payload = build_startup_test_payload()
    base_url = os.getenv('MIRAI_SELF_TEST_BASE_URL', 'http://127.0.0.1:8000')
    timeout = httpx.Timeout(120.0)

    await wait_for_local_server(base_url)

    async with httpx.AsyncClient(base_url=base_url, timeout=timeout) as client:
        plan_response = await client.post('/ai/plan', json=payload)
        if plan_response.status_code != 200:
            raise RuntimeError(f'/ai/plan self-test failed with status {plan_response.status_code}')

        task = None
        preflight = None
        async for line in plan_response.aiter_lines():
            if not line.startswith('data: '):
                continue
            blob = line[6:].strip()
            if blob == '[DONE]':
                break
            event = json.loads(blob)
            if event.get('type') == 'task_spec':
                task = event.get('task')
                preflight = event.get('preflight')

        if not task:
            raise RuntimeError('/ai/plan self-test did not return task_spec payload')

        repair_response = await client.post(
            '/ai/repair',
            json={
                'task_spec': task,
                'failures': (preflight or {}).get('errors', []),
                'arm_context': payload['arm_context'],
            },
        )
        if repair_response.status_code != 200:
            raise RuntimeError(f'/ai/repair self-test failed with status {repair_response.status_code}')

        suggest_response = await client.post(
            '/ai/suggest',
            json={
                'user_input': payload['user_input'],
                'arm_context': payload['arm_context'],
                'scene_objects': payload['scene_objects'],
                'task_spec': task,
                'preflight': preflight or {'is_safe': True, 'errors': [], 'warnings': []},
            },
        )
        if suggest_response.status_code != 200:
            raise RuntimeError(f'/ai/suggest self-test failed with status {suggest_response.status_code}')

        suggestions = suggest_response.json().get('suggestions', [])
        if not isinstance(suggestions, list):
            raise RuntimeError('/ai/suggest self-test returned invalid suggestions payload')

        logger.info('Startup self-test passed for /ai/plan, /ai/repair, and /ai/suggest')

async def run_startup_endpoint_tests_safe() -> None:
    try:
        await run_startup_endpoint_tests()
    except Exception as exc:
        logger.error('Startup self-test failed: %s', exc)
        if os.getenv('MIRAI_STARTUP_SELF_TEST_STRICT', '1').strip().lower() in ('1', 'true', 'yes', 'on'):
            raise

@app.on_event('startup')
async def startup_self_test() -> None:
    asyncio.create_task(run_startup_endpoint_tests_safe())

@app.post('/ai/plan', response_class=StreamingResponse)
async def stream_task_plan(request: Request, payload: TaskSpecRequest):
    ip = request.client.host if request.client else 'unknown'
    if not allow_request(ip):
        raise HTTPException(status_code=429, detail='Rate limit exceeded')

    if len(payload.user_input) > 500:
        raise HTTPException(status_code=400, detail='Input too long')

    arm_context = ArmContextBuilder.build_from_frontend_state(
        payload.arm_context.segments,
        payload.arm_context.gripper.type
    )
    system_prompt, user_prompt = GeminiPromptAssembler.build_planning_prompt(
        payload.user_input,
        arm_context,
        payload.scene_objects
    )

    async def event_generator() -> AsyncGenerator[str, None]:
        try:
            full_response = ''
            last_exc: Exception | None = None

            for idx, model_name in enumerate(GEMINI_MODELS):
                try:
                    full_response = ''

                    for chunk in generate_stream(model_name, system_prompt, user_prompt):
                        text = extract_chunk_text(chunk)
                        if not text:
                            continue
                        full_response += text

                        lower = full_response.lower()
                        if 'think:' in lower:
                            yield 'data: ' + json.dumps({'type': 'react_step', 'phase': 'think', 'content': 'Analyzing task intent'}) + '\n\n'
                        if 'act:' in lower:
                            yield 'data: ' + json.dumps({'type': 'react_step', 'phase': 'act', 'content': 'Building executable motion steps'}) + '\n\n'
                        if 'observe:' in lower:
                            yield 'data: ' + json.dumps({'type': 'react_step', 'phase': 'observe', 'content': 'Checking feasibility and safety'}) + '\n\n'

                        yield 'data: ' + json.dumps({'type': 'chunk', 'content': text}) + '\n\n'

                    # Successfully generated on this model.
                    break
                except Exception as exc:
                    last_exc = exc
                    should_fallback = (
                        (is_quota_or_rate_error(exc) or is_model_unavailable_error(exc))
                        and idx < len(GEMINI_MODELS) - 1
                    )
                    if should_fallback:
                        continue
                    raise

            if not full_response and last_exc is not None:
                raise last_exc

            task_dict_raw = extract_json_dict(full_response)
            task_seed = normalize_task_payload(task_dict_raw)

            # Autonomous deterministic normalization before first validation.
            normalization_notes = []
            normalization_notes.extend(ensure_pickup_flow(task_seed, payload.user_input))
            normalization_notes.extend(enforce_pickup_target_consistency(task_seed))
            if normalization_notes:
                task_seed['warnings'] = list(dict.fromkeys(list(task_seed.get('warnings', [])) + normalization_notes))

            task_spec = TaskSpec(**task_seed)
            preflight = SafetyValidator.validate_task_spec(task_spec, arm_context)

            # Deterministic + model-guided repair loop.
            repair_iterations = 0
            max_repair_iterations = 4
            while preflight.errors and repair_iterations < max_repair_iterations:
                repair_iterations += 1
                repair_prompt = build_repair_prompt(task_spec.model_dump(by_alias=True), preflight.errors, arm_context)

                repair_text = ''
                repair_last_exc: Exception | None = None
                for idx, model_name in enumerate(GEMINI_MODELS):
                    try:
                        repair_text = generate_text(model_name, repair_prompt)
                        break
                    except Exception as exc:
                        repair_last_exc = exc
                        should_fallback = (
                            (is_quota_or_rate_error(exc) or is_model_unavailable_error(exc))
                            and idx < len(GEMINI_MODELS) - 1
                        )
                        if should_fallback:
                            continue
                        raise

                if not repair_text and repair_last_exc is not None:
                    raise repair_last_exc

                repaired_raw = extract_json_dict(repair_text)
                repaired_payload = normalize_task_payload(repaired_raw, task_spec.model_dump(by_alias=True))

                loop_notes = []
                loop_notes.extend(ensure_pickup_flow(repaired_payload, payload.user_input))
                loop_notes.extend(enforce_pickup_target_consistency(repaired_payload))
                if loop_notes:
                    repaired_payload['warnings'] = list(
                        dict.fromkeys(list(repaired_payload.get('warnings', [])) + loop_notes)
                    )

                task_spec = TaskSpec(**repaired_payload)
                preflight = SafetyValidator.validate_task_spec(task_spec, arm_context)

                if preflight.errors and repair_iterations >= 2:
                    deterministic_notes = apply_deterministic_refinements(
                        repaired_payload,
                        [err.model_dump() for err in preflight.errors],
                        arm_context.max_reach,
                    )
                    if deterministic_notes:
                        repaired_payload['warnings'] = list(
                            dict.fromkeys(list(repaired_payload.get('warnings', [])) + deterministic_notes)
                        )
                        task_spec = TaskSpec(**repaired_payload)
                        preflight = SafetyValidator.validate_task_spec(task_spec, arm_context)

            if preflight.errors:
                raise RuntimeError(
                    'Unable to produce a fully safe plan after iterative repair. '
                    'Try simplifying the command or allowing automatic arm reconfiguration.'
                )

            payload_out = {
                'type': 'task_spec',
                'task': task_spec.model_dump(by_alias=True),
                'preflight': preflight.model_dump(),
            }
            yield 'data: ' + json.dumps(payload_out) + '\n\n'
            yield 'data: [DONE]\n\n'
        except Exception as exc:
            yield 'data: ' + json.dumps({'type': 'error', 'error': str(exc)}) + '\n\n'
            yield 'data: [DONE]\n\n'

    return StreamingResponse(event_generator(), media_type='text/event-stream')

@app.post('/ai/repair')
async def repair_failing_task(request: Request, payload: RepairRequest):
    ip = request.client.host if request.client else 'unknown'
    if not allow_request(ip):
        raise HTTPException(status_code=429, detail='Rate limit exceeded')

    if not payload.failures:
        repaired_payload = payload.task_spec.model_dump(by_alias=True)
        repaired_payload['warnings'] = list(
            dict.fromkeys(
                list(repaired_payload.get('warnings', []))
                + ensure_pickup_flow(repaired_payload, repaired_payload.get('taskDescription', ''))
                + enforce_pickup_target_consistency(repaired_payload)
            )
        )
        repaired = TaskSpec(**normalize_task_payload(repaired_payload, repaired_payload))
        preflight = SafetyValidator.validate_task_spec(repaired, payload.arm_context)
        return {
            'repaired_task': repaired.model_dump(by_alias=True),
            'preflight': preflight.model_dump(),
        }

    task_seed = payload.task_spec.model_dump(by_alias=True)
    repair_prompt = build_repair_prompt(task_seed, payload.failures, payload.arm_context)

    try:
        text = ''
        last_exc: Exception | None = None

        for idx, model_name in enumerate(GEMINI_MODELS):
            try:
                text = generate_text(model_name, repair_prompt)
                break
            except Exception as exc:
                last_exc = exc
                should_fallback = (
                    (is_quota_or_rate_error(exc) or is_model_unavailable_error(exc))
                    and idx < len(GEMINI_MODELS) - 1
                )
                if should_fallback:
                    continue
                raise

        if not text and last_exc is not None:
            raise last_exc

        repaired_dict_raw = extract_json_dict(text)
        repaired_payload = normalize_task_payload(repaired_dict_raw, task_seed)
        repaired_payload['warnings'] = list(
            dict.fromkeys(
                list(repaired_payload.get('warnings', []))
                + ensure_pickup_flow(repaired_payload, repaired_payload.get('taskDescription', ''))
                + enforce_pickup_target_consistency(repaired_payload)
            )
        )

        max_repair_passes = 5
        preflight = None
        for _ in range(max_repair_passes):
            repaired_spec = TaskSpec(**repaired_payload)
            preflight = SafetyValidator.validate_task_spec(repaired_spec, payload.arm_context)
            if not preflight.errors:
                break

            deterministic_notes = apply_deterministic_refinements(
                repaired_payload,
                [err.model_dump() for err in preflight.errors],
                payload.arm_context.max_reach,
            )
            if not deterministic_notes:
                break

            repaired_payload['warnings'] = list(
                dict.fromkeys(list(repaired_payload.get('warnings', [])) + deterministic_notes)
            )

        repaired = TaskSpec(**repaired_payload)
        final_preflight = SafetyValidator.validate_task_spec(repaired, payload.arm_context)

        return {
            'repaired_task': repaired.model_dump(by_alias=True),
            'preflight': final_preflight.model_dump(),
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail='Repair failed: ' + str(exc))

@app.post('/ai/suggest', response_model=SuggestResponse)
async def suggest_motion_improvements(request: Request, payload: SuggestRequest):
    ip = request.client.host if request.client else 'unknown'
    if not allow_request(ip):
        raise HTTPException(status_code=429, detail='Rate limit exceeded')

    deterministic = deterministic_suggestions_from_preflight(
        payload.preflight.model_dump() if payload.preflight else None
    )

    prompt = build_suggest_prompt(
        payload.user_input,
        payload.arm_context.model_dump(by_alias=True),
        payload.scene_objects,
        payload.task_spec.model_dump(by_alias=True) if payload.task_spec else None,
        payload.preflight.model_dump() if payload.preflight else None,
    )

    gemini_suggestions: list[str] = []
    last_exc: Exception | None = None

    for idx, model_name in enumerate(GEMINI_MODELS):
        try:
            text = generate_text(model_name, prompt)
            gemini_suggestions = parse_suggestions_text(text)
            break
        except Exception as exc:
            last_exc = exc
            should_fallback = (
                (is_quota_or_rate_error(exc) or is_model_unavailable_error(exc))
                and idx < len(GEMINI_MODELS) - 1
            )
            if should_fallback:
                continue
            break

    merged = []
    seen: set[str] = set()
    for message in gemini_suggestions + deterministic:
        cleaned = str(message).strip()
        if not cleaned:
            continue
        if cleaned in seen:
            continue
        seen.add(cleaned)
        merged.append(cleaned)

    if not merged and last_exc is not None:
        raise HTTPException(status_code=500, detail='Suggestion generation failed: ' + str(last_exc))

    source = 'hybrid'
    if merged and deterministic and not gemini_suggestions:
        source = 'deterministic'
    elif merged and gemini_suggestions and not deterministic:
        source = 'gemini'

    return SuggestResponse(suggestions=merged[:6], source=source)

if __name__ == '__main__':
    import uvicorn
    ensure_port_available(8000)
    uvicorn.run(app, host='0.0.0.0', port=8000)