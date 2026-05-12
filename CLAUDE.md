# CLAUDE.md — Mirai Project Depth Details
## Transforming Enterprise Through AI Hackathon | May 11–19, 2026

> This file is for AI assistants (Claude, Copilot, etc.) to quickly understand the full project context without reading multiple files.

---

## IDENTITY

- **Project:** Mirai (未来 — "Future")
- **Developer:** Francis Daniel (GitHub: Mizunandayo, handle: Mizu)
- **Hackathon:** Transforming Enterprise Through AI by lablab.ai
- **Tracks:** Track 3 — Robotics & Simulation (prize-eligible) + Gemini Award (partner award — can win both)
- **Prize Target:** $2,000–$5,000 (Track 3) + Gemini Award (Best Gemini Integration)
- **Hard Deadline:** May 19, 2026 — 8:00 AM PST (Philippine Standard Time)
- **Venue:** San Jose McEnery Convention Center, CA, USA (live demo)
- **Repo:** https://github.com/Mizunandayo/mirai
- **Submission platform:** lablab.ai

---

## WHAT MIRAI DOES

Browser-based AI-powered robot arm simulator that makes robotics accessible to everyone — zero install, zero coding required.

**Core flow:**
1. User designs a robot arm in 3D (segment panel, gripper library, joint config)
2. Types or speaks a task in plain English ("pick up socks and fold them into the drawer")
3. Gemini grounds the request against the current arm + scene and returns a structured `TaskSpec`
4. Mirai verifies and repairs unsafe or unreachable steps, then compiles them into deterministic motion skills
5. Rapier WASM physics engine simulates the verified plan at 60fps in the browser
6. MuJoCo (server-side) validates accuracy and predicts servo lifespan
7. User downloads Arduino `.ino` / Python `.py` code + BOM to build for under $300

**The key differentiator:** Zero setup, natural language input, real physics validation, community task sharing, bridge to real hardware — all in one browser tab.

**Execution truth (must stay true):**
- Gemini never drives joints or servos directly.
- Mirai converts language into `SceneGraph -> TaskSpec -> ValidationReport -> ExecutionPlan`.
- A deterministic verifier can reject or repair plans before any physics runs.
- V1 natural-language support starts with rigid-object verbs (`pick`, `place`, `stack`, `sort`, `move`) plus one curated cloth-folding demo, not arbitrary open-world commands.

---

## ACTUAL DAY PROGRESS

| Day | Date | Blueprint Plan | What Was Actually Done |
|---|---|---|---|
| 1 | May 11 | Foundation + 3D Engine | ✅ Scaffold + dependencies + git push complete |
| 2 | May 12 | Arm Design Studio | ✅ **COMPLETE** — All 12 files created, types defined, atoms/utils/components full stack, React 18 downgrade applied, app live at localhost:5173, TypeScript clean |
| 3 | May 13 | Task Editor (React Flow) | 🔄 IN PROGRESS — Implementation guide written, user coding |
| 4 | May 14 | Physics Simulation (Rapier) | ⏳ Ready to Start |
| 5 | May 15 | Gemini AI Integration | ⏳ Ready to Start |
| 6 | May 16 | Backend + MuJoCo + Export | ⏳ Ready to Start |
| 7 | May 17 | Community + Famous Preloads | ⏳ Ready to Start |
| 8 | May 18–19 | Polish + Demo Prep + Submit | ⏳ Ready to Start |

**STATUS:** Day 1 and Day 2 both complete (incl. extended polish: nav toggle, camera reset, hint, BOM expanded layout, panel drag-resize). App live at localhost:5173. TypeScript clean. Day 3 (Task Editor) starts next.

---

## FULL TASK LIST (by day)

### Day 1 (May 11) — Foundation + 3D Engine ✅ COMPLETE

