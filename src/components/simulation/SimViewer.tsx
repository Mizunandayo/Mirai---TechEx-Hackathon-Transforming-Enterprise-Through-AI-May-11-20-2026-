// src/components/simulation/SimViewer.tsx

import { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, Grid, Html } from '@react-three/drei'
import { Physics } from '@react-three/rapier'
import { useAtom, useAtomValue } from 'jotai'
import { compiledPlanAtom, playbackStatusAtom, currentFrameAtom, currentSimFrameAtom, playbackSpeedAtom, loopAtom, skipCollisionPauseAtom, ptpSequencePlayingAtom, autoRewindOnCollisionAtom, collisionRewindFramesAtom, collisionFlashMsAtom } from '../../store/simAtoms'
import { sceneGraphAtom } from '../../store/taskAtoms'
import { armSegmentsAtom } from '../../store/atoms'
import { forwardKinematics, clampPitchAngles } from '../../utils/forwardKinematics'
import { solveIK } from '../../utils/inverseKinematics'
import SceneObjects from './SceneObjects'
import SimulatedArm from './SimulatedArm'
import PathTrail from './PathTrail'
import './simulation-polish.css'





// Playback engine

function useSimPlayback() {
  const plan           = useAtomValue(compiledPlanAtom)
  const [status, setStatus] = useAtom(playbackStatusAtom)
  const [, setFrame]   = useAtom(currentFrameAtom)
  const speed          = useAtomValue(playbackSpeedAtom)
  const loop                = useAtomValue(loopAtom)
  const skipCollisionPause  = useAtomValue(skipCollisionPauseAtom)
  const autoRewindOnCollision = useAtomValue(autoRewindOnCollisionAtom)
  const collisionRewindFrames = useAtomValue(collisionRewindFramesAtom)
  const collisionFlashMs = useAtomValue(collisionFlashMsAtom)
  const intervalRef         = useRef<number | null>(null)
  const rewindTimeoutRef    = useRef<number | null>(null)
  
  



  const clearTick = useCallback(() => {
    if (intervalRef.current !== null) {
        window.clearInterval(intervalRef.current)
        intervalRef.current = null
    }
    if (rewindTimeoutRef.current !== null) {
        window.clearTimeout(rewindTimeoutRef.current)
        rewindTimeoutRef.current = null
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
          return 0
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

          if (autoRewindOnCollision) {
            const flashDelayMs = Math.max(120, Math.min(3000, collisionFlashMs || 420))
            const rewindBy = Math.max(1, Math.min(240, Math.floor(collisionRewindFrames || 12)))
            const rewindTarget = Math.max(0, next - rewindBy)

            rewindTimeoutRef.current = window.setTimeout(() => {
              setFrame(rewindTarget)
              setStatus('paused')
              rewindTimeoutRef.current = null
            }, flashDelayMs)
          }

          return next
        }
        return next
      })
    }, msPerFrame)

    return clearTick
  }, [status, plan, speed, loop, skipCollisionPause, autoRewindOnCollision, collisionRewindFrames, collisionFlashMs, setFrame, setStatus, clearTick])


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

