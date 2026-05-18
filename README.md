# Mirai - AI-Powered Robot Arm Simulator

Mirai is a browser-first robotics platform that lets users design robot arms, generate tasks from natural language, validate plans, run physics simulation, and export hardware-ready code.

Built for the Transforming Enterprise Through AI Hackathon (Track 3: Robotics and Simulation).

## Live Demo

- Frontend app: https://mirai-tech-ex-hackathon-transformin.vercel.app
- Backend API: https://production.up.railway.app
- Repository: https://github.com/Mizunandayo/mirai

## Quick Demo Flow (For Judges)

1. Open the frontend app.
2. Go to Design and load a robot preset.
3. Go to Tasks and generate a plan from natural language.
4. Review AI pre-flight validation status.
5. Run simulation and verify playback.
6. Export artifacts (Arduino, Python, BOM, URDF, signed ZIP).

## Current Project State (May 2026)

- Core build complete through Day 7 milestones.
- Day 8 polish and submission tasks are in progress.
- 60fps in-browser simulation flow is implemented with deterministic motion playback.
- Dual-physics architecture is live:
	- Rapier WASM in browser for real-time simulation.
	- MuJoCo on backend for validation, divergence checks, and servo lifespan prediction.
- Gemini-powered planning and repair workflow is integrated in the task editor.
- Community library is implemented with seeded tasks and famous preloads.
- Export pipeline is live for Arduino, Python, BOM, URDF, and signed ZIP bundles.

## What Mirai Does

- Design custom robot arms in 3D with segment and gripper configuration.
- Define tasks through a visual graph editor or natural language input.
- Generate structured plans using Gemini based on scene and arm context.
- Run deterministic safety and feasibility checks before simulation.
- Simulate tasks in-browser at interactive framerates.
- Validate execution accuracy against MuJoCo backend simulation.
- Export build-ready artifacts for real hardware workflows.

## Core Pipeline

1. SceneGraph
2. TaskSpec
3. ValidationReport
4. ExecutionPlan
5. Rapier simulation (client)
6. MuJoCo validation (server)
7. Export bundle generation

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite 7 |
| 3D and Physics (client) | React Three Fiber, Drei, Rapier WASM |
| Visual Task Editor | React Flow (@xyflow/react) |
| State Management | Jotai |
| AI | Gemini via @google/generative-ai |
| Backend | FastAPI, Uvicorn |
| Validation Physics (server) | MuJoCo 3.x |
| Export Pipeline | Jinja2 templates, deterministic generators |
| E2E Testing | Playwright |

## Quick Start

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
pip install -r server/requirements.txt
```

### 2. Configure environment

Create a local environment file from .env.example and provide your keys and secrets.

Required values include:

- GEMINI_API_KEY
- JWT_SECRET
- DATABASE_URL
- VITE_GEMINI_API_KEY (optional but recommended for direct frontend Gemini flow)

### 3. Run frontend

```bash
npm run dev
```

Frontend default URL: http://localhost:5173

### 4. Run backend

```bash
cd server
python -m uvicorn main:app --reload
```

Backend default URL: http://localhost:8000

## Common Scripts

```bash
npm run dev
npm run build
npm run preview
npm run test:e2e
```

## Project Structure

```text
mirai/
|- src/                     # Main React + TypeScript app
|  |- components/           # Designer, task editor, simulation, community, export UI
|  |- utils/                # Planning, kinematics, compiler, AI and export helpers
|  |- store/                # Jotai atoms for app, AI, simulation, MuJoCo, tasks
|  |- data/                 # Community tasks, presets, BOM catalog
|  |- types/                # Arm/task/simulation/AI/mujoco contracts
|  |- App.tsx
|- server/                  # FastAPI backend
|  |- main.py
|  |- models/
|  |- mujoco/
|  |- export/
|  |- tests/
|  |- requirements.txt
|- e2e/                     # Playwright tests
|- docs/                    # Static docs site assets
|- miraistaticpage/         # Marketing/landing static page
|- mirai-deck.html          # Pitch deck
|- mirai-script.html        # Presentation script
```

## Hackathon Context

- Event: Transforming Enterprise Through AI
- Track: Track 3 - Robotics and Simulation
- Build phase: May 11-19, 2026
- Submission deadline: May 19, 2026, 8:00 AM PST

## License

This project is licensed under the MIT License. See LICENSE for details.
