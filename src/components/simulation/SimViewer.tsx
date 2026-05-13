// src/components/simulation/SimViewer.tsx

import { useRef, useEffect, useCallback, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid, Html } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useAtom, useAtomValue } from 'jotai'
import { compiledPlanAtom, playbackStatusAtom, currentFrameAtom, currentSimFrameAtom, playbackSpeedAtom, loopAtom, skipCollisionPauseAtom } from '../../store/simAtoms'
import { sceneGraphAtom } from '../../store/taskAtoms'
import SceneObjects from './SceneObjects'
import SimulatedArm from './SimulatedArm'
import PathTrail from './PathTrail'





// Playback engine

function useSimPlayback() {
  const plan           = useAtomValue(compiledPlanAtom)
  const [status, setStatus] = useAtom(playbackStatusAtom)
  const [, setFrame]   = useAtom(currentFrameAtom)
  const speed          = useAtomValue(playbackSpeedAtom)
  const loop                = useAtomValue(loopAtom)
  const skipCollisionPause  = useAtomValue(skipCollisionPauseAtom)
  const intervalRef         = useRef<number | null>(null)
  
  



  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
    }
  }, [])



  useEffect(() => {
    clearTick()
    if ((status !== 'playing' && status !== 'reverse_playing') || !plan) return

    const isReverse = status === 'reverse_playing'

    const msPerFrame = 1000 / (plan.fps * speed)

    intervalRef.current = window.setInterval(() => {
      setFrame((prev) => {
        const next = isReverse ? prev - 1 : prev + 1

        if (!isReverse && next >= plan.totalFrames) {
          if (loop) {
            return 0
          }
          setStatus('complete')
          clearTick()
          return plan.totalFrames - 1
        }

        if (isReverse && next < 0) {
          if (loop) {
            return plan.totalFrames - 1
          }
          setStatus('idle')
          clearTick()
          return 0
        }

        const nextFrameData = plan.frames[next]
        if (nextFrameData?.isCollision && !plan.frames[prev]?.isCollision && !skipCollisionPause) {
          // First collision frame — pause and let user see it (unless bypass is on)
          setStatus('collision_paused')
          clearTick()
          return next
        }
        return next
      })
    }, msPerFrame)

    return clearTick
  }, [status, plan, speed, loop, skipCollisionPause, setFrame, setStatus, clearTick])


}






// ─── Scene content (inside Canvas) ───────────────────────────────────────────

const SIM_FOCUS = [
  { pos: [1.2, 0.6, 1.5] as [number, number, number], tgt: [0, 0.05, 0] as [number, number, number] }, // Base
  { pos: [2.0, 1.4, 2.6] as [number, number, number], tgt: [0, 0.40, 0] as [number, number, number] }, // Mid
  { pos: [0.8, 2.8, 1.5] as [number, number, number], tgt: [0, 0.30, 0] as [number, number, number] }, // Top
]

const TYPE_COLOR: Record<string, string> = {
  surface:  '#6b7280',
  box:      '#2563eb',
  cylinder: '#16a34a',
  zone:     '#7c3aed',
}

function SceneLabels() {
  const scene = useAtomValue(sceneGraphAtom)
  return (
    <>
      {scene.objects.map((obj) => {
        const [x, y, z] = obj.position
        const labelY = y + obj.dimensions[1] / 2 + 0.08
        const color = TYPE_COLOR[obj.type] ?? '#374151'
        return (
          <Html
            key={obj.id}
            position={[x, labelY, z]}
            center
            distanceFactor={4}
            zIndexRange={[10, 20]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="sim-scene-label" style={{ '--label-color': color } as React.CSSProperties}>
              {obj.name}
            </div>
          </Html>
        )
      })}
      {scene.targetZones.map((zone) => {
        const [x, y, z] = zone.position
        return (
          <Html
            key={zone.id}
            position={[x, y + 0.06, z]}
            center
            distanceFactor={4}
            zIndexRange={[10, 20]}
            style={{ pointerEvents: 'none' }}
          >
            <div className="sim-scene-label" style={{ '--label-color': '#7c3aed' } as React.CSSProperties}>
              {zone.name}
            </div>
          </Html>
        )
      })}
    </>
  )
}

function SimScene({ showLabels, focusLevel, resetSignal }: { showLabels: boolean; focusLevel: 0 | 1 | 2; resetSignal: number }) {
  const controlsRef = useRef<any>(null)

  useEffect(() => {
    if (!controlsRef.current) return
    const f = SIM_FOCUS[focusLevel]
    controlsRef.current.object.position.set(...f.pos)
    controlsRef.current.target.set(...f.tgt)
    controlsRef.current.update()
  }, [focusLevel, resetSignal])

  return (
    <>
      <PerspectiveCamera makeDefault position={[2.0, 1.4, 2.6]} fov={38} />
      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.06}
        maxDistance={6}
        minDistance={0.5}
        target={[0, 0.4, 0]}
      />

      {/* Lighting — same quality as ArmViewer */}
      <ambientLight intensity={0.68} />
      <hemisphereLight args={['#ffffff', '#e6ddd0', 0.7]} />
      <directionalLight
        position={[3.8, 5.6, 4.2]}
        intensity={1.3}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-3.4, 2.2, -2.5]} intensity={0.20} color="#8aa0b6" />
      <pointLight position={[2.6, 1.4, 2.8]}  intensity={0.28} color="#c88b70" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.003, 0]} receiveShadow>
        <planeGeometry args={[18, 18]} />
        <meshStandardMaterial color="#f6f1e9" metalness={0} roughness={1} />
      </mesh>

      <Grid
        args={[10, 10]}
        cellSize={0.2}
        cellThickness={0.35}
        cellColor="#d7d1c8"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#beb4a8"
        fadeDistance={10}
        fadeStrength={1.2}
        followCamera={false}
        infiniteGrid
      />

      {/* Physics world — environment objects + kinematic arm collider */}
      <Physics gravity={[0, -9.81, 0]} timeStep="vary">
        <SceneObjects />
        <SimulatedArm />
      </Physics>

      {/* Path trail (outside Physics — purely visual) */}
      <PathTrail />

      {/* Floating object labels */}
      {showLabels && <SceneLabels />}
    </>
  )
}





