"""
Mirai Regression Test â€” Pick and Place Cylinder A on the Shelf
Calls Gemini API directly, traces normalization, and checks for collisions.

Run: python regression_test.py
"""

import json
import math
import os
import sys

try:
    import google.generativeai as genai
except ImportError:
    print("Installing google-generativeai...")
    os.system("pip install google-generativeai -q")
    import google.generativeai as genai

# â”€â”€ Config â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

API_KEY = "AIzaSyAGaouNAxcbJJ9RPpYni2DkRWFvy7Gw0gQ"
MODEL   = "gemini-2.5-flash"
PROMPT  = "Pick and Place Cylinder A on the shelf"

# â”€â”€ Scene geometry (mirrors sceneRegistry.ts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

SCENE = {
    "objects": [
        {"id": "table",     "name": "Work Table",  "type": "surface",  "pos": [0, 0, 0],        "dim": [0.8, 0.02, 0.6]},
        {"id": "box-a",     "name": "Box A",       "type": "box",      "pos": [0.2, 0.045, 0.1], "dim": [0.08, 0.08, 0.08]},
        {"id": "box-b",     "name": "Box B",       "type": "box",      "pos": [-0.15, 0.035, 0.2],"dim": [0.10, 0.06, 0.10]},
        {"id": "cylinder-a","name": "Cylinder A",  "type": "cylinder", "pos": [0.3, 0.066, -0.1],"dim": [0.04, 0.12, 0.04]},
        {"id": "shelf",     "name": "Shelf",       "type": "surface",  "pos": [0.5, 0.3, 0],    "dim": [0.4, 0.02, 0.2]},
        {"id": "drawer",    "name": "Drawer Zone", "type": "zone",     "pos": [-0.4, 0.15, 0],  "dim": [0.25, 0.2, 0.3]},
    ],
    "zones": [
        {"id": "zone-shelf",        "name": "Shelf Drop Zone", "pos": [0.5, 0.32, 0],  "radius": 0.08},
        {"id": "zone-drawer",       "name": "Drawer Zone",     "pos": [-0.4, 0.25, 0], "radius": 0.10},
        {"id": "zone-table-center", "name": "Table Center",    "pos": [0, 0.05, 0],    "radius": 0.15},
    ],
}

# â”€â”€ Scene planner (mirrors scenePlanner.ts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

TRANSIT_MARGIN  = 0.22
GRIP_MARGIN     = 0.03
PLACE_MARGIN    = 0.04

def top_y(obj): return obj["pos"][1] + obj["dim"][1] / 2

def transit_height():
    max_top = max(top_y(o) for o in SCENE["objects"] if o["type"] != "zone")
    return round(max_top + TRANSIT_MARGIN, 3)

def compute_safe_sequence(pick_id, dest_id):
    pick_obj = next((o for o in SCENE["objects"] if o["id"] == pick_id), None)
    dest_zone = next((z for z in SCENE["zones"] if z["id"] == dest_id), None)
    dest_obj  = next((o for o in SCENE["objects"] if o["id"] == dest_id), None) if not dest_zone else None

    if not pick_obj: return None

    transit_h = transit_height()
    pick_top  = top_y(pick_obj)
    grip_y    = round(pick_top + GRIP_MARGIN, 3)
    px, py, pz = pick_obj["pos"]

    if dest_zone:
        dx, dy, dz = dest_zone["pos"]
        place_y = round(dy + PLACE_MARGIN, 3)
    elif dest_obj:
        dx, dy, dz = dest_obj["pos"]
        place_y = round(top_y(dest_obj) + PLACE_MARGIN, 3)
    else:
        return None

    return {
        "transit_h":      transit_h,
        "approach_hover": [px, transit_h, pz],
        "grip_point":     [px, grip_y,    pz],
        "lift_point":     [px, transit_h, pz],
        "dest_hover":     [dx, transit_h, dz],
        "deposit_point":  [dx, place_y,   dz],
        "retreat_point":  [dx, transit_h, dz],
    }

def fmt(pt): return f"({pt[0]:.3f}, {pt[1]:.3f}, {pt[2]:.3f})"

# â”€â”€ AABB collision checker â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