- ✅ GitHub repo created: `github.com/Mizunandayo/mirai`
- ✅ `package.json` — all frontend deps declared
- ✅ `vite.config.js`, `tsconfig.json`, `index.html`
- ✅ `tailwind.config.js`, `.gitignore`, `README.md`, `.env.example`
- ✅ `backend/.env` — GEMINI_API_KEY, JWT_SECRET, DATABASE_URL
- ✅ `server/requirements.txt` — mujoco>=3.1.0 (upgraded from PyBullet)
- ✅ `src/components/ArmViewer.tsx` — R3F canvas, OrbitControls, Physics wrapper, Grid
- ✅ `src/components/RobotArm.tsx` — base cylinder, 2 segments, end-effector sphere
- ✅ `src/App.tsx` — root component with ArmViewer mounted
- ✅ `src/store/atoms.ts` — Jotai atoms: armSegments, gripper, task, simulation, community, Gemini state
- ✅ `server/main.py` — FastAPI skeleton, CORS, health check + Gemini key status
- ✅ `npm install --legacy-peer-deps`
- ✅ `pip install -r server/requirements.txt`
- ✅ `git init` + push to remote
- ✅ `isAdvancedModeAtom` added to `atoms.ts`
- ✅ Segment click-to-select highlight coded

### Day 2 (May 12) — Arm Design Studio ✅ COMPLETE

**Terminal commands:**
- ✅ `npm install --legacy-peer-deps`
- ✅ `pip install -r server/requirements.txt`
- ✅ `git init ; git remote add origin https://github.com/Mizunandayo/mirai.git ; git push -u origin main`
- ✅ `npm run dev` → app renders at localhost:5173
- ✅ React 18.3.1 + react-dom 18.3.1 downgrade (R3F v8 compatibility)
- ✅ `npx tsc --noEmit` passes with zero errors

**Config fixes:**
- ✅ `vite.config.js` — rewritten to use `@tailwindcss/vite` plugin
- ✅ `src/index.css` — `@import "tailwindcss"` + `@theme {}` design tokens
- ✅ `src/main.tsx` — imports both `./index.css` and `./App.css`
- ✅ `src/vite-env.d.ts` — React 18 JSX augmentation for R3F elements

**Files created:**
- ✅ `src/types/arm.ts` — ArmSegment, GripperConfig, BOMItem, ValidationResult, ArmConfig types
- ✅ `src/store/atoms.ts` — fully typed atoms: armSegments, armGripper, selectedSegmentId, isAdvancedMode, showReachEnvelope, showJointArcs, activeDesignerTab, armName
- ✅ `src/utils/armPhysics.ts` — calculateMaxReach(), calculateTorqueAtJoint(), validateArm()
- ✅ `src/utils/bomPricing.ts` — calculateBOM(), getTotalBOMCost() with 72-piece fixed BOM
- ✅ `src/utils/armExport.ts` — exportArmConfig(), parseArmConfig(), loadArmConfigFromFile()
- ✅ `src/components/ReachEnvelope.tsx` — wireframe reach sphere + 80% inner reference
- ✅ `src/components/JointArcOverlay.tsx` — orange arc + fill for joint rotation limits
- ✅ `src/components/RobotArm.tsx` — dynamic 3-segment arm with click-to-select, gripper variants
- ✅ `src/components/ArmViewer.tsx` — full R3F scene with camera, lights, grid, shadows, overlays
- ✅ `src/App.tsx` — 3-zone layout: header + sidebar + viewport + statusbar with mode toggle
- ✅ `src/App.css` — engineering workstation design system (~880 lines, all section groups)
- ✅ `src/components/arm-designer/ArmDesignerPanel.tsx` — main sidebar with arm name, save/load, viewport toggles
- ✅ `src/components/arm-designer/SegmentList.tsx` — add/remove/edit segments with sliders
- ✅ `src/components/arm-designer/GripperLibrary.tsx` — parallel jaw / suction cup / magnetic selector
- ✅ `src/components/arm-designer/ValidationPanel.tsx` — torque/reach metrics + error/warning display
- ✅ `src/components/arm-designer/BOMCounter.tsx` — live total cost + expandable BOM breakdown

