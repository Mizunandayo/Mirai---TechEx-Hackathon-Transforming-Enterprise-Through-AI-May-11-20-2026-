# Mirai — Session Context
**Last updated:** Thursday, May 14, 2026 — Days 1–3 complete. Day 4 (Physics Simulation) is in progress with core sim systems, navigation-state persistence, and latest simulation UX fixes implemented.

---

## Project Summary
**Mirai (未来 · "Future")** — AI-powered browser-based robot arm simulator.
- **Hackathon:** Transforming Enterprise Through AI by lablab.ai
- **Dates:** May 11–19, 2026
- **Solo builder:** Francis Daniel (Mizunandayo / Mizu)
- **Primary Track:** Track 3 — Robotics & Simulation
- **Partner Award target:** Gemini Award (Best use of Gemini) — separate from track, can win both

---

## Track Strategy
- Competing in **Track 3 only** (eligible for 1 track prize)
- Also targeting the **Gemini Award** — partner award, no track restriction
- Gemini is deeply integrated → qualifies naturally for Gemini Award

---

## Submission Fields (lablab.ai)
| Field | Value |
|-------|-------|
| **Details** | `Mirai (未来) — AI robot arm simulator in the browser. Design, simulate physics & export Arduino/Python code. Tracks 2 & 3.` |
| **State** | `Active Development` |

---

## Tech Stack (confirmed)
| Layer | Technology |
|-------|-----------|
| Frontend | React **18.3.1** + TypeScript strict (downgraded from 19 for R3F v8 compat) |
| 3D | React Three Fiber + @react-three/drei |
| Client physics | @react-three/rapier (Rapier WASM) — 60fps |
| Server physics | MuJoCo 3.x (upgraded from PyBullet) |
| AI | Gemini 2.0 Flash (voice/text) + Gemini 2.0 Pro (ReAct reasoning) |
| Visual programming | React Flow v12 |
| State | Jotai v2 |
| Backend | FastAPI 0.115 + Python 3.12 |
| Code export | Jinja2 (deterministic — NOT LLM) |
| Database | SQLite + SQLAlchemy |
| Desktop wrapper | Tauri v2 (web-first for demo) |
| Styling | TailwindCSS v4 + Framer Motion v11 |
| Build | Vite **7** |
| Deploy | Vercel + Railway + Docker |

---

## Gemini Setup
- **One API key** covers all models — `GEMINI_API_KEY` in `backend/.env`
- `gemini-2.0-flash` → real-time voice/text arm design (fast)
- `gemini-2.0-pro` → multi-step motion planning via ReAct loop (smart)
- Free tier is sufficient — no $300 Google Cloud credits needed for Tracks 2 & 3

---

## Credits / Cloud
- **$300 Google Cloud credits** — NOT required for Mirai
- Track 3 has no cloud dependency (Rapier = browser WASM, MuJoCo = local)
- Track 2 (Gemini) covered by free API tier
- Only needed if rate limits are hit mid-hackathon (unlikely solo, 8 days)

---

## Updated Daily Task Tracker (Authoritative)

### Day 1 — Foundation + 3D Engine
✅ Repo, scaffold, dependencies, base 3D viewer, base atoms, FastAPI skeleton all completed
✅ Segment click-to-select and advanced mode wiring completed
❌ None pending for Day 1

### Day 2 — Arm Design Studio
✅ Arm segment editor, gripper library, reach envelope, joint arcs, validation, BOM, save/load all completed
✅ Design viewport and panel UX polish (camera reset, hint, panel behaviors) completed
❌ None pending for Day 2

### Day 3 — Task Editor (React Flow)
✅ 7 node types, palette, deletable edges, validation, undo/export, keyboard shortcuts completed
✅ Node interaction polish (`nodrag`, semantic grip toggle, edge delete UX) completed
✅ Task canvas now persists when leaving and returning to Tasks tab
❌ None pending for Day 3

