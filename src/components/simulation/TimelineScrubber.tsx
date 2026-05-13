// src/components/simulation/TimelineScrubber.tsx

import { useRef, useCallback } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import { compiledPlanAtom, currentFrameAtom, playbackStatusAtom, playbackProgressAtom } from '../../store/simAtoms'








export default function TimelineScrubber() {
  const plan      = useAtomValue(compiledPlanAtom)
  const progress  = useAtomValue(playbackProgressAtom)
  const [frame, setFrame] = useAtom(currentFrameAtom)
  const setStatus = useAtom(playbackStatusAtom)[1]
  const trackRef  = useRef<HTMLDivElement>(null)

  const seekToProgress = useCallback((clientX: number) => {
    if (!plan || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const t    = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
    const newFrame = Math.round(t * (plan.totalFrames - 1))
    setFrame(newFrame)
    setStatus('paused')
  }, [plan, setFrame, setStatus])

  const handleMouseDown = (e: React.MouseEvent) => {
    seekToProgress(e.clientX)
    const onMove  = (ev: MouseEvent) => seekToProgress(ev.clientX)
    const onUp    = () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  if (!plan) return null

  // Mark collision frames as red ticks on the timeline
  const collisionFrames = plan.frames
    .filter((f) => f.isCollision && (f.frameIndex === 0 || !plan.frames[f.frameIndex - 1]?.isCollision))
    .map((f) => f.frameIndex / (plan.totalFrames - 1))

  // Mark grip-empty frames as amber ticks (gripper closed, nothing grabbed)
  const gripEmptyFrames = plan.frames
    .filter((f) => f.gripEmpty && (f.frameIndex === 0 || !plan.frames[f.frameIndex - 1]?.gripEmpty))
    .map((f) => f.frameIndex / (plan.totalFrames - 1))

  const currentTimeS = ((frame / plan.fps)).toFixed(2)
  const totalTimeS   = (plan.durationMs / 1000).toFixed(2)













  
  return (
    <div className="sim-timeline">
      <div className="sim-timeline-time sim-timeline-time--left">
        {currentTimeS}s
      </div>

      <div
        className="sim-timeline-track"
        ref={trackRef}
        onMouseDown={handleMouseDown}
        style={{ cursor: 'pointer' }}
        role="slider"
        aria-label="Simulation timeline"
        aria-valuenow={frame}
        aria-valuemin={0}
        aria-valuemax={plan.totalFrames - 1}
      >
        {/* Fill bar */}
        <div
          className="sim-timeline-fill"
          style={{ width: `${progress * 100}%` }}
        />

        {/* Collision markers */}
        {collisionFrames.map((pos, i) => (
          <div
            key={i}
            className="sim-timeline-marker sim-timeline-marker--collision"
            style={{ left: `${pos * 100}%` }}
            title="Collision"
          />
        ))}

        {/* Grip-empty markers */}
        {gripEmptyFrames.map((pos, i) => (
          <div
            key={`ge-${i}`}
            className="sim-timeline-marker sim-timeline-marker--grip-empty"
            style={{ left: `${pos * 100}%` }}
            title="Gripper closed — no object in range"
          />
        ))}

        {/* Scrub handle */}
        <div
          className="sim-timeline-handle"
          style={{ left: `${progress * 100}%` }}
        />
      </div>

      <div className="sim-timeline-time sim-timeline-time--right">
        {totalTimeS}s
      </div>
    </div>
  )
}