COLLISION_MARGIN = 0.02
GRAB_RANGE       = 0.18
JAW_OFFSET       = 0.05

def aabb_hit(point, obj, margin=COLLISION_MARGIN):
    cx, cy, cz = obj["pos"]
    hx = obj["dim"][0] / 2 + margin
    hy = obj["dim"][1] / 2 + margin
    hz = obj["dim"][2] / 2 + margin
    return (abs(point[0]-cx) < hx and abs(point[1]-cy) < hy and abs(point[2]-cz) < hz)

def check_ee_collision(ee, ignore_id=None):
    for obj in SCENE["objects"]:
        if obj["type"] == "zone": continue
        if obj["id"] == ignore_id: continue
        if aabb_hit(ee, obj):
            return obj["id"]
    return None

# â”€â”€ Normalizer (mirrors normalizeTaskCoordinates) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def normalize_coordinates(task, seq):
    steps = task.get("steps", [])
    close_idx = next((i for i, s in enumerate(steps) if s.get("type") == "grip" and s.get("action", "").lower() == "close"), -1)
    open_idx  = next((i for i, s in enumerate(steps) if i > close_idx and s.get("type") == "grip" and s.get("action", "").lower() == "open"), -1)
    if close_idx < 0: return task, False

    pre_close_moves  = [s for i, s in enumerate(steps) if i < close_idx and s.get("type") == "move"]
    # Find destination: first post-close move targeting SOMETHING OTHER than pickup
    pick_id = seq.get("_pick_id", "")
    dest_move = None
    for s in steps[close_idx+1:]:
        if s.get("type") != "move": continue
        tgt = str(s.get("targetName", s.get("targetId", s.get("target_name", ""))))
        if tgt and tgt != pick_id:
            dest_move = s
            break

    pre_open_post_close = [s for i, s in enumerate(steps)
                           if i > close_idx and (open_idx < 0 or i < open_idx) and s.get("type") == "move"]
    total_pre_open = len(pre_open_post_close)

    pre_close_count = 0
    post_close_count = 0
    normalized = []

    for i, step in enumerate(steps):
        if step.get("type") != "move":
            normalized.append(step)
            continue

        if i < close_idx:
            pre_close_count += 1
            is_last = (pre_close_count == len(pre_close_moves))
            pt = seq["grip_point"] if is_last else seq["approach_hover"]
            normalized.append({**step, "x": pt[0], "y": pt[1], "z": pt[2]})

        elif i > close_idx and (open_idx < 0 or i < open_idx):
            post_close_count += 1
            if post_close_count == 1:
                pt = seq["lift_point"]
            elif post_close_count == total_pre_open:
                pt = seq["deposit_point"]
            else:
                pt = seq["dest_hover"]
            normalized.append({**step, "x": pt[0], "y": pt[1], "z": pt[2]})

        elif open_idx >= 0 and i > open_idx:
            pt = seq["retreat_point"]
            normalized.append({**step, "x": pt[0], "y": pt[1], "z": pt[2]})

        else:
            normalized.append(step)

    return {**task, "steps": normalized}, True

# â”€â”€ Collision trace â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def trace_task_collisions(steps):
    """Simulate the key EE positions for each move step and check collisions."""
    print("\n  Step-by-step EE collision trace:")
    print(f"  {'Step':<6} {'Type':<8} {'Target':<14} {'EE position':<26} {'Collision?'}")
    print("  " + "-"*78)

    held_id = None
    for i, step in enumerate(steps):
        t = step.get("type", "?")
        if t == "move":
            x = step.get("x", 0)
            y = step.get("y", 0)
            z = step.get("z", 0)
            tgt = step.get("targetName", step.get("targetId", ""))
            ee = [x, y, z]
            ignore = held_id or tgt if tgt in [o["id"] for o in SCENE["objects"]] else held_id
            coll = check_ee_collision(ee, ignore_id=ignore)
            marker = f"  â† COLLISION with {coll}!" if coll else ""
            print(f"  {i+1:<6} {'move':<8} {tgt:<14} {fmt(ee):<26} {marker or 'âœ“'}")
        elif t == "grip":
            action = step.get("action", "?")
            if action == "close":
                # Find nearest object
                for obj in SCENE["objects"]:
                    if obj["type"] in ("surface", "zone"): continue
                    print(f"  {i+1:<6} {'grip-close':<8} {'':<14} {'':<26} â†’ grips object (if in range)")
                    held_id = obj["id"]
                    break
            else:
                print(f"  {i+1:<6} {'grip-open':<8} {'':<14} {'':<26} â†’ releases {held_id}")
                held_id = None

