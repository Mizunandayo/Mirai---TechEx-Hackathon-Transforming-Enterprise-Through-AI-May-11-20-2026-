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
| 3 | May 13 | Task Editor (React Flow) | ✅ **COMPLETE** — All 14 files created, 7 node types, palette, canvas, deletable edges, validation, Ctrl+S export, Ctrl+Z undo, TypeScript clean |
| 4 | May 14 | Physics Simulation (Rapier) | ✅ **COMPLETE** — Sim pipeline finalized with arm-link collision detection, segment rigid bodies, revolute/prismatic constraints, and collision flash polish |
| 5 | May 15–16 | Gemini AI Integration | ✅ **COMPLETE** — Direct Gemini API (5-15s), scene planner, IK auto-scale, arm auto-config, volumetric collision detection, obstacle-aware routing, feasibility analysis, AI Results UI redesign |
| 6 | May 16–17 | Backend + MuJoCo + Export | ✅ **COMPLETE** — All export endpoints live, bundle fixes (template/sanitization/QR), Railway + Vercel deployed and healthy |{6}
| 7 | May 17 | Community + Famous Preloads | ⏳ Ready to Start |
| 8 | May 18–19 | Polish + Demo Prep + Submit | ⏳ Ready to Start |

**STATUS:** Days 1–6 complete. Day 7 in progress.

---

## UPDATED DAILY TASKS (AUTHORITATIVE)

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
✅ Task canvas now persists across full webpage reload via local storage
✅ Canvas clear control shipped: trash icon above zoom controls with Clear all confirmation dialog; clearing resets flow and task-name local storage
❌ None pending for Day 3

### Day 4 — Physics Simulation ✅ COMPLETE
✅ FK/IK + deterministic motion compiler pipeline operational
✅ Playback transport: play/pause/step/rewind/jump/speed + loop + skip-collision + reverse + reset
✅ Timeline collision/grip-empty markers, live Joint HUD, live Physics Metrics completed
✅ Camera focus/reset, live viewport tool-point X/Y readout, and per-joint row metrics layout completed
✅ Dynamic object reset at frame 0, approach-target freeze, and no-snap carry behavior completed
✅ Manual teach/PTP interaction shipped in simulation: hover-highlight arm parts, hold left-click + mouse move to drive hovered joint in real time
✅ Teach UX controls shipped: camera lock toggle, drag-time highlight latch, and viewport PTP point stack (save, duplicate block, delete, clear, scroll)
✅ Live tool-point coordinate inputs upgraded to editable X/Y/Z and now drive IK in real time
✅ Live coordinate inputs auto-sync from end-effector motion during teach/drag/playback
✅ PTP "Play all" sequence shipped (replays saved coordinates with smooth IK interpolation)
✅ Interlock behavior shipped: PlaybackControls disable during PTP sequence, while PTP Play-all disables during regular transport playback
✅ Starting regular playback now auto-disables Teach mode and Lock/Free camera mode
✅ Simulation player header now shows loaded task metadata name (`taskNameAtom`) instead of Start-node label
✅ Collision detection upgraded from end-effector-only checks to arm-link sampling (non-fixed segments), so arm-vs-surface contacts (e.g., floating shelf/table) now trigger `Collision Detected`
✅ Rapier rigid body setup for each arm segment
✅ Revolute/prismatic joint constraints in Rapier
✅ Collision highlight flash polish
✅ Collision highlighting made persistent (stays red while colliding, not time-out based)
✅ Collision highlighting applied to both arm segments AND environment objects simultaneously
✅ Object positioning adjusted to minimize gap between objects and work table surface