**Deliverable:** Full arm designer live in browser. BOM counter shows live cost. Reach envelope and joint arcs toggle in viewport. Arm click-to-select, gripper swap, segment edit all functional.
- ✅ `src/components/arm-designer/ArmDesignerPanel.tsx` — composes all sidebar sections

**Full rewrites:**
- ✅ `src/components/RobotArm.tsx` — dynamic segments from atoms, click-to-select
- ✅ `src/components/ArmViewer.tsx` — lights, shadows, ReachEnvelope, JointArcOverlay
- ✅ `src/App.tsx` — full 3-zone layout (header + sidebar + viewport + statusbar)
- ✅ `src/App.css` — full engineering-workstation design system

**UI/UX redesigns (this session):**
- ✅ `src/App.css` — header third redesign: single-row `hdr-*` namespace, 58px dark bar, sliding CSS mode toggle
- ✅ `src/App.css` — full panel minimalist overhaul: flat tiles (9px radius, hairline borders), underline tabs (`#c4694a`), controls at 32px, BOM inline footer
- ✅ `src/App.css` + `ArmDesignerPanel.tsx` — panel structure overhaul: `panel-topbar` (arm name + file actions), `panel-toolbar` (tabs + icon guide buttons), removed intro/context/toggle sections
- ✅ `src/components/arm-designer/SegmentList.tsx` — simplified section header (count left, + Add right)
- ✅ `src/components/arm-designer/GripperLibrary.tsx` — removed redundant section heading

**Extended Day 2 UX polish (late session):**
- ✅ `src/App.tsx` + `ArmDesignerPanel.tsx` — nav-click toggles panel: clicking the active nav item collapses/expands the panel with smooth CSS width transition
- ✅ `src/components/ArmViewer.tsx` — converted to `forwardRef`; `useImperativeHandle` exposes `resetCamera()` via `ArmViewerHandle` type
- ✅ `src/App.tsx` + `src/App.css` — viewport camera reset button (top-right, spin animation on click)
- ✅ `src/App.tsx` + `src/App.css` — dismissable viewport hint pill (top-right, left of reset button, SVG close icon)
- ✅ `src/App.css` — BOM expanded: CSS `:has()` collapses `.panel-toolbar` + `.panel-content`, grows `.panel-footer` to fill full panel height
- ✅ `src/App.css` — BOM text: Poppins, no gray text (`#aaa` → `#555`/`#1a1a1a`), no small text (all bumped to 0.72–0.82rem)
- ✅ `src/components/arm-designer/BOMCounter.tsx` — when expanded: `bom-breakdown` (parts list) shows at top, `bom-summary` (Estimated cost row) moves to bottom via CSS `order`; `bom-total-row` removed
- ✅ `src/components/arm-designer/ArmDesignerPanel.tsx` + `src/App.css` — panel right-edge drag-to-resize: `panel-resize-handle` with pointer capture, min `336px`, max `560px`, no-transition while dragging

### Day 3 (May 13) — Task Editor (React Flow)

**Architecture:**
- `@xyflow/react` v12 (already installed — no new install)
- `ReactFlowProvider` + inner `FlowEditor` pattern for `useReactFlow()` access
- Jotai `pendingAddNodeAtom` for palette → canvas click-to-add communication
- `window.dispatchEvent('mirai:load-task')` for load-from-file → canvas communication
- `ghostArmTargetAtom` pre-wired — consumed by ArmViewer on Day 4