function SimScene({
  showLabels,
  focusLevel,
  resetSignal,
  teachMode,
  controlsLocked,
  selectedPartId,
  hoveredPartId,
  isManipulating,
  poseOverride,
  onHoverPart,
  onBeginManipulation,
}: {
  showLabels: boolean
  focusLevel: 0 | 1 | 2
  resetSignal: number
  teachMode: boolean
  controlsLocked: boolean
  selectedPartId: string | null
  hoveredPartId: string | null
  isManipulating: boolean
  poseOverride: { waistYawDeg: number; pitchAngles: number[]; endEffectorPos: [number, number, number] } | null
  onHoverPart: (partId: string | null) => void
  onBeginManipulation: (partId: string) => void
}) {
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
        enabled={!isManipulating && !(teachMode && controlsLocked)}
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
        <SimulatedArm
          interactive={teachMode}
          selectedPartId={selectedPartId}
          hoveredPartId={hoveredPartId}
          onHoverPart={onHoverPart}
          onBeginManipulation={onBeginManipulation}
          poseOverride={poseOverride}
        />
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
  const [, setPlaybackStatus] = useAtom(playbackStatusAtom)
  const currentSimFrame = useAtomValue(currentSimFrameAtom)
  const segments = useAtomValue(armSegmentsAtom)
  const [showLabels, setShowLabels] = useState(false)
  const [focusLevel, setFocusLevel] = useState<0 | 1 | 2>(1)
  const [resetSignal, setResetSignal] = useState(0)
  const [teachMode, setTeachMode] = useState(false)
  const [teachCameraLocked, setTeachCameraLocked] = useState(false)
  const [selectedPartId, setSelectedPartId] = useState<string | null>(null)
  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null)
  const [dragPartId, setDragPartId] = useState<string | null>(null)
  const [isMouseIkDragging, setIsMouseIkDragging] = useState(false)
  const [teachPitchAngles, setTeachPitchAngles] = useState<number[]>([])
  const [teachWaistYawDeg, setTeachWaistYawDeg] = useState(0)
  const [ptpPoints, setPtpPoints] = useState<Array<{ x: number; y: number; z: number }>>([])
  const [ptpSequencePlaying, setPtpSequencePlaying] = useAtom(ptpSequencePlayingAtom)
  const ptpSequenceTimerRef = useRef<number | null>(null)

  // Editable X/Y/Z input state for live readout
  const [manualX, setManualX] = useState('')
  const [manualY, setManualY] = useState('')
  const [manualZ, setManualZ] = useState('')

  const activeHighlightPartId = isMouseIkDragging ? (dragPartId ?? selectedPartId) : selectedPartId

  const frameTool = currentSimFrame?.endEffectorPos ?? [0, 0, 0]
  const framePitchAngles = currentSimFrame?.pitchAngles ?? []
  const frameWaistYaw = currentSimFrame?.waistYawDeg ?? 0

  useEffect(() => {
    if (teachMode) {
      setTeachPitchAngles(framePitchAngles)
      setTeachWaistYawDeg(frameWaistYaw)
    }
  }, [teachMode])

  const teachPose = useMemo(() => {
    if (!teachMode) return null
    const clamped = clampPitchAngles(segments, teachPitchAngles)
    const fk = forwardKinematics(segments, clamped, teachWaistYawDeg)
    return {
      waistYawDeg: teachWaistYawDeg,
      pitchAngles: clamped,
      endEffectorPos: fk.endEffector,
    }
  }, [teachMode, teachPitchAngles, teachWaistYawDeg, segments])

  const activeTool = teachMode && teachPose ? teachPose.endEffectorPos : frameTool
  const [toolX = 0, toolY = 0, toolZ = 0] = activeTool

  // Keep the editable coordinate fields synced with the live end-effector pose.
  useEffect(() => {
    setManualX(toolX.toFixed(3))
    setManualY(toolY.toFixed(3))
    setManualZ(toolZ.toFixed(3))
  }, [toolX, toolY, toolZ])

  function getRevoluteIndexForPart(partId: string | null): number {
    if (!partId) return -1
    const revolveCount = segments.filter((s) => s.joint !== 'fixed').length
    if (revolveCount === 0) return -1

    if (partId === 'gripper') return revolveCount - 1
    if (!partId.startsWith('segment-')) return -1

    const segIndex = Number.parseInt(partId.replace('segment-', ''), 10)
    if (Number.isNaN(segIndex) || segIndex < 0) return -1

    let revolveIndex = -1
    for (let i = 0; i <= segIndex && i < segments.length; i++) {
      if (segments[i].joint !== 'fixed') revolveIndex += 1
    }
    return revolveIndex
  }

  useEffect(() => {
    if (!isMouseIkDragging || !teachMode) return

    function onPointerMove(ev: PointerEvent) {
      const dx = ev.movementX ?? 0
      const dy = ev.movementY ?? 0

      if (!dragPartId) return

      if (dragPartId === 'waist') {
        setTeachWaistYawDeg((prev) => prev + dx * 0.25)
        return
      }

      const idx = getRevoluteIndexForPart(dragPartId)
      if (idx < 0) return

      setTeachPitchAngles((prev) => {
        const next = [...prev]
        const current = next[idx] ?? 0
        const delta = ev.ctrlKey ? (-dy * 0.10) : (-dy * 0.22 + dx * 0.06)
        next[idx] = current + delta
        return clampPitchAngles(segments, next)
      })
    }

    function onPointerUp() {
      setIsMouseIkDragging(false)
      setDragPartId(null)
      // Return to hover-only highlight behavior after drag ends.
      setSelectedPartId(null)
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [isMouseIkDragging, teachMode, dragPartId, segments])

  const STATUS_INFO: Record<string, { label: string; color: string }> = {
    idle: { label: 'Ready', color: '#555555' },
    playing: { label: 'Playing', color: '#22c55e' },
    reverse_playing: { label: 'Reversing', color: '#0f766e' },
    paused: { label: 'Paused', color: '#f59e0b' },
    collision_paused: { label: 'Collision Detected', color: '#ef4444' },
    complete: { label: 'Complete', color: '#3b82f6' },
  }
  const statusInfo = STATUS_INFO[status] ?? STATUS_INFO.idle
  const hasFrameCollision = currentSimFrame?.isCollision ?? false
  const visibleStatusInfo = hasFrameCollision ? STATUS_INFO.collision_paused : statusInfo
  const isTransportPlaying = status === 'playing' || status === 'reverse_playing'

  useEffect(() => {
    if (!isTransportPlaying) return
    // Regular playback takes control of the arm, so disable teach interactions.
    if (teachMode) setTeachMode(false)
    if (teachCameraLocked) setTeachCameraLocked(false)
  }, [isTransportPlaying, teachMode, teachCameraLocked])

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

  function applyManualTarget(nextX: number, nextY: number, nextZ: number) {
    if (!Number.isFinite(nextX) || !Number.isFinite(nextY) || !Number.isFinite(nextZ)) return

    if (!teachMode) {
      setTeachMode(true)
      setTeachCameraLocked(true)
    }

    const ik = solveIK(segments, [nextX, nextY, nextZ])
    setTeachWaistYawDeg(ik.waistYawDeg)
    setTeachPitchAngles(ik.pitchAngles)
  }

  function handleManualCoordChange(axis: 'x' | 'y' | 'z', raw: string) {
    if (axis === 'x') setManualX(raw)
    if (axis === 'y') setManualY(raw)
    if (axis === 'z') setManualZ(raw)

    const rawX = axis === 'x' ? raw : manualX
    const rawY = axis === 'y' ? raw : manualY
    const rawZ = axis === 'z' ? raw : manualZ

    const nextX = rawX === '' ? toolX : Number(rawX)
    const nextY = rawY === '' ? toolY : Number(rawY)
    const nextZ = rawZ === '' ? toolZ : Number(rawZ)

    applyManualTarget(nextX, nextY, nextZ)
  }

  function handleSaveCurrentPoint() {
    const nextPoint = {
      x: parseFloat(toolX.toFixed(3)),
      y: parseFloat(toolY.toFixed(3)),
      z: parseFloat(toolZ.toFixed(3)),
    }

    setPtpPoints((prev) => [
      // Avoid adding exact duplicate saved coordinates.
      ...(prev.some((pt) => pt.x === nextPoint.x && pt.y === nextPoint.y && pt.z === nextPoint.z)
        ? prev
        : [...prev, nextPoint]),
    ])
  }

  function handleDeletePoint(indexToDelete: number) {
    setPtpPoints((prev) => prev.filter((_, index) => index !== indexToDelete))
  }

  function handleClearPoints() {
    stopPtpSequencePlayback()
    setPtpPoints([])
  }

  function stopPtpSequencePlayback() {
    if (ptpSequenceTimerRef.current !== null) {
      window.clearInterval(ptpSequenceTimerRef.current)
      ptpSequenceTimerRef.current = null
    }
    setPtpSequencePlaying(false)
  }

  function handlePlayAllPoints() {
    if (ptpPoints.length === 0 || ptpSequencePlaying || isTransportPlaying) return

    setPlaybackStatus('paused')
    setPtpSequencePlaying(true)

    if (!teachMode) {
      setTeachMode(true)
      setTeachCameraLocked(true)
    }

    const points = ptpPoints.map((pt) => [pt.x, pt.y, pt.z] as [number, number, number])
    if (points.length === 1) {
      applyManualTarget(points[0][0], points[0][1], points[0][2])
      stopPtpSequencePlayback()
      return
    }

    let segmentIndex = 0
    let t = 0
    const tickMs = 20
    const segmentDurationMs = 900
    const step = tickMs / segmentDurationMs

    applyManualTarget(points[0][0], points[0][1], points[0][2])

    ptpSequenceTimerRef.current = window.setInterval(() => {
      const from = points[segmentIndex]
      const to = points[segmentIndex + 1]
      t += step

      const alpha = Math.min(t, 1)
      const x = from[0] + (to[0] - from[0]) * alpha
      const y = from[1] + (to[1] - from[1]) * alpha
      const z = from[2] + (to[2] - from[2]) * alpha
      applyManualTarget(x, y, z)

      if (alpha >= 1) {
        segmentIndex += 1
        t = 0
        if (segmentIndex >= points.length - 1) {
          stopPtpSequencePlayback()
        }
      }
    }, tickMs)
  }

  useEffect(() => {
    return () => {
      if (ptpSequenceTimerRef.current !== null) {
        window.clearInterval(ptpSequenceTimerRef.current)
      }
      setPtpSequencePlaying(false)
    }
  }, [setPtpSequencePlaying])

  function handleTeachModeToggle() {
    setTeachMode((prev) => {
      const next = !prev
      if (next) {
        // Default teach mode to locked camera so drag gestures control teaching only.
        setTeachCameraLocked(true)
      }
      if (!next) {
        setSelectedPartId(null)
        setHoveredPartId(null)
        setDragPartId(null)
        setIsMouseIkDragging(false)
        setTeachCameraLocked(false)
      }
      return next
    })
  }

  function handleTeachCameraLockToggle() {
    if (!teachMode) return
    setTeachCameraLocked((prev) => !prev)
  }

  return (
    <div className="sim-viewer">
      <Canvas
        shadows
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        camera={{ fov: 38 }}
        onContextMenu={(e) => {
          if (teachMode) e.preventDefault()
        }}
      >
        <SimScene
          showLabels={showLabels}
          focusLevel={focusLevel}
          resetSignal={resetSignal}
          teachMode={teachMode}
          controlsLocked={teachCameraLocked}
          selectedPartId={activeHighlightPartId}
          hoveredPartId={hoveredPartId}
          isManipulating={isMouseIkDragging}
          poseOverride={teachPose}
          onBeginManipulation={(partId) => {
            setSelectedPartId(partId)
            setHoveredPartId(partId)
            setDragPartId(partId)
            setIsMouseIkDragging(true)
          }}
          onHoverPart={(partId) => {
            if (isMouseIkDragging) return
            setHoveredPartId(partId)
          }}
        />
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
          <span className="sim-status-dot" style={{ background: visibleStatusInfo.color }} />
          <span className="sim-status-label" style={{ color: visibleStatusInfo.color }}>{visibleStatusInfo.label}</span>
        </div>
        <button
          className={`sim-teach-toggle${teachMode ? ' sim-teach-toggle--active' : ''}`}
          onClick={handleTeachModeToggle}
          title={teachMode ? 'Disable teach mode' : 'Enable teach mode'}
          aria-pressed={teachMode}
        >
          Teach
        </button>
        <button
          className={`sim-teach-lock-btn${teachMode && teachCameraLocked ? ' sim-teach-lock-btn--active' : ''}`}
          onClick={handleTeachCameraLockToggle}
          title={teachMode ? (teachCameraLocked ? 'Unlock viewport camera' : 'Lock viewport camera') : 'Enable Teach mode first'}
          aria-pressed={teachMode && teachCameraLocked}
          disabled={!teachMode}
        >
          {teachCameraLocked ? 'Lock' : 'Free'}
        </button>
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

      {/* PTP stack + live tool-point coordinates */}
      <div className="sim-tool-point-stack">
        {teachMode && (
          <div className="sim-teach-hint">
            {selectedPartId || hoveredPartId
              ? `Part: ${hoveredPartId ?? selectedPartId}. Hover auto-highlights. Hold left-click and move mouse to drive that joint. Camera ${teachCameraLocked ? 'locked' : 'free'}.`
              : 'Teach mode: hover a robot part, hold left-click, then move mouse to drive it.'}
          </div>
        )}

        <div className="sim-ptp-list" aria-label="Saved PTP coordinates">
          {ptpPoints.length === 0 ? (
            <div className="sim-ptp-empty">No saved coordinates</div>
          ) : (
            ptpPoints.map((pt, index) => (
              <div key={`${pt.x}-${pt.y}-${pt.z}-${index}`} className="sim-ptp-item">
                <span className="sim-ptp-item-text">P{index + 1}:   X {pt.x.toFixed(3)},  Y {pt.y.toFixed(3)},  Z {pt.z.toFixed(3)}</span>
                <button
                  type="button"
                  className="sim-ptp-item-delete"
                  onClick={() => handleDeletePoint(index)}
                  title="Delete saved point"
                  aria-label={`Delete saved point ${index + 1}`}
                >
                  x
                </button>
              </div>
            ))
          )}
        </div>

        {ptpPoints.length > 0 && (
          <div className="sim-ptp-action-row" style={{ display: 'flex', gap: 8 }}>
            <button
              className="sim-ptp-clear-btn"
              onClick={handleClearPoints}
              type="button"
              title="Clear all saved points"
              disabled={ptpSequencePlaying}
            >
              Clear all
            </button>
            <button
              className="sim-ptp-clear-btn"
              onClick={handlePlayAllPoints}
              type="button"
              title="Play all saved points"
              disabled={ptpSequencePlaying || isTransportPlaying}
              style={{ flex: 1 }}
            >
              {ptpSequencePlaying ? 'Playing...' : 'Play all'}
            </button>
          </div>
        )}

        <button
          className="sim-ptp-save-btn"
          onClick={handleSaveCurrentPoint}
          type="button"
          title="Save current tool-point coordinates"
        >
          Save current point
        </button>

        <div className="sim-tool-point-readout" aria-live="polite" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="sim-tool-point-label">Point</span>
          X
          <input
            type="number"
            step="0.001"
            min="-999"
            max="999"
            className="sim-tool-point-coord sim-tool-point-input"
            style={{ width: 56 }}
            aria-label="Live X coordinate"
            value={manualX}
            onChange={(e) => handleManualCoordChange('x', e.target.value)}
          />
          Y
          <input
            type="number"
            step="0.001"
            min="-999"
            max="999"
            className="sim-tool-point-coord sim-tool-point-input"
            style={{ width: 56 }}
            aria-label="Live Y coordinate"
            value={manualY}
            onChange={(e) => handleManualCoordChange('y', e.target.value)}
          />
          Z
          <input
            type="number"
            step="0.001"
            min="-999"
            max="999"
            className="sim-tool-point-coord sim-tool-point-input"
            style={{ width: 56 }}
            aria-label="Live Z coordinate"
            value={manualZ}
            onChange={(e) => handleManualCoordChange('z', e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}