### Day 5 — Gemini AI Integration ✅ COMPLETE (May 15–16)
✅ AI integration consolidated into `TaskEditorPanel` (Tasks tab is now the canonical AI surface)
✅ `Generate motion` now uses current scene + arm context and streams ReAct steps
✅ `AI Results` in TaskEditor shows Confidence, Safety, Reachability, and Target Pickability
✅ Actions in TaskEditor `AI Results`: `AI Fix`, `AI Suggestions`, `Think Trace`, `Auto-config Arm`
✅ Auto-config behavior supports constrained arm tuning (segment length scaling, optional extra segment, gripper tuning)
✅ Empty-plan guard prevents silent Start/End-only graph replacement
✅ Backend normalization + alias hardening prevents repair crashes on partial Gemini JSON
✅ Collision-risk detection promoted into deterministic preflight errors with suggested safe waypoint strategy
✅ `/ai/plan` now performs bounded repair iterations when preflight fails (reach/collision/precondition)
✅ Dedicated backend `/ai/suggest` endpoint now returns server-grounded motion suggestions (Gemini + deterministic merge)
✅ Strict pickup object-consistency validation enforces same pre-close move target name and auto-corrects mismatches
✅ Startup automation now resolves port 8000 conflicts programmatically and runs endpoint self-tests (`/ai/plan`, `/ai/repair`, `/ai/suggest`)
✅ Generate-motion autonomy handoff now auto-switches to Simulate and auto-starts playback after AI plan/fix completion
✅ TaskFlow synchronization hardened: Tasks canvas now acknowledges AI load events before auto-navigation
✅ AI planning now performs iterative collision-repair loops (compile-check + repair) before simulation handoff
✅ Backend `/ai/plan` now fails closed (no `task_spec` emitted) when blocking safety errors remain after repair iterations
✅ Pre-simulation execution gate now enforces scene-target existence + successful pickup when pickable objects exist before auto-switch to Simulate
✅ TaskEditor AI Results now exposes animated pre-simulation verification state (Idle/Verifying/Ready/Blocked)
✅ App-level simulation listener now hard-blocks auto-run unless shared execution gate state is `ready`
✅ TaskEditor AI Results now includes Gate Debug diagnostics panel (compile status, collision frames, pickup checks, missing targets, blocked reasons)
✅ First E2E autonomy regression skeleton added for prompt→ack→gate→autoplay and blocked-path assertions (`e2e/autonomy-regression.spec.ts`)
✅ AI flow now normalizes Gemini target names to canonical scene IDs before compile/gate checks (prevents false `missing target` blocks)
✅ Deterministic fallback pick-and-place planner now runs when Gemini retries exhaust (keeps autonomous flow alive for prompts like `Pick up Box B and place on shelf`)
✅ AI Results no longer appears empty on failed generation: verification state + Gate Debug render even without a generated TaskSpec
✅ Fallback plan schema now matches backend `/ai/repair` contract (`stepId`, `targetName`, explicit move coordinates), fixing 422 repair failures
✅ Repair-loop errors are now fail-soft in frontend (captured as gate failure reason instead of crashing generation flow)
✅ Simulation collision behavior default updated: collisions now pause playback instead of auto-rewinding to earlier/start frames
✅ Playback compiler now freezes a scene snapshot during active playback and ignores live scene-sync drift, preventing mid-run frame reset to start after successful grip/carry
✅ Playback reset contract hardened: when playback returns to frame 0, dynamic scene objects now restore to compiled baseline positions in viewport and shared scene state
✅ Frame-0 baseline enforcement now restores object pose/state (position + rotation + zero velocities), preventing cylinders from staying rolled/laid down after reset
❌ MuJoCo cross-validation feed into TaskEditor AI results

**Added May 16, 2026 (Day 5 continuation):**
✅ Direct Gemini API via browser SDK — VITE_GEMINI_API_KEY, gemini-2.5-flash, 5-15s latency
✅ Model auto-fallback chain: 2.5-flash → 2.0-flash → 1.5-flash on 404/deprecated
✅ scenePlanner.ts — computeTransitHeight, computeSafePickSequence, buildRichSceneContext, computeObstacleAwareApproach, analyzeTaskFeasibility
✅ normalizeTaskCoordinates — post-processes Gemini output with proven-safe waypoints; fixed destination detection + role mapping
✅ CRITICAL resolveTarget fix: explicit x/y/z always take priority over scene lookup (single bug causing 919-1328 collision frames)
✅ armConfigOptimizer.ts — IK conditioning auto-scale, destination reachability check, arm auto-extend
✅ 4-step pre-flight: reach → gripper → IK conditioning → destination reachability (fully automatic)
✅ L5 retry loop with progressive arm scale ratios [0.40, 0.36, 0.30]
✅ Volumetric collision detection: LINK_COLLISION_RADIUS 2.2→4.5cm, JOINT_HOUSING_RADIUS 6.5cm, checkJointHousings()
✅ Surface collision rule: only work table skipped; elevated shelf IS detected as real obstacle
✅ Task feasibility analysis: pickup-ok / deposit-impossible as distinct infeasibility error with specific distances
✅ Obstacle-aware approach: detects shelf blocking pickup path, inserts Z-avoidance waypoint
✅ AI Results UI redesigned: air-* namespace, status banner, 3-col metric chips, disclosure tabs
✅ TaskEditorPanel always-mounted (display:none) — state survives tab navigation
✅ commitTask ACK timeout fixed: valid tasks never show false "Plan blocked"
✅ handleAIFix + handleAutoConfigForPickability removed — generation pipeline fully automatic
✅ MAX_LINK_SWEEP_COLLISIONS 80 → 150 (wider volumetric radii)
✅ Shelf height: dimensions[1] 0.02 → 0.08m (position unchanged); zone-shelf Y: 0.32 → 0.35
✅ regression_test.py + regression_test_boxb.py added