**New files to implement:**
- ❌ `src/types/task.ts` — SceneGraph, TaskSpec, TaskBlock, ValidationReport, ExecutionPlan
- ❌ `src/utils/sceneRegistry.ts` — default scene objects + target zones
- ❌ `src/store/taskAtoms.ts` — taskNodes, taskEdges, pendingAddNode, ghostArmTarget
- ❌ `src/utils/taskValidation.ts` — validateTask() pure function
- ❌ `src/utils/taskExport.ts` — exportTaskJson(), parseTaskJson(), loadTaskFromFile()
- ❌ `src/components/task-editor/nodes/` — 7 node types (Start, End, Move, Grip, Wait, Loop, If)
- ❌ `src/components/task-editor/NodePalette.tsx`
- ❌ `src/components/task-editor/TaskEditorPanel.tsx`
- ❌ `src/components/task-editor/TaskFlowCanvas.tsx`

**Modified files:**
- ❌ `src/main.tsx` — add `@xyflow/react/dist/style.css` import
- ❌ `src/App.tsx` — TaskEditorPanel + TaskFlowCanvas wired into tasks nav
- ❌ `src/App.css` — task-*, palette-*, flow-* styles appended

**Deliverable:** Visual task programmer with 7 node types, validation, drag-to-add palette, Ctrl+S export, Ctrl+Z undo, portable JSON download.

### Day 4 (May 14) — Physics Simulation (Rapier WASM)

- ❌ Rapier rigid body per arm segment (Box + Cylinder colliders)
- ❌ Joint constraints — revolute (rotating), prismatic (sliding)
- ❌ Task executor — reads task JSON blocks, drives simulation frame-by-frame
- ❌ Motion compiler — `TaskSpec` → deterministic motion primitives and execution frames
- ❌ Browser skill executor — reliable support for pick/place/stack scenarios before cloth
- ❌ Playback controls — play / pause / rewind / step-frame / speed 0.25x–4x
- ❌ Timeline scrubber — click any frame to jump
- ❌ Joint angle HUD — J1–J5 angles + gripper state live during playback
- ❌ Physics metrics panel — torque, velocity, acceleration per joint
- ❌ Collision highlight — red mesh flash + auto-rewind to collision frame
- ❌ Path trail — glowing trajectory line behind end-effector
- ❌ Environment objects — table, shelf, box, sock pile, drawer

**Deliverable:** Smooth 60fps physics simulation. Collision detection working.

### Day 5 (May 15) — Gemini AI Integration 🏆 CRITICAL DAY

**Core AI:**
- ❌ FastAPI `POST /ai/plan` endpoint — Gemini Flash integration
- ❌ FastAPI `POST /ai/repair` endpoint — constrained repair loop for invalid or unsafe plans
- ❌ Arm-aware prompt construction (injects arm specs into every call)
- ❌ Grounded prompt builder — injects `SceneGraph`, arm profile, and allowed skill list into every request
- ❌ Structured JSON output parsing + validation
- ❌ TaskSpec-only output contract — Gemini returns typed skills, never direct joint commands
- ❌ Static verifier loop — reach, payload, collision, and precondition checks before simulation
- ❌ Auto-populate React Flow canvas from Gemini-returned task JSON
- ❌ Conversational refinement — "make it slower at step 3"
- ❌ Gemini Pro error diagnosis — plain English failure explanation
- ❌ Loading states + streaming indicator + error handling
- ❌ Supported-language scope v1 — `pick`, `place`, `stack`, `sort`, `move`; cloth folding ships only as curated scenario

**Gemini Award Critical Features:**
- ❌ **Voice input** — record audio → Gemini multimodal → task program (demo wow moment)
- ❌ **AI confidence score badge** — "87% confident — J3 near limit at step 4"
- ❌ **Side-by-side mode** — simulation left, live generated code right, synced
- ❌ **Pre-flight safety check** — Gemini audits task + [Fix All with AI] one-click repair
- ❌ **Agentic ReAct loop** — Think→Act→Observe for complex multi-step tasks 🏆
- ❌ **ReAct UI panel** — visible sidebar showing live agent thinking steps 🏆
- ❌ **Natural language arm designer** — "arm reaching 1.2m that lifts 500g" → full config

