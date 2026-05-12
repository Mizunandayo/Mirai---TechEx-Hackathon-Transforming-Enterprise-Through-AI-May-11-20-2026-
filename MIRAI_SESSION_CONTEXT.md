# Mirai — Session Context
**Last updated:** Wednesday, May 13, 2026 — Days 1–3 complete. RobotArm industrial redesign done. Real Robot Arm Presets locked into Day 7. Day 4 (Physics Simulation) starts next.

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
| `src/store/atoms.ts` | ✅ Fully typed Jotai atoms |
| `src/store/taskAtoms.ts` | ✅ taskNodes, taskEdges, pendingAddNode, ghostArmTarget, selectedNodeId |
| `src/utils/armPhysics.ts` | ✅ calculateMaxReach, calculateTorqueAtJoint, validateArm |
| `src/utils/bomPricing.ts` | ✅ calculateBOM, getTotalBOMCost (72-piece BOM) |
| `src/utils/armExport.ts` | ✅ exportArmConfig, parseArmConfig, loadArmConfigFromFile |
| `src/utils/sceneRegistry.ts` | ✅ Default scene objects + target zones |
| `src/utils/taskValidation.ts` | ✅ validateTask() pure function |
| `src/utils/taskExport.ts` | ✅ exportTaskJson, parseTaskJson, loadTaskFromFile |
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

## Day 4 — Physics Simulation (Ready to Start)

**What to build:**
- Rapier rigid body per arm segment (Box + Cylinder colliders)
- Revolute joint constraints between segments
- Task executor: reads taskNodes/taskEdges → drives simulation frame-by-frame
- Motion compiler: `TaskSpec` → deterministic motion primitives → `ExecutionPlan`
- Playback controls: play/pause/rewind/step-frame/speed 0.25x–4x
- Timeline scrubber: click frame → jump
- Joint angle HUD: J1–J5 angles + gripper state live
- Physics metrics panel: torque, velocity, acceleration per joint
- Collision highlight: red mesh flash + auto-rewind to collision frame
- Path trail: glowing trajectory behind end-effector
- Environment objects: table, shelf, box, sock pile, drawer

**Key constraint:** ghostArmTargetAtom is already pre-wired in taskAtoms.ts — ArmViewer should read it to show ghost arm position during task editing.

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
Days 1–3 complete. 6 days remaining. Day 4 (Physics Simulation / Rapier WASM) starts next.

---

## Security Note
⚠️ `GEMINI_API_KEY` is in `backend/.env` — `.gitignore` covers `.env` files. **DO NOT COMMIT.**