### Day 4 — Physics Simulation (In Progress)
✅ FK/IK + deterministic motion compiler pipeline operational
✅ Playback transport: play/pause/step/rewind/jump/speed + loop + skip-collision + reverse + reset
✅ Timeline collision/grip-empty markers, live Joint HUD, live Physics Metrics completed
✅ Camera focus/reset, live viewport tool-point X/Y readout, and per-joint row metrics layout completed
✅ Dynamic object reset at frame 0, approach-target freeze, and no-snap carry behavior completed
✅ Manual teach/PTP mode shipped: hover-to-highlight arm parts, hold left-click + mouse move to drive joints in real time, camera lock toggle, highlight latch during drag
✅ PTP point stack controls shipped in viewport: save current point, duplicate-save prevention, per-point delete, clear all, scrollable list
❌ Rapier rigid body setup for each arm segment
❌ Revolute/prismatic joint constraints in Rapier
❌ Collision highlight flash + auto-rewind polish

### Day 5 — Gemini AI Integration (Not Started)
❌ `/ai/plan` + `/ai/repair` endpoints
❌ Grounded TaskSpec generation + deterministic repair loop
❌ Voice input + ReAct Think/Act/Observe panel + pre-flight safety + confidence badge

### Day 6 — Backend + MuJoCo + Export (Not Started)
❌ Railway deployment + MuJoCo WS pipeline + accuracy badge
❌ Servo lifespan predictor + side-by-side Rapier vs MuJoCo replay
❌ Deterministic code/BOM/URDF/QR/signed export pipeline

### Day 7 — Community + Preloads + Presets (Not Started)
❌ Community browse/import flow + seeded task library
❌ Famous preload tasks + real robot preset skins
❌ Full E2E quality pass and 60fps verification

### Day 8 — Polish + Demo Prep + Submit (Not Started)
❌ Production deploys, final E2E testing, demo video, slide deck
❌ README final pass, repo cleanup, and submission before deadline

---