**Deliverable:** Voice → ReAct loop → pre-flight → confidence score → simulation. Judges MUST see the agent think.

### Day 6 (May 16) — Backend + MuJoCo + Export

**Backend & Physics:**
- ❌ FastAPI backend deployed to Railway (Docker)
- ❌ WebSocket `WS /ws/simulate` — MuJoCo frame streaming
- ❌ MuJoCo MJCF/URDF builder from arm config
- ❌ Task executor in MuJoCo (same task JSON as Rapier)
- ❌ MuJoCo validator consumes the same `ExecutionPlan` produced for Rapier playback
- ❌ Accuracy comparison badge ("94% accurate") in UI
- ❌ Confidence report derived from validation + rule checks, not raw LLM optimism
- ❌ **Physics side-by-side replay** — Rapier (left) vs. MuJoCo (right), divergence frames in red
- ❌ **Servo lifespan predictor** — torque data → predicted hours per joint

**Export:**
- ❌ Jinja2 code gen — Arduino `.ino` + Python `.py` templates (NOT LLM — deterministic)
- ❌ BOM generator from arm config with live AliExpress/Amazon pricing
- ❌ URDF export (ROS2-compatible)
- ❌ **QR code generator** — scan → hosted BOM + code page instantly
- ❌ **Signed export** — SHA-256 hash header in every downloaded file
- ❌ ZIP bundle — code + BOM + wiring diagram in one `.zip`

**Deliverable:** Dual physics live. Servo lifespan shown. Signed downloads. Judges scan QR on stage.

### Day 7 (May 17) — Community + Famous Preloads + Bonus

**Community (browse-only, no auth needed):**
- ❌ Browse page — grid with 3D mini-previews
- ❌ One-click import — Gemini adapts community task to YOUR arm + compatibility %
- ❌ Seeded library — 12 tasks (sock folding, mail sorting, box packing, etc.)

**Famous Preloads (high demo impact):**
- ❌ Boston Dynamics inspection task
- ❌ Tesla Optimus box-stacking task
- ❌ Toyota laundry folding task

**Quality:**
- ❌ Full E2E test: design → voice → pre-flight → simulate → side-by-side → export → QR
- ❌ 60fps confirmed on mid-range hardware

**Bonus (only if Day 5–6 ahead):**
- ❌ WebSerial live control (5h) — browser → Arduino USB → real servo moves on stage
- ❌ GIF simulation export (2h) — one-click animated GIF

### Day 8 (May 18–19) — Polish + Demo Prep + Submit

**Testing:**
- ❌ Full E2E test
- ❌ Verify SHA-256 hash in downloaded `.ino`
- ❌ 60fps confirmed on mid-range laptop (venue machine)
- ❌ Voice input tested on demo hardware + fallback confirmed

**Deployment:**
- ❌ Frontend → Vercel (production URL)
- ❌ FastAPI → Railway (production URL, Docker)
- ❌ Sentry error tracking on both
- ❌ Demo mode — "sock folding" pre-loaded as landing state

**Submission:**
- ❌ Record 2-min demo video (design → voice → pre-flight → simulate → side-by-side → QR)
- ❌ Slide deck (5 slides: problem → solution → demo → market → impact)
- ❌ README.md final pass — screenshots + live demo link
- ❌ Repo cleanup — no `.env`, no `node_modules`, no debug logs
- ❌ **Submit to lablab.ai before 8:00 AM PST May 19** ← HARD DEADLINE

---

## TECH STACK