// ─── SimViewer export ─────────────────────────────────────────────────────────

export default function SimViewer() {
  useSimPlayback()
  const status = useAtomValue(playbackStatusAtom)
  const currentSimFrame = useAtomValue(currentSimFrameAtom)
  const [showLabels, setShowLabels] = useState(false)
  const [focusLevel, setFocusLevel] = useState<0 | 1 | 2>(1)
  const [resetSignal, setResetSignal] = useState(0)

  const [toolX = 0, toolY = 0] = currentSimFrame?.endEffectorPos ?? [0, 0, 0]

  const STATUS_INFO: Record<string, { label: string; color: string }> = {
    idle: { label: 'Ready', color: '#555555' },
    playing: { label: 'Playing', color: '#22c55e' },
    reverse_playing: { label: 'Reversing', color: '#0f766e' },
    paused: { label: 'Paused', color: '#f59e0b' },
    collision_paused: { label: 'Collision Detected', color: '#ef4444' },
    complete: { label: 'Complete', color: '#3b82f6' },
  }
  const statusInfo = STATUS_INFO[status] ?? STATUS_INFO.idle

  const FOCUS_LABELS = ['Base', 'Mid', 'Top'] as const
  const FOCUS_DOT_Y  = [13, 8, 3] as const

  function handleFocusCycle() {
    const next = ((focusLevel + 1) % 3) as 0 | 1 | 2
    setFocusLevel(next)
  }

  function handleReset() {
    setFocusLevel(1)
    setResetSignal((s) => s + 1)
  }

  return (
    <div className="sim-viewer">
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 38 }}
      >
        <SimScene showLabels={showLabels} focusLevel={focusLevel} resetSignal={resetSignal} />
      </Canvas>

      {/* Camera focus cycle — Base / Mid / Top */}
      <button
        className={`viewport-focus-btn${focusLevel !== 1 ? ' viewport-focus-btn--active' : ''}`}
        onClick={handleFocusCycle}
        title={`Camera focus: ${FOCUS_LABELS[focusLevel]} — click to cycle`}
        aria-label={`Camera focus: ${FOCUS_LABELS[focusLevel]}`}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <line x1="8" y1="1.5" x2="8" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.35"/>
          <line x1="5.5" y1="3" x2="10.5" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
          <line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
          <line x1="5.5" y1="13" x2="10.5" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
          <circle cx="8" cy={FOCUS_DOT_Y[focusLevel]} r="2.8" fill="currentColor"/>
        </svg>
      </button>

      {/* Camera reset */}
      <button
        className="viewport-reset-btn"
        onClick={handleReset}
        title="Reset camera to default"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M13.5 2.5v4.5h-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M13.36 7A6 6 0 1 1 10.5 3.14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Status + Labels toggle — top-right overlay */}
      <div style={{ position: 'absolute', top: 12, right: 104, display: 'flex', alignItems: 'center', gap: 8, zIndex: 22 }}>
        <div className="sim-status-row sim-status-row--compact sim-status-pill" style={{ flexShrink: 0 }}>
          <span className="sim-status-dot" style={{ background: statusInfo.color }} />
          <span className="sim-status-label" style={{ color: statusInfo.color }}>{statusInfo.label}</span>
        </div>
        <button
          className={`sim-labels-toggle${showLabels ? ' sim-labels-toggle--active' : ''}`}
          onClick={() => setShowLabels((v) => !v)}
          title={showLabels ? 'Hide object labels' : 'Show object labels'}
          aria-pressed={showLabels}
          style={{ position: 'static' }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="3" width="8" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M9 5.5h3M11 4l1.5 1.5L11 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <line x1="3" y1="10" x2="7" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.5"/>
          </svg>
          Labels
        </button>
      </div>

      {/* Live tool-point coordinates */}
      <div className="sim-tool-point-readout" aria-live="polite">
        <span className="sim-tool-point-label">Point</span>
        <span className="sim-tool-point-coord">X {toolX.toFixed(3)}</span>
        <span className="sim-tool-point-coord">Y {toolY.toFixed(3)}</span>
      </div>
    </div>
  )
}