**Added May 17, 2026 (Day 6 completion — Export Pipeline Fixes):**
✅ server/export/templates/python_control.py.j2 — missing Python code template created (matches Arduino template style)
✅ server/main.py export_bundle slug sanitization — ASCII-safe filename for Content-Disposition header (fixes UnicodeEncodeError)
✅ server/export/bundle.py slug sanitization — ASCII-safe zip entry paths (Windows extraction-safe, fixes 0x80070057)
✅ server/main.py QR URL generator — uses live frontend origin instead of dead mirai-demo.vercel.app fallback
✅ QR URL now respects MIRAI_FRONTEND_URL env var or request origin for dynamic deployment URLs
✅ Live deployment verification: both Vercel (https://mirai-tech-ex-hackathon-transformin.vercel.app) and Railway (production.up.railway.app) confirmed 200 OK and healthy
✅ Old QR links pointing to mirai-demo.vercel.app confirmed 404 DEPLOYMENT_NOT_FOUND — QR fix prevents future link rot

**Immediate Next: Day 7 — Community + Famous Preloads + Presets**
- 🔜 Add community browse/import flow + seeded task library
- 🔜 Add famous preload tasks and real robot preset skins
- 🔜 Run the full E2E quality pass and 60fps verification
- 🔜 Finalize README / demo / submission prep for Day 8


### Day 6 — Backend + MuJoCo + Export ✅ COMPLETE
✅ FastAPI backend deployed (Docker, Railway-ready)
✅ WebSocket `WS /ws/simulate` — MuJoCo frame streaming
✅ MuJoCo MJCF/URDF builder from arm config
✅ Task executor in MuJoCo (same ExecutionPlan JSON as Rapier)
✅ MuJoCo validator consumes the same `ExecutionPlan` produced for Rapier playback
✅ Accuracy comparison badge ("94% accurate") in UI
✅ Confidence report derived from validation + rule checks, not raw LLM optimism
✅ Physics side-by-side replay — Rapier (left) vs. MuJoCo (right), divergence frames in red
✅ Servo lifespan predictor — torque data → predicted hours per joint

**Export:**
✅ Jinja2 code gen — Arduino `.ino` + Python `.py` templates (NOT LLM — deterministic)
✅ BOM generator from arm config with live AliExpress/Amazon pricing
✅ URDF export (ROS2-compatible)
✅ QR code generator — scan → hosted BOM + code page instantly
✅ Signed export — SHA-256 hash header in every downloaded file
✅ ZIP bundle — code + BOM + wiring diagram in one `.zip`

**New files added (Day 6):**
Backend:
  - `server/mujoco/mjcf_builder.py`
  - `server/mujoco/simulator.py`
  - `server/mujoco/metrics.py`
  - `server/models/mujoco_schemas.py`
  - `server/main.py` (WS endpoint)
Frontend:
  - `src/types/mujoco.ts`
  - `src/store/mujocoAtoms.ts`
  - `src/utils/mujocoClient.ts`
  - `src/components/simulation/MuJoCoViewport.tsx`
  - `src/components/simulation/DivergenceBadge.tsx`
  - `src/components/simulation/LifespanPanel.tsx`

**Architecture update:**
- Added WebSocket `/ws/simulate` contract: browser sends `ExecutionPlan`, receives MuJoCo validation frames, divergence metrics, and lifespan prediction.
- Dual physics flow: Rapier (client, 60fps) and MuJoCo (server, validation) both consume the same `ExecutionPlan` schema.
- Divergence badge and accuracy metrics now shown in TaskEditor AI Results and SimulationPanel.


### Day 7 — Community + Preloads + Presets (Not Started)
❌ Community browse/import flow + seeded task library
❌ Famous preload tasks + real robot preset skins
❌ Full E2E quality pass and 60fps verification

### Day 8 — Polish + Demo Prep + Submit (Not Started)
❌ Production deploys, final E2E testing, demo video, slide deck
❌ README final pass, repo cleanup, and submission before deadline

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

### Day 3 (May 13) — Task Editor (React Flow) ✅ COMPLETE

**Architecture:**
- `@xyflow/react` v12 (already installed — no new install)
- `ReactFlowProvider` + inner `FlowEditor` pattern for `useReactFlow()` access
- Jotai `pendingAddNodeAtom` for palette → canvas click-to-add communication
- `window.dispatchEvent('mirai:load-task')` for load-from-file → canvas communication
- `ghostArmTargetAtom` pre-wired — consumed by ArmViewer on Day 4

**New files created:**
- ✅ `src/types/task.ts` — SceneGraph, TaskSpec, TaskBlock, ValidationReport, ExecutionPlan; `BaseBlock extends Record<string, unknown>` for @xyflow/react v12 constraint
- ✅ `src/utils/sceneRegistry.ts` — default scene objects + target zones
- ✅ `src/store/taskAtoms.ts` — taskNodes, taskEdges, pendingAddNode, ghostArmTarget, selectedNodeId
- ✅ `src/utils/taskValidation.ts` — validateTask() pure function
- ✅ `src/utils/taskExport.ts` — exportTaskJson(), parseTaskJson(), loadTaskFromFile()
- ✅ `src/components/task-editor/nodes/StartNode.tsx` — start node (no delete button, always required)
- ✅ `src/components/task-editor/nodes/EndNode.tsx` — end node with delete button
- ✅ `src/components/task-editor/nodes/MoveNode.tsx` — target preset, XYZ coords, speed slider, approach select; delete + issue icons
- ✅ `src/components/task-editor/nodes/GripNode.tsx` — open/close semantic toggle (green/red), force slider; delete button
- ✅ `src/components/task-editor/nodes/WaitNode.tsx` — duration ms number input; delete button
- ✅ `src/components/task-editor/nodes/LoopNode.tsx` — repeat count stepper; delete button
- ✅ `src/components/task-editor/nodes/IfNode.tsx` — condition text input, dual then/else handles; delete button
- ✅ `src/components/task-editor/DeletableEdge.tsx` — custom edge with ×  button at midpoint (hover-reveal + selected-reveal), `interactionWidth: 20`
- ✅ `src/components/task-editor/NodePalette.tsx` — drag-to-canvas + click-to-add, 6 block types
- ✅ `src/components/task-editor/TaskEditorPanel.tsx` — task name, description, palette, validation footer
- ✅ `src/components/task-editor/TaskFlowCanvas.tsx` — ReactFlowProvider + FlowEditor, NODE_TYPES, EDGE_TYPES, 20-step undo history, Ctrl+S export, Ctrl+Z undo, drag-drop, fit-view, Background + Controls, localStorage reload persistence, trash clear control + Clear all dialog

**Modified files:**
- ✅ `src/main.tsx` — added `import '@xyflow/react/dist/style.css'` before local CSS
- ✅ `src/App.tsx` — TaskEditorPanel + TaskFlowCanvas wired into tasks nav; STEP_MAP; STATUS_MAP; step counter in header
- ✅ `src/App.css` — task-*, palette-*, flow-*, task-edge-* styles appended; dot-indicator node design (no left border); semantic toggle colors; edge delete button

**UX polish applied during session:**
- ✅ All node bodies use `nodrag` class — only the header stripe initiates node drag
- ✅ Force slider uses `nodrag` — no React Flow drag hijacking
- ✅ Delete (×) button on every deletable node header — `deleteElements` via useReactFlow
- ✅ GripNode open/close: green active (`#15803d`) / red active (`#991b1b`)
- ✅ Edge delete: transparent 36×36 hit zone at midpoint, fades in on hover or edge selection
- ✅ Task flow now persists across full webpage reload via local storage
- ✅ Clear-task UX shipped: red-outline trash control above zoom controls with Clear all confirmation dialog; clear action resets flow and task-name local storage

**Deliverable:** Visual task programmer with 7 node types, validation, drag-to-add palette, deletable edges, Ctrl+S export, Ctrl+Z undo, portable JSON download.

### Day 4 (May 14) — Physics Simulation (Rapier WASM)

**Architecture:** FK-driven arm (kinematic, deterministic) + Rapier for environment objects + FABRIK IK solver

**New files:**
- `src/types/simulation.ts` — SimFrame, ExecutionPlan, PlaybackStatus, JointMetrics
- `src/utils/forwardKinematics.ts` — FK for serial arm (Y-up, cumulative pitch + waist yaw)
- `src/utils/inverseKinematics.ts` — FABRIK IK (N joints, 2D plane + yaw decomposition)
- `src/utils/motionCompiler.ts` — compileTask(): graph traversal → SimFrame[] with baked IK + collision check
- `src/store/simAtoms.ts` — compiledPlan, playbackStatus, currentFrame, playbackSpeed, pathTrail (derived), `ptpSequencePlaying`
- `src/components/simulation/SceneObjects.tsx` — env objects with Rapier bodies (fixed surfaces, dynamic boxes/cylinders)
- `src/components/simulation/SimulatedArm.tsx` — FK-driven NESTED GROUP arm (proper articulation), kinematic Rapier sphere at gripper, hover/drag teach hooks
- `src/components/simulation/PathTrail.tsx` — glowing end-effector trail (BufferGeometry, pre-allocated)
- `src/components/simulation/SimViewer.tsx` — R3F Canvas + Physics wrapper + useSimPlayback() engine + manual teach/PTP controls + editable live XYZ + PTP Play-all + playback/teach interlocks
- `src/components/simulation/PlaybackControls.tsx` — compile + play/pause/step/rewind + 5 speed presets + PTP-sequence disable state + loaded task metadata name in header
- `src/components/simulation/TimelineScrubber.tsx` — seekable timeline with collision markers
- `src/components/simulation/JointHUD.tsx` — J0–JN angles + torque + velocity + at-limit highlight
- `src/components/simulation/PhysicsMetrics.tsx` — per-joint torque/speed cards + collision alert
- `src/components/simulation/SimulationPanel.tsx` — sidebar composing all sim UI

**Key decisions:**
- Arm uses FK (not Rapier joints) — deterministic, no instability
- Environment uses Rapier dynamic bodies — boxes physically react to kinematic gripper sphere
- All IK solved at compile time — render loop is pure lookup, guaranteed 60fps
- Collision detection baked into frames via AABB — reliable, not Rapier event-dependent
- SegmentChain is a recursive component — rotations accumulate via nested Three.js groups

- ✅ Task executor + deterministic motion compiler are operational (`TaskSpec` graph -> `ExecutionPlan` frames)
- ✅ Browser skill executor supports the current rigid-object pick/place flow
- ✅ Playback controls live: compile, play/pause, rewind, step, speed 0.25x–4x, jump-to-end
- ✅ Loop toggle + skip-collision-pause toggle wired via Jotai (`loopAtom`, `skipCollisionPauseAtom`)
- ✅ Reverse playback + reset controls added to transport
- ✅ Timeline scrubber live with collision markers + grip-empty warning markers
- ✅ Joint HUD + Physics metrics panels live and continuously updated
- ✅ Environment objects are active in scene + collision warnings now include surfaces (shelf/table)
- ✅ Camera focus-cycle and reset controls added to SimViewer
- ✅ Live tool-point coordinate readout (X/Y) added to simulation viewport (bottom-right)
- ✅ Physics metrics switched to per-joint line-by-line row layout
- ✅ Dynamic object reset on loop/rewind frame 0 (translation/rotation/velocities reset)
- ✅ Grip carry no-snap offset tracking implemented
- ✅ Approach-target freeze + runtime-correct grab alignment implemented (`approachTargetId` in `SimFrame`)
- ✅ Tasks canvas state now persists when switching tabs away from and back to Tasks
- ✅ Rapier rigid body per arm segment (Box + Cylinder colliders)
- ✅ Joint constraints — revolute (rotating), prismatic (sliding)
- ✅ Collision highlight mesh flash polish

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

**Real Robot Arm Presets (~2h) — Visual upgrade:**
- ❌ Load 2–3 free `.glb` mesh files (UR5, KUKA KR6 — CC-licensed from Sketchfab)
- ❌ "Real Robot" skin toggle in arm designer — replaces procedural mesh, keeps all joint/segment data
- ❌ Gemini adapts community task to the selected real arm's actual joint limits
- ❌ Demo moment: switch from custom builder view → KUKA mesh → same task plays on real geometry

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
| Frontend | React + TypeScript strict | **18.3.1** / 6.0 | Downgraded from 19 for R3F v8 compat |
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
├── package.json                 # All frontend deps, npm install ✅
├── vite.config.js               # Vite 7, port 5173 strictPort, @tailwindcss/vite plugin
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
    ├── App.tsx                  # 3-zone layout: header + panel + viewport + statusbar; nav wires Design/Tasks
    ├── App.css                  # Full design system (~1,550+ lines): hdr-*, panel-*, task-*, palette-*, flow-*
    ├── main.tsx                 # React entry + @xyflow/react CSS import
    ├── index.css                # @import tailwindcss + @theme tokens
    ├── vite-env.d.ts            # React 18 JSX augmentation for R3F
    ├── types/
    │   ├── arm.ts               # ArmSegment, GripperConfig, BOMItem, ValidationResult, ArmConfig
    │   ├── task.ts              # SceneGraph, TaskSpec, TaskBlock, ValidationReport, ExecutionPlan
    │   └── simulation.ts        # SimFrame, ExecutionPlan, PlaybackStatus, JointMetrics
    ├── store/
    │   ├── atoms.ts             # Jotai atoms: armSegments, armGripper, selectedSegmentId, isAdvancedMode, etc.
    │   ├── taskAtoms.ts         # taskNodes, taskEdges, pendingAddNode, ghostArmTarget, selectedNodeId
    │   └── simAtoms.ts          # compiledPlan, playback state, frame/speed, loop and collision pause toggles
    ├── utils/
    │   ├── armPhysics.ts        # calculateMaxReach, calculateTorqueAtJoint, validateArm
    │   ├── bomPricing.ts        # calculateBOM, getTotalBOMCost (72-piece BOM)
    │   ├── armExport.ts         # exportArmConfig, parseArmConfig, loadArmConfigFromFile
    │   ├── sceneRegistry.ts     # Default scene objects + target zones
    │   ├── taskValidation.ts    # validateTask() pure function
    │   ├── taskExport.ts        # exportTaskJson, parseTaskJson, loadTaskFromFile
    │   ├── forwardKinematics.ts # FK for serial arm
    │   ├── inverseKinematics.ts # FABRIK IK solver
    │   └── motionCompiler.ts    # Task graph -> deterministic SimFrame[] compiler
    └── components/
        ├── ArmViewer.tsx        # R3F Canvas, forwardRef, resetCamera(), lights, shadows, overlays
        ├── RobotArm.tsx         # Industrial arm: JointHousing, SegmentGroup (useFrame pulse), 3 gripper types
        ├── ReachEnvelope.tsx    # Wireframe reach sphere + 80% inner reference
        ├── JointArcOverlay.tsx  # Orange joint arc + fill
        ├── arm-designer/
        │   ├── ArmDesignerPanel.tsx  # Topbar + toolbar + content + drag-resize handle
        │   ├── SegmentList.tsx       # Add/remove/edit segments with sliders
        │   ├── GripperLibrary.tsx    # 3 gripper types: parallel jaw / suction cup / magnetic
        │   ├── ValidationPanel.tsx   # Torque/reach metrics + errors/warnings
        │   └── BOMCounter.tsx        # Live cost + collapsible BOM breakdown
        ├── task-editor/
        │   ├── DeletableEdge.tsx     # Custom edge with × delete button at midpoint
        │   ├── NodePalette.tsx       # Drag-to-canvas + click-to-add, 6 block types
        │   ├── TaskEditorPanel.tsx   # Task name, description, palette, validation footer
        │   ├── TaskFlowCanvas.tsx    # ReactFlowProvider + FlowEditor, NODE_TYPES, EDGE_TYPES, undo history
        │   └── nodes/
        │       ├── StartNode.tsx     # Start (no delete, always required)
        │       ├── EndNode.tsx       # End with delete button
        │       ├── MoveNode.tsx      # Target, XYZ, speed, approach; delete + issue icons
        │       ├── GripNode.tsx      # Open/close toggle (green/red), force slider; delete
        │       ├── WaitNode.tsx      # Duration ms input; delete
        │       ├── LoopNode.tsx      # Repeat count stepper; delete
        │       └── IfNode.tsx        # Condition input, then/else handles; delete
        └── simulation/
          ├── SceneObjects.tsx      # Rapier env objects + held/approach object control
          ├── SimulatedArm.tsx      # FK-driven articulated arm in simulation + hover/drag teach hooks
          ├── PathTrail.tsx         # End-effector trajectory trail
          ├── SimViewer.tsx         # Simulation canvas + playback runner + camera + manual teach/PTP controls
          ├── PlaybackControls.tsx  # Compile/transport/speed + loop/collision toggles
          ├── TimelineScrubber.tsx  # Seekable timeline + collision + grip-empty markers
          ├── JointHUD.tsx          # Live joint angle HUD
          ├── PhysicsMetrics.tsx    # Torque/speed metrics + sim alerts
          └── SimulationPanel.tsx   # Simulation sidebar composition
```

**Files that can be deleted:**
- `convert_blueprint.py` — one-time utility, no longer needed
- `MIRAI_BLUEPRINT.html` — PDF conversion artifact, no longer needed

---

## CURRENT BUILD STATUS

| Component | Status | Notes |
|---|---|---|
| package.json | ✅ Complete | All deps installed |
| npm install | ✅ Done | `--legacy-peer-deps` (reactflow v12 / React 18 conflict) |
| vite.config.js | ✅ Done | @tailwindcss/vite plugin, port 5173 strictPort |
| tsconfig.json | ✅ Done | Strict mode |
| tailwind.config.js | ✅ Done | |
| index.html | ✅ Done | |
| src/App.tsx | ✅ Complete | 3-zone layout, Design + Tasks nav wired |
| src/App.css | ✅ Complete | ~1,550+ lines, full design system |
| src/store/atoms.ts | ✅ Complete | Fully typed Jotai atoms |
| src/store/taskAtoms.ts | ✅ Complete | Task editor atoms |
| src/types/arm.ts | ✅ Complete | ArmSegment, GripperConfig, BOMItem, ArmConfig |
| src/types/task.ts | ✅ Complete | SceneGraph, TaskSpec, TaskBlock, ExecutionPlan |
| src/types/simulation.ts | ✅ Complete | SimFrame, ExecutionPlan, PlaybackStatus, JointMetrics (+ `approachTargetId`, `gripEmpty`) |
| src/components/ArmViewer.tsx | ✅ Complete | forwardRef + resetCamera(), lights, shadows |
| src/components/RobotArm.tsx | ✅ Complete | Industrial redesign: JointHousing, useFrame animations, 3 grippers |
| src/store/simAtoms.ts | ✅ Complete | compiledPlan, playbackStatus, frame/speed, loop, skipCollisionPause, ptpSequencePlaying |
| src/utils/forwardKinematics.ts | ✅ Complete | FK solver for serial arm |
| src/utils/inverseKinematics.ts | ✅ Complete | FABRIK IK solver |
| src/utils/motionCompiler.ts | ✅ Complete | Task graph -> SimFrame[] compiler with collision + grip semantics |
| src/components/arm-designer/* | ✅ Complete | 5 panel components all wired |
| src/components/task-editor/* | ✅ Complete | 15 files: 7 node types, palette, canvas, deletable edges |
| src/components/simulation/* | ✅ In Progress | SimViewer, SceneObjects, SimulatedArm, PathTrail, PlaybackControls, TimelineScrubber, JointHUD, PhysicsMetrics, SimulationPanel |
| server/main.py | ✅ Scaffold | Health check only — no AI endpoints yet (Day 5) |
| server/requirements.txt | ✅ Complete | MuJoCo 3.x included |
| pip install | ✅ Done | |
| git init + push | ✅ Done | github.com/Mizunandayo/mirai |
| App renders in browser | ✅ Live | localhost:5173, TypeScript clean |

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
    → TaskEditor-native AI Results (reachability/pickability/config-fix feedback)
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

### Current AI UX Surface (May 15 Update)
- Primary AI workflow is now in **Tasks → TaskEditorPanel** (not AI navbar)
- TaskEditor AI Results includes:
  - Reachability status + failing step details
  - Target pickability status against current arm + gripper + scene
  - One-click `Auto-config Arm` for non-pickable targets
  - ReAct `Think Trace` expandable panel
- Simulation object positions are synced back to shared scene state for AI grounding (realtime scene-aware planning)

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