| Layer | Technology | Version | Notes |
|---|---|---|---|
| Frontend | React + TypeScript strict | 19 / 6.0 | |
| 3D | React Three Fiber + @react-three/drei | 8.16 / 9.120 | |
| Client physics | @react-three/rapier (Rapier WASM) | 0.12 | 60fps in-browser |
| Server physics | MuJoCo | 3.x | Server-side validation only |
| AI | Gemini 2.0 Flash + Gemini 2.0 Pro | — | Flash = fast text/voice; Pro = ReAct planning |
| AI SDK | @google/generative-ai | 0.21.0 | |
| Visual programming | reactflow | 12 | Listed as `reactflow` in package.json |
| State | Jotai | 2.19 | |
| Backend | FastAPI | 0.115 | |
| Code export | Jinja2 | 3.1.4 | Deterministic — NOT LLM |
| Database | SQLite + SQLAlchemy | 2.0 | |
| Styling | TailwindCSS v4 + Framer Motion | 4.2 / 12 | |
| Build | Vite | 7 | Port 5173 (strictPort) |
| Deploy | Vercel (frontend) + Railway (backend) | — | |
| Desktop wrapper | Tauri v2 | 2 | Web-first for demo |

---

## FILE STRUCTURE (current state)

```
mirai/
├── CLAUDE.md                    # This file
├── MIRAI_BLUEPRINT.md           # Full design blueprint (v2.0)
├── MIRAI_SESSION_CONTEXT.md     # Session context / operational notes
├── package.json                 # All frontend deps declared (npm install NOT yet run)
├── vite.config.js               # Vite 7, port 5173 strictPort, TailwindCSS via postcss
├── tsconfig.json                # TypeScript strict
├── tailwind.config.js           # Tailwind config
├── index.html                   # Entry HTML
├── README.md                    # Project README
├── backend/
│   └── .env                     # GEMINI_API_KEY, JWT_SECRET, DATABASE_URL (gitignored)
├── server/
│   ├── main.py                  # FastAPI skeleton — CORS, health check, Gemini key check
│   └── requirements.txt         # fastapi, uvicorn, mujoco>=3.1.0, google-generativeai, jinja2, sqlalchemy...
└── src/
    ├── App.tsx                  # Root component — ArmViewer mounted, gray-900 layout
    ├── App.css
    ├── main.tsx                 # React entry point
    ├── components/
    │   ├── ArmViewer.tsx        # R3F Canvas, OrbitControls (autoRotate), Physics wrapper, Grid, lights
    │   └── RobotArm.tsx         # Static 3-segment arm: base cylinder + 2 boxes + end-effector sphere
    └── store/
        └── atoms.ts             # Jotai atoms: armSegments(3), gripper, taskBlocks, simulationFrames, community, gemini
```

**Files that can be deleted:**
- `convert_blueprint.py` — one-time utility, no longer needed
- `MIRAI_BLUEPRINT.html` — PDF conversion artifact, no longer needed

---

## CURRENT BUILD STATUS

| Component | Status | Notes |
|---|---|---|
| package.json | ✅ Complete | All deps declared |
| npm install | ❌ NOT RUN | Run `npm install --legacy-peer-deps` first |
| vite.config.js | ✅ Created | Port 5173 |
| tsconfig.json | ✅ Created | Strict mode |
| tailwind.config.js | ✅ Created | |
| index.html | ✅ Created | |
| src/App.tsx | ✅ Scaffold | ArmViewer mounted, needs full layout |
| src/App.css | ✅ Exists | |
| src/store/atoms.ts | ✅ Scaffold | Placeholder atoms — need proper typing + isAdvancedModeAtom |
| src/components/ArmViewer.tsx | ✅ Scaffold | R3F canvas works, Physics disabled for now |
| src/components/RobotArm.tsx | ✅ Scaffold | Static mesh — not interactive yet |
| server/main.py | ✅ Scaffold | Health check only — no AI endpoints yet |
| server/requirements.txt | ✅ Complete | MuJoCo 3.x included |
| pip install | ❌ NOT RUN | |
| git init + push | ❌ NOT RUN | |
| App renders in browser | ❌ UNTESTED | Blocked by npm install |

---

## GEMINI SETUP