# â”€â”€ System & user prompts (mirrors geminiDirectPlanner.ts) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

SYSTEM_PROMPT = """You are an expert tabletop robot arm motion planner.
Convert the user's request into a safe, executable TaskSpec JSON.

COLLISION-FREE RULES:
1. ALL lateral movement MUST use Y >= SAFE_TRANSIT_HEIGHT
2. Only descend vertically (X,Z unchanged) to pick or place
3. Use EXACTLY the provided waypoints

Output JSON only. No markdown. Schema:
{
  "taskName": "string",
  "taskDescription": "string",
  "steps": [
    {"stepId": 1, "type": "move", "targetName": "id", "x": 0.0, "y": 0.0, "z": 0.0, "speed": 0.4, "approach": "above"},
    {"stepId": 2, "type": "grip", "action": "close", "force": 60}
  ],
  "confidenceScore": 0.85,
  "warnings": []
}"""

def build_user_prompt(seq, transit_h):
    px, _, pz = seq["approach_hover"]  # pick XZ
    dx, dy, dz = seq["deposit_point"]  # dest XZ

    scene_lines = []
    for o in SCENE["objects"]:
        if o["type"] == "zone": continue
        t = top_y(o)
        scene_lines.append(
            f"  {o['name']} ({o['id']}) type={o['type']}"
            f" pos=({o['pos'][0]:.3f},{o['pos'][1]:.3f},{o['pos'][2]:.3f})"
            f" topY={t:.3f}"
        )
    for z in SCENE["zones"]:
        scene_lines.append(
            f"  {z['name']} ({z['id']}) zone"
            f" pos=({z['pos'][0]:.3f},{z['pos'][1]:.3f},{z['pos'][2]:.3f})"
        )

    return f"""User request: {PROMPT}

ARM: Base=0.15m, Seg1=0.35m, Seg2=0.28m | max_reach=0.86m | gripper=parallel | payload=2.0kg

SAFE_TRANSIT_HEIGHT = {transit_h:.3f}m  (ALL lateral moves MUST use this Y)

SCENE:
{chr(10).join(scene_lines)}

SAFE WAYPOINTS (use EXACTLY these x/y/z values):
  Pickup: cylinder-a
  Destination: zone-shelf

  Step 1 â€” Hover above pickup  : move to ({seq['approach_hover'][0]:.3f}, {seq['approach_hover'][1]:.3f}, {seq['approach_hover'][2]:.3f}) speed=0.5
  Step 2 â€” Descend to grip     : move to ({seq['grip_point'][0]:.3f}, {seq['grip_point'][1]:.3f}, {seq['grip_point'][2]:.3f}) speed=0.25
  Step 3 â€” Close gripper       : grip action=close force=65
  Step 4 â€” Lift to transit     : move to ({seq['lift_point'][0]:.3f}, {seq['lift_point'][1]:.3f}, {seq['lift_point'][2]:.3f}) speed=0.35
  Step 5 â€” Transit to dest     : move to ({seq['dest_hover'][0]:.3f}, {seq['dest_hover'][1]:.3f}, {seq['dest_hover'][2]:.3f}) speed=0.5
  Step 6 â€” Lower to deposit    : move to ({seq['deposit_point'][0]:.3f}, {seq['deposit_point'][1]:.3f}, {seq['deposit_point'][2]:.3f}) speed=0.22
  Step 7 â€” Open gripper        : grip action=open force=0
  Step 8 â€” Retreat             : move to ({seq['retreat_point'][0]:.3f}, {seq['retreat_point'][1]:.3f}, {seq['retreat_point'][2]:.3f}) speed=0.4

Generate TaskSpec JSON using EXACTLY these coordinates."""

