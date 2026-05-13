// src/components/simulation/PlaybackControls.tsx

import { useAtom, useAtomValue } from 'jotai'
import { useEffect } from 'react'
import { taskNodesAtom, taskEdgesAtom, sceneGraphAtom } from '../../store/taskAtoms'
import { armSegmentsAtom } from '../../store/atoms'
import {
  compiledPlanAtom,
  playbackStatusAtom,
  currentFrameAtom,
  playbackSpeedAtom,
  loopAtom,
  skipCollisionPauseAtom,
} from '../../store/simAtoms'
import { compileTask } from '../../utils/motionCompiler'
import TimelineScrubber from './TimelineScrubber'
import type { PlaybackSpeed } from '../../types/simulation'






const SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 1, 2, 4]
const SPEED_LABELS: Record<PlaybackSpeed, string> = {
  0.25: '1/4x',
  0.5:  '1/2x',
  1:    '1x',
  2:    '2x',
  4:    '4x',
}






export default function PlaybackControls() {
  const nodes    = useAtomValue(taskNodesAtom)
  const edges    = useAtomValue(taskEdgesAtom)
  const segments = useAtomValue(armSegmentsAtom)
  const scene    = useAtomValue(sceneGraphAtom)

  const [plan,   setPlan]   = useAtom(compiledPlanAtom)
  const [status, setStatus] = useAtom(playbackStatusAtom)
  const [frame,  setFrame]  = useAtom(currentFrameAtom)
  const [speed,  setSpeed]  = useAtom(playbackSpeedAtom)
  const [loop, setLoop] = useAtom(loopAtom)
  const [skipCollisionPause, setSkipCollisionPause] = useAtom(skipCollisionPauseAtom)



  const taskNameNode = nodes.find((n) => n.data.kind === 'start')
  const taskName     = taskNameNode?.data.label ?? 'Untitled Task'



  // ── Auto-compile on dependency change ──
  useEffect(() => {
    const compiled = compileTask(nodes, edges, segments, scene, taskName)
    if (compiled) {
      setPlan(compiled)
      setStatus('idle')
      setFrame(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, segments, scene, taskName])

  // ── Transport ──
  const handlePlay = () => {
    if (!plan) return
    if (status === 'complete') {
      setFrame(0)
    }
    setStatus('playing')
  }

  const handleReversePlay = () => {
    if (!plan) return
    if (frame <= 0) {
      setFrame(plan.totalFrames - 1)
    }
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

  const isPlaying  = status === 'playing' || status === 'reverse_playing'
  const noplan     = !plan
  const totalFrames = plan?.totalFrames ?? 0

  return (
    <section className="sim-section">
      <div className="sim-playback-top">
        <div className="sim-playback-header-row" style={{ alignItems: 'center', display: 'flex', gap: 16, width: '100%' }}>
          <div className="sim-playback-label" style={{ flexShrink: 0 }}>Simulation player</div>
        </div>
        
      </div>

      <div className="sim-action-group" style={{ marginTop: 8, marginBottom: 0, flexWrap: 'nowrap' }}>
        <button
          className={`sim-transport-btn sim-control-btn${loop ? ' sim-control-btn--active' : ''}`}
          onClick={() => setLoop(!loop)}
          title="Loop playback"
          aria-label="Loop playback"
          aria-pressed={loop}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 5.5A4.5 4.5 0 0 1 7 1h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M10 3.5L11.5 1.9L13 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13.5 10.5A4.5 4.5 0 0 1 9 15H4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 12.5L4.5 14.1L3 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="sr-only">Loop</span>
        </button>

        <button
          className={`sim-transport-btn sim-control-btn${skipCollisionPause ? ' sim-control-btn--active' : ''}`}
          onClick={() => setSkipCollisionPause(!skipCollisionPause)}
          title="Bypass collision pause"
          aria-label="Bypass collision pause"
          aria-pressed={skipCollisionPause}
          type="button"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5C8 2.5 3.5 3.5 3.5 6.5c0 4.5 4.5 7 4.5 7s4.5-2.5 4.5-7c0-3-4.5-4-4.5-4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M8 7.5v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="8" cy="6.2" r="0.7" fill="currentColor"/>
          </svg>
          <span className="sr-only">Bypass collision pause</span>
        </button>

                <button
          className="sim-transport-btn sim-transport-btn--small"
          onClick={handleReset}
          disabled={noplan}
          title="Reset playback"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M11.8 4.8A4.8 4.8 0 1 0 12 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <path d="M9.2 2.2h2.8V5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      <div className="sim-transport sim-transport--centered" style={{ marginTop: 8, marginBottom: 0 }}>

        <button
          className="sim-transport-btn sim-transport-btn--small"
          onClick={handleStepBack}
          disabled={noplan || frame === 0}
          title="Step back"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M9 3L4 7l5 4V3z" fill="currentColor"/>
            <line x1="3" y1="3" x2="3" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>

        <button
          className="sim-transport-btn sim-transport-btn--small"
          onClick={handleReversePlay}
          disabled={noplan}
          title="Play in reverse"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <polygon points="11,2 2,7 11,12" fill="currentColor"/>
          </svg>
        </button>
        {isPlaying ? (
          <button
            className="sim-transport-btn sim-transport-btn--primary"
            onClick={handlePause}
            title="Pause"
          >
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor"/>
              <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor"/>
            </svg>
          </button>
        ) : (
          <button
            className="sim-transport-btn sim-transport-btn--primary"
            onClick={handlePlay}
            disabled={noplan}
            title="Play"
          >
            <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
              <polygon points="3,2 12,7 3,12" fill="currentColor"/>
            </svg>
          </button>
        )}
        <button
          className="sim-transport-btn sim-transport-btn--small"
          onClick={handleStepForward}
          disabled={noplan || frame >= totalFrames - 1}
          title="Step forward"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M5 3l5 4-5 4V3z" fill="currentColor"/>
            <line x1="11" y1="3" x2="11" y2="11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
        <button
          className="sim-transport-btn sim-transport-btn--small"
          onClick={() => { setFrame(totalFrames - 1); setStatus('complete') }}
          disabled={noplan}
          title="Jump to end"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M2 3l6 4-6 4V3zM12 2v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
      <div className="sim-speed-group" style={{ marginTop: 8, marginBottom: 0 }}>


        {SPEEDS.map((s) => (
          <button
            key={s}
            className={`sim-transport-btn sim-speed-control-btn${speed === s ? ' sim-speed-control-btn--active' : ''}`}
            onClick={() => setSpeed(s)}
            title={`Speed ${SPEED_LABELS[s]}`}
            aria-label={`Speed ${SPEED_LABELS[s]}`}
            aria-pressed={speed === s}
            type="button"
          >
            <span className="sim-speed-control-label">{SPEED_LABELS[s]}</span>
          </button>
        ))}
      </div>
      <TimelineScrubber />
    </section>
  )
}