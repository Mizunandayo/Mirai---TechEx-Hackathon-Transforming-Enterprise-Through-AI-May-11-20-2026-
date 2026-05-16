import { useAtom, useAtomValue } from 'jotai'
import { useEffect, useMemo, useRef } from 'react'
import { taskNodesAtom, taskEdgesAtom, sceneGraphAtom, taskNameAtom } from '../../store/taskAtoms'
import { armSegmentsAtom } from '../../store/atoms'
import {
  compiledPlanAtom,
  playbackStatusAtom,
  currentFrameAtom,
  playbackSpeedAtom,
  loopAtom,
  skipCollisionPauseAtom,
  ptpSequencePlayingAtom,
  simBaselineObjectStatesAtom,
} from '../../store/simAtoms'
import { compileTask } from '../../utils/motionCompiler'
import TimelineScrubber from './TimelineScrubber'
import type { PlaybackSpeed } from '../../types/simulation'

const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2, 4]
const SPEED_LABELS: Record<PlaybackSpeed, string> = {
  0.25: '1/4x',
  0.5: '1/2x',
  1: '1x',
  2: '2x',
  4: '4x',
}














export default function PlaybackControls() {
  const nodes = useAtomValue(taskNodesAtom)
  const edges = useAtomValue(taskEdgesAtom)
  const segments = useAtomValue(armSegmentsAtom)
  const scene = useAtomValue(sceneGraphAtom)
  const taskName = useAtomValue(taskNameAtom)

  const [plan, setPlan] = useAtom(compiledPlanAtom)
  const [status, setStatus] = useAtom(playbackStatusAtom)
  const [frame, setFrame] = useAtom(currentFrameAtom)
  const [speed, setSpeed] = useAtom(playbackSpeedAtom)
  const [loop, setLoop] = useAtom(loopAtom)
  const [skipCollisionPause, setSkipCollisionPause] = useAtom(skipCollisionPauseAtom)
  const [, setBaselineObjectStates] = useAtom(simBaselineObjectStatesAtom)
  const ptpSequencePlaying = useAtomValue(ptpSequencePlayingAtom)
  const pendingAutoPlayRef = useRef(false)
  const sceneSnapshotRef = useRef(scene)
  const lastCompiledSignatureRef = useRef<string>('')

  const isPlaybackActive =
    status === 'playing' || status === 'reverse_playing' || status === 'collision_paused'

  const compileSignature = useMemo(() => {
    const compactNodes = nodes.map((node) => ({
      id: node.id,
      type: node.type,
      data: node.data,
      position: node.position,
    }))
    const compactEdges = edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
    }))
    const compactSegments = segments.map((segment) => ({
      id: segment.id,
      length: segment.length,
      mass: segment.mass,
      joint: segment.joint,
      min: segment.jointLimitMin,
      max: segment.jointLimitMax,
    }))

    return JSON.stringify({
      taskName,
      nodes: compactNodes,
      edges: compactEdges,
      segments: compactSegments,
    })
  }, [taskName, nodes, edges, segments])

  useEffect(() => {
    // Freeze scene snapshot while playback is active to prevent live scene-sync updates
    // from re-triggering plan resets mid-execution.
    if (isPlaybackActive) return
    if (frame !== 0) return
    sceneSnapshotRef.current = scene
  }, [scene, isPlaybackActive, frame])

  useEffect(() => {
    if (isPlaybackActive) return
    if (compileSignature === lastCompiledSignatureRef.current && plan) return

    const compiled = compileTask(nodes, edges, segments, sceneSnapshotRef.current, taskName)
    if (compiled) {
      const baseline = Object.fromEntries(
        sceneSnapshotRef.current.objects.map((obj) => [
          obj.id,
          {
            position: [...obj.position] as [number, number, number],
            rotation: [0, 0, 0, 1] as [number, number, number, number],
            scale: (obj.scale ? [...obj.scale] : [1, 1, 1]) as [number, number, number],
          },
        ]),
      )
      setBaselineObjectStates(baseline)
      setPlan(compiled)
      setStatus('idle')
      setFrame(0)
      lastCompiledSignatureRef.current = compileSignature
    }
  }, [
    compileSignature,
    nodes,
    edges,
    segments,
    taskName,
    isPlaybackActive,
    plan,
    setPlan,
    setBaselineObjectStates,
    setStatus,
    setFrame,
  ])

  useEffect(() => {
    const handleAutoPlay = () => {
      if (ptpSequencePlaying) return
      if (!plan) {
        pendingAutoPlayRef.current = true
        return
      }
      setFrame(0)
      setStatus('playing')
    }

    window.addEventListener('mirai:auto-play-sim', handleAutoPlay)
    return () => {
      window.removeEventListener('mirai:auto-play-sim', handleAutoPlay)
    }
  }, [plan, ptpSequencePlaying, setFrame, setStatus])

  useEffect(() => {
    if (!pendingAutoPlayRef.current || !plan || ptpSequencePlaying) return
    pendingAutoPlayRef.current = false
    setFrame(0)
    setStatus('playing')
  }, [plan, ptpSequencePlaying, setFrame, setStatus])

  const handlePlay = () => {
    if (!plan) return
    if (status === 'complete') setFrame(0)
    setStatus('playing')
  }

  const handleReversePlay = () => {
    if (!plan) return
    if (frame <= 0) setFrame(plan.totalFrames - 1)
    setStatus('reverse_playing')
  }

  const handlePause = () => {
    if (status === 'playing' || status === 'reverse_playing') setStatus('paused')
  }

  const handleReset = () => {
    setFrame(0)
    setStatus('idle')
  }

  const handleStepForward = () => {
    if (!plan) return
    setFrame((f) => Math.min(f + 1, plan.totalFrames - 1))
    setStatus('paused')
  }

  const handleStepBack = () => {
    setFrame((f) => Math.max(f - 1, 0))
    setStatus('paused')
  }

  const isPlaying = status === 'playing' || status === 'reverse_playing'
  const noPlan = !plan
  const totalFrames = plan?.totalFrames ?? 0












  
  return (
    <section className="sim-section" aria-disabled={ptpSequencePlaying} style={ptpSequencePlaying ? { opacity: 0.56 } : undefined}>
      <div className="sim-playback-top">
        <div className="sim-playback-header-row" style={{ alignItems: 'center', gap: 16, width: '100%' }}>
          <div className="sim-playback-label" style={{ flexShrink: 0 }}>Simulation player</div>
          <div
            style={{
              minWidth: 0,
              fontFamily: 'Poppins, sans-serif',
              fontSize: '0.86rem',
              fontWeight: 600,
              color: '#1a1a1a',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={taskName}
            aria-label={`Current task: ${taskName}`}
          >
            Task: {taskName}
          </div>
        </div>
      </div>

      <div className="sim-action-group" style={{ marginTop: 8, marginBottom: 0, flexWrap: 'nowrap' }}>
        <button
          className={`sim-transport-btn sim-control-btn${loop ? ' sim-control-btn--active' : ''}`}
          onClick={() => setLoop(!loop)}
          disabled={ptpSequencePlaying}
          title="Loop playback"
          aria-label="Loop playback"
          aria-pressed={loop}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M10.6 4.7A4.1 4.1 0 0 0 3.9 4.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M3.9 4.1v2.2h2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3.4 9.3A4.1 4.1 0 0 0 10.1 9.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            <path d="M10.1 9.9V7.7H7.9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className={`sim-transport-btn sim-control-btn${skipCollisionPause ? ' sim-control-btn--active' : ''}`}
          onClick={() => setSkipCollisionPause(!skipCollisionPause)}
          disabled={ptpSequencePlaying}
          title="Bypass collision pause"
          aria-label="Bypass collision pause"
          aria-pressed={skipCollisionPause}
          type="button"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M7 1.8l4.3 1.5v3.1c0 2.3-1.6 4.3-4.3 5.9-2.7-1.6-4.3-3.6-4.3-5.9V3.3L7 1.8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
            <path d="M5.4 7.2l1.1 1.1 2-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <button
          className="sim-transport-btn sim-transport-btn--small"
          onClick={handleReset}
          disabled={noPlan || ptpSequencePlaying}
          title="Reset playback"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M11.6 3.2v3.2H8.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11.5 6.6A4.9 4.9 0 1 1 9.2 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="sim-transport sim-transport--centered" style={{ marginTop: 8, marginBottom: 0 }}>
        <button className="sim-transport-btn sim-transport-btn--small" onClick={handleStepBack} disabled={noPlan || frame === 0 || ptpSequencePlaying} title="Step back" aria-label="Step back">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M10.8 3.2L5.7 7.5l5.1 4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M4 3.1v8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="sim-transport-btn sim-transport-btn--small" onClick={handleReversePlay} disabled={noPlan || ptpSequencePlaying} title="Play in reverse" aria-label="Play in reverse">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M9.8 3.4L4.4 7.5l5.4 4.1V3.4Z" fill="currentColor"/>
            <path d="M11.7 3.4v8.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
        </button>

        {isPlaying ? (
          <button className="sim-transport-btn sim-transport-btn--primary" onClick={handlePause} disabled={ptpSequencePlaying} title="Pause" aria-label="Pause">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <rect x="4.2" y="3.8" width="3.2" height="10.4" rx="1" fill="currentColor"/>
              <rect x="10.6" y="3.8" width="3.2" height="10.4" rx="1" fill="currentColor"/>
            </svg>
          </button>
        ) : (
          <button className="sim-transport-btn sim-transport-btn--primary" onClick={handlePlay} disabled={noPlan || ptpSequencePlaying} title="Play" aria-label="Play">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M5.6 3.9L14 9l-8.4 5.1V3.9Z" fill="currentColor"/>
            </svg>
          </button>
        )}

        <button className="sim-transport-btn sim-transport-btn--small" onClick={handleStepForward} disabled={noPlan || frame >= totalFrames - 1 || ptpSequencePlaying} title="Step forward" aria-label="Step forward">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M4.2 3.2l5.1 4.3-5.1 4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M11 3.1v8.8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <button className="sim-transport-btn sim-transport-btn--small" onClick={() => { setFrame(totalFrames - 1); setStatus('complete') }} disabled={noPlan || ptpSequencePlaying} title="Jump to end" aria-label="Jump to end">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
            <path d="M3.4 3.4l5.4 4.1-5.4 4.1V3.4Z" fill="currentColor"/>
            <path d="M10.8 3.3v8.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="sim-speed-group" style={{ marginTop: 8, marginBottom: 0 }}>
        {SPEEDS.map((s) => (
          <button
            key={s}
            className={`sim-transport-btn sim-speed-control-btn${speed === s ? ' sim-speed-control-btn--active' : ''}`}
            onClick={() => setSpeed(s)}
            disabled={ptpSequencePlaying}
            title={`Speed ${SPEED_LABELS[s]}`}
            aria-label={`Speed ${SPEED_LABELS[s]}`}
            aria-pressed={speed === s}
            type="button"
          >
            <span className="sim-speed-control-label">{SPEED_LABELS[s]}</span>
          </button>
        ))}
      </div>

      <div style={ptpSequencePlaying ? { pointerEvents: 'none', opacity: 0.55 } : undefined}>
        <TimelineScrubber />
      </div>
    </section>
  )
}