# â”€â”€ Main test â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def main():
    print("=" * 70)
    print("  MIRAI REGRESSION TEST â€” Pick and Place Cylinder A on Shelf")
    print("=" * 70)

    # 1. Compute scene geometry
    transit_h = transit_height()
    seq = compute_safe_sequence("cylinder-a", "zone-shelf")
    seq["_pick_id"] = "cylinder-a"

    print(f"\n1. SCENE PLANNER â€” Safe waypoints:")
    print(f"   Transit height : {transit_h:.3f}m")
    print(f"   Shelf topY     : {top_y(next(o for o in SCENE['objects'] if o['id']=='shelf')):.3f}m")
    print(f"   Approach hover : {fmt(seq['approach_hover'])}")
    print(f"   Grip point     : {fmt(seq['grip_point'])}")
    print(f"   Lift point     : {fmt(seq['lift_point'])}")
    print(f"   Dest hover     : {fmt(seq['dest_hover'])}")
    print(f"   Deposit point  : {fmt(seq['deposit_point'])}")
    print(f"   Retreat point  : {fmt(seq['retreat_point'])}")

    # 2. Call Gemini
    print(f"\n2. CALLING GEMINI ({MODEL})...")
    genai.configure(api_key=API_KEY)
    model = genai.GenerativeModel(MODEL)

    user_prompt = build_user_prompt(seq, transit_h)
    response = model.generate_content([SYSTEM_PROMPT, user_prompt])
    raw = response.text
    print(f"   Response length: {len(raw)} chars")
    print(f"\n   Raw Gemini output:")
    print("   " + "-"*60)
    for line in raw.strip().splitlines():
        print(f"   {line}")
    print("   " + "-"*60)

    # 3. Parse Gemini output
    start = raw.find("{")
    end   = raw.rfind("}")
    if start < 0 or end < 0:
        print("\n   ERROR: No JSON object found in response!")
        return

    task = json.loads(raw[start:end+1])
    steps = task.get("steps", [])
    print(f"\n3. PARSED TASK â€” '{task.get('taskName', '?')}'")
    print(f"   Confidence: {task.get('confidenceScore', '?')}")
    print(f"   Steps: {len(steps)}")
    print()
    for s in steps:
        if s.get("type") == "move":
            print(f"   Step {s['stepId']:2d} move  tgt={s.get('targetName','?'):<12}  "
                  f"({s.get('x',0):.3f}, {s.get('y',0):.3f}, {s.get('z',0):.3f})")
        else:
            print(f"   Step {s['stepId']:2d} grip  action={s.get('action','?')}")

    # 4. Check collisions BEFORE normalization
    print(f"\n4. COLLISION CHECK â€” Before normalization:")
    trace_task_collisions(steps)

    # 5. Apply normalization
    print(f"\n5. NORMALIZING coordinates with scene planner...")
    task_norm, changed = normalize_coordinates(task, seq)
    steps_norm = task_norm.get("steps", [])
    print(f"   Changed: {changed}")
    print()
    for s in steps_norm:
        if s.get("type") == "move":
            print(f"   Step {s['stepId']:2d} move  tgt={s.get('targetName','?'):<12}  "
                  f"({s.get('x',0):.3f}, {s.get('y',0):.3f}, {s.get('z',0):.3f})")
        else:
            print(f"   Step {s['stepId']:2d} grip  action={s.get('action','?')}")

    # 6. Check collisions AFTER normalization
    print(f"\n6. COLLISION CHECK â€” After normalization:")
    trace_task_collisions(steps_norm)

    # 7. Summary
    print("\n" + "=" * 70)
    print("  VERDICT")
    print("=" * 70)
    # Count EE collisions after normalization
    collisions = 0
    for s in steps_norm:
        if s.get("type") == "move":
            ee = [s.get("x",0), s.get("y",0), s.get("z",0)]
            if check_ee_collision(ee):
                collisions += 1
    print(f"  EE collisions after normalization: {collisions}")
    if collisions == 0:
        print("  âœ“ PASS â€” plan is collision-free at endpoint positions")
    else:
        print("  âœ— FAIL â€” some endpoint positions collide")
    print()

if __name__ == "__main__":
    main()