- **One API key** covers all models — `GEMINI_API_KEY` in `backend/.env`
- `gemini-2.0-flash` → real-time text/voice arm design (fast, cheap)
- `gemini-2.0-pro` → multi-step motion planning via ReAct loop (smart, deep reasoning)
- Free tier sufficient for the entire hackathon (solo, 8 days, low volume)
- SDK: `@google/generative-ai` v0.21.0 (frontend) + `google-generativeai` 0.21.0 (backend)

---

## ARCHITECTURE

```
Browser (React + Vite)
  → ArmViewer (React Three Fiber + Rapier WASM)
    → 60fps physics simulation — NO server round-trip
  → Task Editor (React Flow)
    → Visual block programming → task JSON
  → Gemini AI (frontend SDK or via FastAPI)
    → Text/voice → task JSON → populates React Flow
    → ReAct agent loop (Think→Act→Observe)
  → FastAPI backend (server/main.py → Railway)
    → POST /ai/plan — Gemini orchestration
    → WS /ws/simulate — MuJoCo frame streaming
    → GET /export/code — Jinja2 Arduino/Python generation
    → GET /export/bom — Bill of Materials with pricing
    → MuJoCo (Python) validates Rapier simulation
      → Accuracy badge ("94% accurate")
      → Servo lifespan prediction
```

### Dual Physics Strategy
- **Rapier (client):** 60fps real-time, interactive, instant feedback
- **MuJoCo (server):** High-fidelity validation run after task is designed
- UI shows: `"Rapier ✅ 94% accurate | MuJoCo validated"`
- Side-by-side replay: Rapier left, MuJoCo right, divergence frames in red

### Gemini Integration Strategy
- **Single prompt:** text → task JSON (fast path)
- **ReAct loop:** complex tasks → agent iterates Think→Act→Observe until satisfied
- **Multimodal voice:** Web Audio API → Gemini audio input → task JSON
- **Arm-aware:** every prompt injects current arm config (segments, joint limits, reach)

### Natural Language Execution Strategy
- **`SceneGraph`:** current arm, gripper, workspace objects, named targets, and fold anchors for curated demos
- **`TaskSpec`:** Gemini output expressed only in allowed high-level skills
- **`ValidationReport`:** deterministic checks for reach, payload, collisions, and missing preconditions
- **`ExecutionPlan`:** compiled motion primitives consumed by both Rapier and MuJoCo
- **Repair loop:** invalid `TaskSpec` → `POST /ai/repair` → revalidate until safe or rejected
- **Scope discipline:** first ship rigid-object commands; cloth folding is a curated scenario, not an open-world claim

---

## KEY ENGINEERING DECISIONS

| Decision | Rationale |
|---|---|
| Rapier WASM in-browser | 60fps with zero server latency — feels like a game engine |
| MuJoCo server-side only | Python-only, can't run in browser; used for validation not real-time |
| Constrained neuro-symbolic pipeline | Gemini handles intent; deterministic verifier/compiler handles safety, motion, and export |
| Jinja2 for code export | Deterministic output — LLM hallucinations are dangerous in hardware code |
| React Flow for task editor | Purpose-built for node graphs; drag/drop + custom nodes out of the box |
| Jotai for state | Atomic model maps cleanly to arm segments, task blocks — granular re-renders |
| `@google/generative-ai` SDK | Official Google SDK, handles streaming, multimodal, function calling |
| Web-first (not Tauri-first) | Demo runs at a Vercel URL — judges don't install anything |
| `--legacy-peer-deps` | reactflow v12 has peer dep conflicts with React 19 — flag resolves it |

---

## LOCAL COMMANDS

```powershell
# Install all dependencies (MUST run first)
npm install --legacy-peer-deps

# Start dev server → http://localhost:5173
npm run dev

# Build production bundle
npm run build

# Start FastAPI backend (port 8000)
cd server
pip install -r requirements.txt
python main.py

# Git init and first push (Day 1 carry-over)
git init
git remote add origin https://github.com/Mizunandayo/mirai.git
git add .
git commit -m "init: Mirai scaffold v2.0"
git push -u origin main
```

