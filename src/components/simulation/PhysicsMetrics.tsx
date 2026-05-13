// src/components/simulation/PhysicsMetrics.tsx

import { useAtomValue } from 'jotai'
import { currentSimFrameAtom, compiledPlanAtom } from '../../store/simAtoms'
import { armSegmentsAtom } from '../../store/atoms'



interface PhysicsMetricsProps {
  showHeader?: boolean
}

export default function PhysicsMetrics({ showHeader = true }: PhysicsMetricsProps) {
  const frame    = useAtomValue(currentSimFrameAtom)
  const plan     = useAtomValue(compiledPlanAtom)
  const segments = useAtomValue(armSegmentsAtom)

  const revolveSegs = segments.filter((s) => s.joint !== 'fixed')
  const torques     = frame?.jointTorques ?? []
  const velocities  = frame?.jointVelocities ?? []
  const isCollision = frame?.isCollision ?? false

  if (!plan) return null

  // Peak torques across all frames
  const peakTorques = revolveSegs.map((_, i) =>
    Math.max(...plan.frames.map((f) => f.jointTorques[i] ?? 0))
  )









  return (
    <section className="sim-section">
      {showHeader && <header className="sim-section-hdr">Physics</header>}

      {/* Alerts */}
      {isCollision && (
        <div className="sim-alert sim-alert--collision">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <path d="M7 2L13 12H1L7 2z" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="7" y1="6" x2="7" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="10.5" r="0.7" fill="currentColor"/>
          </svg>
          Collision at frame {frame?.frameIndex}
          {frame?.collidingObjectId && ` — ${frame.collidingObjectId}`}
        </div>
      )}

      {frame?.gripEmpty && (
        <div className="sim-alert sim-alert--grip-empty">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
            <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="7" y1="4.5" x2="7" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="7" cy="9.5" r="0.7" fill="currentColor"/>
          </svg>
          Gripper closed — no object in range
        </div>
      )}

      {/* Per-joint metrics, one row per joint */}
      <div className="sim-metrics-list">
        {revolveSegs.map((seg, i) => {
          const current        = torques[i] ?? 0
          const peak           = peakTorques[i] ?? 0
          const vel            = velocities[i] ?? 0
          const utilizationPct = peak > 0 ? (current / peak * 100) : 0

          return (
            <div key={seg.id} className="sim-metric-row">
              <div className="sim-metric-row-top">
                <span className="sim-metric-name">J{i + 1}</span>
                <span className="sim-metric-reading">
                  <span className="sim-metric-val">{current.toFixed(2)}</span>
                  <span className="sim-metric-unit">Nm</span>
                </span>
                <span className="sim-metric-reading">
                  <span className="sim-metric-val">{vel.toFixed(0)}</span>
                  <span className="sim-metric-unit">°/s</span>
                </span>
              </div>
              <div className="sim-metric-bar-track">
                <div
                  className="sim-metric-bar"
                  style={{ width: `${Math.min(utilizationPct, 100)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}