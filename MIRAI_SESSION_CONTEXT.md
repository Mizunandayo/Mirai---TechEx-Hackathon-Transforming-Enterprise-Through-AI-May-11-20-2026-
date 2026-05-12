# Mirai — Session Context
**Last updated:** Tuesday, May 12, 2026 — Day 3 implementation guide written. User to implement.

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
| `MIRAI_BLUEPRINT.md` | ✅ v2.0 — fully updated |
| `MIRAI_BLUEPRINT.pdf` | ✅ Generated (1,017 KB) |
| `backend/.env` | ✅ GEMINI_API_KEY, JWT_SECRET, DATABASE_URL |
| `server/requirements.txt` | ✅ mujoco>=3.1.0 |
| `package.json` | ✅ All deps, npm installed |
| `vite.config.js` | ✅ @tailwindcss/vite plugin, port 5173 |
| `src/index.css` | ✅ @import tailwindcss + @theme tokens |
| `src/vite-env.d.ts` | ✅ React 18 JSX augmentation |
| `src/main.tsx` | ✅ Imports index.css + App.css + Atkinson font |
| `src/App.tsx` | ✅ 3-zone layout (header + panel + viewport + footer) |
| `src/App.css` | ✅ Full design system (~1,550 lines): hdr-* header + panel redesign + BOM :has() expand rules + panel-resize-handle + no-transition-while-resizing |
| `src/types/arm.ts` | ✅ ArmSegment, GripperConfig, BOMItem, ValidationResult, ArmConfig |
| `src/store/atoms.ts` | ✅ Fully typed Jotai atoms |
| `src/utils/armPhysics.ts` | ✅ calculateMaxReach, calculateTorqueAtJoint, validateArm |
| `src/utils/bomPricing.ts` | ✅ calculateBOM, getTotalBOMCost (72-piece BOM) |
| `src/utils/armExport.ts` | ✅ exportArmConfig, parseArmConfig, loadArmConfigFromFile |
| `src/components/ArmViewer.tsx` | ✅ Full R3F scene, lights, shadows, grid |
| `src/components/RobotArm.tsx` | ✅ Dynamic segments, click-to-select, 3 gripper types |
| `src/components/ReachEnvelope.tsx` | ✅ Wireframe reach sphere |
| `src/components/JointArcOverlay.tsx` | ✅ Joint arc + fill |
| `src/components/arm-designer/ArmDesignerPanel.tsx` | ✅ Topbar + toolbar (tabs + icon btns) + content + footer + right-edge drag-resize handle (min 336px, max 560px) |
| `src/components/arm-designer/SegmentList.tsx` | ✅ Add/remove/edit with sliders |
| `src/components/arm-designer/GripperLibrary.tsx` | ✅ 3 gripper types with expand controls |
| `src/components/arm-designer/ValidationPanel.tsx` | ✅ Metrics + errors + warnings |
| `src/components/arm-designer/BOMCounter.tsx` | ✅ Live cost + collapsible BOM; expanded: parts list top, Estimated cost row bottom (CSS order), no redundant total row |
| `server/main.py` | ✅ FastAPI skeleton + health check |
| `convert_blueprint.py` | Can be deleted |
| `MIRAI_BLUEPRINT.html` | Can be deleted |

---

## Extended Day 2 UX Polish — COMPLETE
- ✅ Nav click toggles panel open/close (smooth CSS width transition)
- ✅ `ArmViewer` converted to `forwardRef`, exposes `resetCamera()` via `useImperativeHandle`
- ✅ Viewport camera reset button (top-right, SVG spin animation)
- ✅ Dismissable viewport hint pill (left of reset button, SVG X close)
- ✅ BOM expanded: fills full panel height; collapses `.panel-toolbar` + `.panel-content` via CSS `:has()`
- ✅ BOM text quality: Poppins, no gray, no small text
- ✅ BOM expanded layout: parts list at top, Estimated cost row at bottom, redundant total row removed
- ✅ Panel right-edge drag-to-resize (min 336px · max 560px · no-transition while dragging · body cursor lock)

## Next Up — Day 3 (Task Editor) — IMPLEMENTATION GUIDE PROVIDED

### Architecture decisions confirmed:
- Package `@xyflow/react` v12.3.2 (already installed — NO new install needed)
- CSS import: `import '@xyflow/react/dist/style.css'` in `main.tsx` (before App.css)
- Pattern: `ReactFlowProvider` outer wrapper + `FlowEditor` inner component (useReactFlow() works)
- State sync: React Flow local state → Jotai atoms on every change → validation runs
- Cross-component comms: `pendingAddNodeAtom` (palette → canvas click-to-add)
- Load comms: `window.dispatchEvent(new CustomEvent('mirai:load-task', ...))` (panel → canvas)
- Ghost arm: `ghostArmTargetAtom` pre-wired, consumed by ArmViewer Day 4
- History: `useRef` stack (20 entries max), Ctrl+Z undo
- Keyboard: Ctrl+S export, Ctrl+Z undo, Delete (React Flow native)

### New files to create (in order):
1. `src/types/task.ts`
2. `src/utils/sceneRegistry.ts`
3. `src/store/taskAtoms.ts`
4. `src/utils/taskValidation.ts`
5. `src/utils/taskExport.ts`
6. `src/components/task-editor/nodes/StartNode.tsx`
7. `src/components/task-editor/nodes/EndNode.tsx`
8. `src/components/task-editor/nodes/MoveNode.tsx`
9. `src/components/task-editor/nodes/GripNode.tsx`
10. `src/components/task-editor/nodes/WaitNode.tsx`
11. `src/components/task-editor/nodes/LoopNode.tsx`
12. `src/components/task-editor/nodes/IfNode.tsx`
13. `src/components/task-editor/NodePalette.tsx`
14. `src/components/task-editor/TaskEditorPanel.tsx`
15. `src/components/task-editor/TaskFlowCanvas.tsx`

### Modified files:
- `src/main.tsx` — add `import '@xyflow/react/dist/style.css'` before local CSS
- `src/App.tsx` — import TaskEditorPanel + TaskFlowCanvas; update handleNavClick; swap viewport content when activeNav==='tasks'; update step counter + status bar
- `src/App.css` — append ~350 lines of task-*, palette-*, flow-* styles at bottom

### Node type → accent color mapping:
- start: #0d0d0d | end: #374151 | move: #1d4ed8 | grip: #15803d | wait: #b45309 | loop: #6d28d9 | if: #b91c1c

### TaskSpec JSON schema (v1.0) is the canonical contract for:
- Day 5: Gemini `/ai/plan` output
- Day 6: Jinja2 code export input + MuJoCo validator input

### Scene objects registered in sceneRegistry.ts:
table, box-a, box-b, cylinder-a, shelf, drawer + 3 target zones (zone-shelf, zone-drawer, zone-table-center)

---

## Hackathon Deadline
**May 19, 2026 — 8:00 AM Philippine Standard Time**
Day 2 complete (+ extended polish). Day 3 (Task Editor / React Flow) starts next. 7 days remaining.

---

## Security Note
⚠️ `GEMINI_API_KEY` is in `backend/.env` — `.gitignore` covers `.env` files. **DO NOT COMMIT.**