## Current File State
| File | Status |
|------|--------|
| `MIRAI_BLUEPRINT.md` | ✅ v2.0 — updated Day 3 complete + Day 7 Real Robot Presets added |
| `CLAUDE.md` | ✅ Fully updated — Day 3 complete, file structure current, build status current |
| `backend/.env` | ✅ GEMINI_API_KEY, JWT_SECRET, DATABASE_URL |
| `server/requirements.txt` | ✅ mujoco>=3.1.0 |
| `package.json` | ✅ All deps, npm installed with --legacy-peer-deps |
| `vite.config.js` | ✅ @tailwindcss/vite plugin, port 5173 strictPort |
| `src/index.css` | ✅ @import tailwindcss + @theme tokens |
| `src/vite-env.d.ts` | ✅ React 18 JSX augmentation for R3F |
| `src/main.tsx` | ✅ Imports @xyflow/react CSS + index.css + App.css |
| `src/App.tsx` | ✅ 3-zone layout; Design + Tasks nav wired; STEP_MAP, STATUS_MAP; step counter |
| `src/App.css` | ✅ Full design system (~1,550+ lines): hdr-*, panel-*, task-*, palette-*, flow-*, task-edge-* |
| `src/types/arm.ts` | ✅ ArmSegment, GripperConfig, BOMItem, ValidationResult, ArmConfig |
| `src/types/task.ts` | ✅ SceneGraph, TaskSpec, TaskBlock, ValidationReport, ExecutionPlan |
| `src/types/simulation.ts` | ✅ SimFrame, ExecutionPlan, PlaybackStatus, JointMetrics (`approachTargetId`, `gripEmpty`) |
| `src/store/atoms.ts` | ✅ Fully typed Jotai atoms |
| `src/store/taskAtoms.ts` | ✅ taskNodes, taskEdges, pendingAddNode, ghostArmTarget, selectedNodeId |
| `src/store/simAtoms.ts` | ✅ compiledPlan, playbackStatus, currentFrame, playbackSpeed, loop, skipCollisionPause |
| `src/utils/armPhysics.ts` | ✅ calculateMaxReach, calculateTorqueAtJoint, validateArm |
| `src/utils/bomPricing.ts` | ✅ calculateBOM, getTotalBOMCost (72-piece BOM) |
| `src/utils/armExport.ts` | ✅ exportArmConfig, parseArmConfig, loadArmConfigFromFile |
| `src/utils/sceneRegistry.ts` | ✅ Default scene objects + target zones |
| `src/utils/taskValidation.ts` | ✅ validateTask() pure function |
| `src/utils/taskExport.ts` | ✅ exportTaskJson, parseTaskJson, loadTaskFromFile |
| `src/utils/forwardKinematics.ts` | ✅ FK solver for serial arm |
| `src/utils/inverseKinematics.ts` | ✅ FABRIK IK solver |
| `src/utils/motionCompiler.ts` | ✅ Task graph compiler with baked collisions/grab semantics |
| `src/components/ArmViewer.tsx` | ✅ R3F Canvas, forwardRef, resetCamera(), lights, shadows, overlays |
| `src/components/RobotArm.tsx` | ✅ **Industrial redesign** — JointHousing (disk+axle flanges), SegmentGroup (useFrame selection pulse), ParallelJawGripper (collar+palm+rails+jaws+pads), SuctionGripper (collar+bellows torus rings+cup), MagneticGripper (collar+housing+face+LED), waist idle animation |
| `src/components/ReachEnvelope.tsx` | ✅ Wireframe reach sphere + 80% inner reference |
| `src/components/JointArcOverlay.tsx` | ✅ Joint arc + fill |
| `src/components/arm-designer/ArmDesignerPanel.tsx` | ✅ Topbar + toolbar (tabs + icon btns) + content + footer + right-edge drag-resize (min 336px, max 560px) |
| `src/components/arm-designer/SegmentList.tsx` | ✅ Add/remove/edit with sliders |
| `src/components/arm-designer/GripperLibrary.tsx` | ✅ 3 gripper types with expand controls |
| `src/components/arm-designer/ValidationPanel.tsx` | ✅ Metrics + errors + warnings |
| `src/components/arm-designer/BOMCounter.tsx` | ✅ Live cost + collapsible BOM |
| `src/components/task-editor/DeletableEdge.tsx` | ✅ Custom edge with × button at midpoint (hover/selected reveal, 36×36 hit zone) |
| `src/components/task-editor/NodePalette.tsx` | ✅ Drag-to-canvas + click-to-add, 6 block types |
| `src/components/task-editor/TaskEditorPanel.tsx` | ✅ Task name, description, palette, validation footer |
| `src/components/task-editor/TaskFlowCanvas.tsx` | ✅ ReactFlowProvider + FlowEditor, NODE_TYPES, EDGE_TYPES, 20-step undo, Ctrl+S export, Ctrl+Z undo |
| `src/components/task-editor/nodes/StartNode.tsx` | ✅ Start (no delete, always required) |
| `src/components/task-editor/nodes/EndNode.tsx` | ✅ End with delete button |
| `src/components/task-editor/nodes/MoveNode.tsx` | ✅ Target preset, XYZ, speed, approach; delete + issue icons |
| `src/components/task-editor/nodes/GripNode.tsx` | ✅ Open/close toggle (green #15803d / red #991b1b), force slider; delete |
| `src/components/task-editor/nodes/WaitNode.tsx` | ✅ Duration ms input; delete |
| `src/components/task-editor/nodes/LoopNode.tsx` | ✅ Repeat count stepper; delete |
| `src/components/task-editor/nodes/IfNode.tsx` | ✅ Condition input, then/else handles; delete |
| `src/components/simulation/SceneObjects.tsx` | ✅ Rapier bodies + held-object pinning + approach-target freeze + frame-0 reset |
| `src/components/simulation/SimulatedArm.tsx` | ✅ FK-driven nested articulation + kinematic gripper collider + hover/drag teach interaction hooks |
| `src/components/simulation/PathTrail.tsx` | ✅ End-effector trail rendering |
| `src/components/simulation/SimViewer.tsx` | ✅ Canvas + playback engine + camera focus/reset + manual teach/PTP overlay controls |
| `src/components/simulation/PlaybackControls.tsx` | ✅ Compile/transport/speed + loop + skip-collision toggles + redesigned layout |
| `src/components/simulation/TimelineScrubber.tsx` | ✅ Seekable timeline + collision + grip-empty markers |
| `src/components/simulation/JointHUD.tsx` | ✅ Live joint state + compact redesigned layout |
| `src/components/simulation/PhysicsMetrics.tsx` | ✅ Per-joint metrics + collision/grip-empty alerts + redesigned layout |
| `src/components/simulation/SimulationPanel.tsx` | ✅ Simulation sidebar composition (redesigned child layout) |
| `server/main.py` | ✅ FastAPI skeleton + health check (no AI endpoints yet — Day 5) |
| `convert_blueprint.py` | Can be deleted |
| `MIRAI_BLUEPRINT.html` | Can be deleted |

---

## Days Complete

### Day 1 ✅ — Foundation + 3D Engine
Scaffold, deps, git push, FastAPI skeleton, R3F canvas, Jotai atoms.

### Day 2 ✅ — Arm Design Studio
Full arm designer: segment panel, gripper library (3 types), reach envelope, joint arcs, BOM counter, validation panel. Full UI design system (~1,550 CSS lines). Panel drag-resize. Camera reset. Viewport hint pill. Nav collapse/expand.

### Day 3 ✅ — Task Editor (React Flow)
Visual block programmer: 7 node types (Start, End, Move, Grip, Wait, Loop, If), deletable edges (× button at midpoint), palette (drag + click to add), Ctrl+S export, Ctrl+Z undo (20 steps), task validation, portable JSON download. All node bodies use `nodrag` — no drag hijacking. GripNode green/red semantic toggle fixed.

### Day 4 🔄 — Physics Simulation (Rapier WASM, in progress)
Core simulation pipeline is live: FK/IK + motion compiler + SimViewer + SceneObjects + SimulatedArm + PathTrail + PlaybackControls + TimelineScrubber + JointHUD + PhysicsMetrics + SimulationPanel.

Completed in-session fixes:
- Surface collision warnings fixed (table/shelf now counted)
- Camera focus cycle + reset controls
- Loop playback toggle + skip-collision-pause toggle
- Reverse playback + reset transport controls added
- Dynamic bodies reset on loop/rewind frame 0
- Grip no-snap carry using runtime offset tracking
- Runtime-correct grab alignment via approach-target freeze (`approachTargetId` baked into `SimFrame`)
- Soft warning for empty grip close (`gripEmpty`) surfaced in timeline and physics alerts
- Live tool-point coordinate readout (X/Y) added to simulation viewport (bottom-right)
- Physics metrics panel switched to line-by-line per-joint rows (instead of compact card row)
- Simulation panel child layout redesigned to a more minimal, scannable structure
- Task canvas state now persists when navigating away from and back to the Tasks tab
- Manual teach/PTP interaction shipped: hover-highlight arm parts, hold left-click + drag to drive hovered joint
- Teach UX polish shipped: camera lock toggle, drag-time highlight latch, and updated on-screen guidance
- PTP stack shipped: save current point, duplicate-save block, per-point delete, clear-all action, scrollable saved list

### RobotArm Industrial Redesign ✅ (Day 2 extended — completed Day 3)
Complete `RobotArm.tsx` rewrite with:
- `JointHousing`: machined steel disk (cylinder rotated π/2) + outer lip ring + left/right bearing flanges
- `SegmentGroup`: `useFrame` emissive pulse on selection (0.12 + sin(t×2.8)×0.08), no React re-render
- `ParallelJawGripper`: mounting collar + palm housing + 2 guide rails + 2 jaw carriers + 2 rubber pads
- `SuctionGripper`: mounting collar + valve body + 2 bellows torus rings + cup face
- `MagneticGripper`: mounting collar + housing + magnetic contact face + green LED dot
- `waistRef` idle animation: `sin(t×0.14)×0.022` radians — ±1.3° breathing
- All grippers flush at `yTop` (zero gap)
- Color palette: brushed aluminium (#c2c6ce), steel (#18191c), rubber (#161820)
- 3 PBR presets: MAT_ALUM / MAT_STEEL / MAT_RUBB

---

## Architecture Notes (critical for Day 4+)

### Jotai atoms (confirmed types)
- `armSegmentsAtom`: `ArmSegment[]` — each has `id`, `length` (meters), `joint: 'fixed'|'revolute'`, `color`
- `armGripperAtom`: `GripperConfig` — `type: 'parallel_jaw'|'suction_cup'|'magnetic'`, `width` (meters, 0.03–0.15), `force`
- `selectedSegmentIdAtom`: `string | null`
- `taskNodesAtom`, `taskEdgesAtom`: React Flow node/edge arrays
- `ghostArmTargetAtom`: pre-wired for Day 4 ArmViewer consumption

### gripper.width
Stored in **meters** (0.03–0.15 range). `hw = width / 2` gives half-width in meters.

### ArmSegment.joint
`'fixed'` = base segment (cylindrical, wider at bottom). `'revolute'` = arm joint (box link + JointHousing at yBase).

### React Flow patterns (Day 3 confirmed)
- `updateNodeData` callback: `(node: Node) => { const d = node.data as unknown as XxxBlock; return {...d, field: value} }`
- `nodrag` CSS class on ALL interactive elements inside nodes (bodies, sliders, buttons)
- `deleteElements({ nodes: [{ id }] })` or `deleteElements({ edges: [{ id }] })` from `useReactFlow()`
- `EDGE_TYPES = { default: DeletableEdge }` registered on `<ReactFlow>`

### TaskSpec JSON schema (canonical contract)
- Day 5: Gemini `/ai/plan` returns this schema
- Day 6: Jinja2 code export + MuJoCo validator consume this schema

---

## Day 4 — Physics Simulation (Implementation Snapshot)

**Architecture decision:** FK-driven arm (not Rapier joints) + Rapier for environment objects only. This is now implemented and running.

**Implemented files:**
1. `src/types/simulation.ts` — SimFrame, ExecutionPlan, PlaybackStatus, JointMetrics
2. `src/utils/forwardKinematics.ts` — FK: pitchAngles[] + waistYawDeg → jointPositions[] + endEffector
3. `src/utils/inverseKinematics.ts` — FABRIK IK: targetWorld → pitchAngles[] + waistYawDeg
4. `src/utils/motionCompiler.ts` — compileTask(): walks React Flow graph → SimFrame[]
5. `src/store/simAtoms.ts` — compiledPlan, playbackStatus, currentFrame, speed, pathTrailPoints (derived)
6. `src/components/simulation/SceneObjects.tsx` — env with Rapier bodies
7. `src/components/simulation/SimulatedArm.tsx` — nested group FK arm + kinematic Rapier sphere
8. `src/components/simulation/PathTrail.tsx` — glowing end-effector trail
9. `src/components/simulation/SimViewer.tsx` — R3F Canvas + Physics + playback engine
10. `src/components/simulation/PlaybackControls.tsx` — compile + transport + speed
11. `src/components/simulation/TimelineScrubber.tsx` — seekable + collision markers
12. `src/components/simulation/JointHUD.tsx` — J0–JN live angles + torque + velocity
13. `src/components/simulation/PhysicsMetrics.tsx` — per-joint metrics + collision alert
14. `src/components/simulation/SimulationPanel.tsx` — sidebar composition

**App.tsx:** Add `SimulationPanel` + `SimViewer` to `simulate` nav branch.
**App.css:** Append `sim-*` namespace styles (~180 lines).

**Critical FK convention:**
- `pitchAngles[i]` = DELTA pitch from parent link direction (degrees)
- `waistYawDeg` = separate Y-axis rotation (separate from pitchAngles)
- Nested Three.js groups → rotations accumulate automatically
- `pitchAngles = [0,0,...]` → arm straight up (home configuration)

**Critical SimulatedArm pattern:**
- Uses recursive `SegmentChain` component — proper nested groups
- `revolveIdx.current` is a mutable ref reset each render — increments through pitchAngles
- Kinematic Rapier sphere at endEffector position → physically pushes dynamic objects

---

## Day 7 — Real Robot Arm Presets (Locked In)
- Source UR5 + KUKA KR6 `.glb` files (free CC license on Sketchfab) — ~2h task
- "Real Robot" skin toggle in arm designer sidebar — swaps procedural mesh, all joint data intact
- Gemini adapts any task to selected real arm's actual joint limits
- Demo moment: custom arm → KUKA KR6 → same task plays on real robot geometry

---

## Design System Rules (always enforce)
- Font: **Poppins** exclusively
- No emojis in UI — inline SVG icons only
- No text below `0.72rem` minimum
- No gray text below `#555555` for meaningful content
- Background: `#ebebeb` | Surfaces: `#ffffff` | Primary action: `#0d0d0d`
- Glass elements: `rgba(255,255,255,0.72)` + `backdrop-filter: blur(24px)`
- NO warm/Anthropic tones: no `#c4694a`, `#e8956a`, `#fdf0ea`
- Animations: `cubic-bezier(0.22, 1, 0.36, 1)`, 200–360ms

---

## Hackathon Deadline
**May 19, 2026 — 8:00 AM Philippine Standard Time**
Days 1–3 complete. Day 4 in progress. Remaining focus: finish Day 4 polish, then start Day 5 Gemini integration.

---

## Security Note
⚠️ `GEMINI_API_KEY` is in `backend/.env` — `.gitignore` covers `.env` files. **DO NOT COMMIT.**
