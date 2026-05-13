// src/components/simulation/JointHUD.tsx

import { useAtomValue } from 'jotai'
import { currentSimFrameAtom } from '../../store/simAtoms'
import { armSegmentsAtom } from '../../store/atoms'




export default function JointHUD() {
    const segments = useAtomValue(armSegmentsAtom)
    const frame = useAtomValue(currentSimFrameAtom)
    
  const pitchAngles = frame?.pitchAngles ?? []
  const waistYaw    = frame?.waistYawDeg ?? 0
  const gripperOpen = frame?.gripperOpen ?? true
  const revolveSegs = segments.filter((s) => s.joint !== 'fixed')





 
  return (
    <section className="sim-section">
      <header className="sim-section-hdr">Joints</header>

      <div className="sim-joint-list">
        {/* J0 — Waist yaw */}
        <div className="sim-joint-row">
          <span className="sim-joint-label">J0 Waist</span>
          <span className="sim-joint-value">{waistYaw.toFixed(1)}°</span>
          <div className="sim-joint-bar-track">
            <div
              className="sim-joint-bar"
              style={{ width: `${Math.abs(waistYaw) / 180 * 100}%`, background: '#0d0d0d' }}
            />
          </div>
        </div>

        {/* Revolute joints */}
        {revolveSegs.map((seg, i) => {
          const angle   = pitchAngles[i] ?? 0
          const range   = seg.jointLimitMax - seg.jointLimitMin
          const fill    = Math.abs(angle - seg.jointLimitMin) / Math.max(range, 1) * 100
          const atLimit = angle <= seg.jointLimitMin + 2 || angle >= seg.jointLimitMax - 2

          return (
            <div key={seg.id} className="sim-joint-row">
              <span className="sim-joint-label">J{i + 1} {seg.name}</span>
              <span
                className="sim-joint-value"
                style={{ color: atLimit ? '#ef4444' : '#0d0d0d' }}
              >
                {angle.toFixed(1)}°
              </span>
              <div className="sim-joint-bar-track">
                <div
                  className="sim-joint-bar"
                  style={{
                    width: `${Math.min(fill, 100)}%`,
                    background: atLimit ? '#ef4444' : '#0d0d0d',
                  }}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Gripper row */}
      <div className="sim-gripper-row">
        <span className="sim-joint-label">Gripper</span>
        <span className={`sim-gripper-badge${gripperOpen ? ' sim-gripper-badge--open' : ' sim-gripper-badge--closed'}`}>
          {gripperOpen ? 'Open' : 'Closed'}
        </span>
        {!gripperOpen && frame?.gripperForce != null && (
          <span className="sim-gripper-force">{frame.gripperForce}% force</span>
        )}
      </div>
    </section>
  )
}