---

## DEPLOYMENT

| Service | Target | Command |
|---|---|---|
| Frontend | Vercel | `vercel --prod` from project root |
| Backend | Railway | Docker container from `server/` |
| Backend Dockerfile | TBD Day 6 | `FROM python:3.12-slim` + `pip install -r requirements.txt` |

---

## DESIGN SYSTEM — UI RULES (enforced, do not break)

These rules apply to every component, every panel, every piece of UI in Mirai. They were set by the developer and must be respected in all AI-assisted edits.

| Rule | Detail |
|---|---|
| **Font** | `Poppins` exclusively — imported via `@fontsource/poppins` (weights 400, 500, 600, 700) |
| **No emojis** | Never use emoji characters in UI. Use inline SVG icons instead |
| **No small text** | Minimum readable body size: `0.82rem`. Labels: `0.72rem` minimum. No `0.6x` or smaller |
| **No gray text** | Avoid `#aaa`, `#999`, `rgba(0,0,0,0.3)` for meaningful text. Use `#555555` minimum for secondary text, `#0d0d0d` / `#1a1a1a` for primary text |
| **Color theme** | White-primary, black-accent. Background: `#ebebeb`. Surfaces: `#ffffff`. Primary action: `#0d0d0d` |
| **Glass effect** | Floating elements (header, modals, hints) use `background: rgba(255,255,255,0.72)` + `backdrop-filter: blur(24px) saturate(180%)` + white border |
| **Animations** | Smooth — `fade-up` on mount, `cubic-bezier(0.22, 1, 0.36, 1)` easing for entrances, `200–360ms` durations |
| **Icons** | Inline SVGs, 14×14 or 16×16 viewBox, `currentColor`, `strokeWidth: 1.5–1.6`. Placed in tinted square containers (`border-radius: 8px`, `28×28px`) |
| **Minimalist** | No decorative gradients, no drop shadows on text, no warm/Anthropic tones (no `#c4694a`, `#e8956a`, `#fdf0ea`) |
| **Ergonomic** | Controls at minimum 32px touch height. Panels `clamp(284px, 22vw, 336px)`. Header 56px. Status bar 44px |

### CSS Namespace Reference
- `hdr-*` — header bar (glass, 3-column grid, centered brand)
- `panel-*` — designer sidebar (white, 16px border-radius)
- `btn-*` — buttons (ghost, primary, topbar variants)
- `segment-*` — arm segment rows
- `gripper-*` — gripper library cards
- `validation-*` / `metric-*` — design check panel
- `bom-*` — bill-of-materials counter
- `viewport-*` — 3D viewport wrapper
- `status-*` — bottom status bar

---

## SECURITY NOTES

- ⚠️ `GEMINI_API_KEY` is in `backend/.env` — **NEVER COMMIT**
- `.gitignore` covers: `.env`, `node_modules/`, `dist/`, `__pycache__/`, `*.pyc`
- FastAPI CORS is currently `allow_origins=["*"]` — tighten to Vercel domain before deployment
- `python-jose` included for JWT — use for future auth endpoints only
- Signed export uses SHA-256 (not LLM-generated) — deterministic, verifiable

---

## PRIZE STRATEGY

1. **Track 3 — Robotics & Simulation:** Dual physics (Rapier + MuJoCo), 60fps, BOM-to-reality bridge
2. **Gemini Award:** Voice input + ReAct agent with visible Think/Act/Observe UI panel + multimodal image input
3. **Demo wow moments for judges:**
   - Speak a task aloud → arm moves in 3 seconds
   - Visible agent thinking sidebar (ReAct loop streaming live)
   - Scan QR code on stage → BOM + code on phone instantly
   - Dual physics side-by-side replay with divergence highlighting
   - Servo lifespan predictor ("J2 will fail in ~180hrs at this load")
