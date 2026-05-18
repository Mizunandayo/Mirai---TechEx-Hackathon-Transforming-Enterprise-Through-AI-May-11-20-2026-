import { useMemo } from 'react'
import { useAtom, useAtomValue } from 'jotai'
import {
  armSegmentsAtom,
  armGripperAtom,
  armDesignTargetsAtom,
  armServoTierAtom,
  type ServoTier,
} from '../../store/atoms'
import {
  validateArm,
  calculateMaxReach,
  calculateTorqueAtJoint,
} from '../../utils/armPhysics'

const SEGMENT_MIN_LENGTH = 0.08
const SEGMENT_MAX_LENGTH = 0.8

const SERVO_TORQUE_LIMIT: Record<ServoTier, { maxTorqueNm: number; label: string }> = {
  mg995: { maxTorqueNm: 0.92, label: 'MG995' },
  mg996r: { maxTorqueNm: 1.10, label: 'MG996R' },
  ds3218: { maxTorqueNm: 2.45, label: 'DS3218' },
  industrial: { maxTorqueNm: 15.0, label: 'Industrial Servo' },
}

function chooseServoTierForTorque(peakTorqueNm: number): ServoTier {
  const safetyTarget = peakTorqueNm * 1.08
  if (safetyTarget <= SERVO_TORQUE_LIMIT.mg995.maxTorqueNm) return 'mg995'
  if (safetyTarget <= SERVO_TORQUE_LIMIT.mg996r.maxTorqueNm) return 'mg996r'
  if (safetyTarget <= SERVO_TORQUE_LIMIT.ds3218.maxTorqueNm) return 'ds3218'
  return 'industrial'
}

function ValidationPanel() {
  const [segments, setSegments] = useAtom(armSegmentsAtom)
  const [gripper, setGripper] = useAtom(armGripperAtom)
  const [servoTier, setServoTier] = useAtom(armServoTierAtom)
  const targets = useAtomValue(armDesignTargetsAtom)

  const servoProfile = SERVO_TORQUE_LIMIT[servoTier]

  const validation = useMemo(
    () =>
      validateArm(segments, {
        servoMaxTorqueNm: servoProfile.maxTorqueNm,
        servoLabel: servoProfile.label,
      }),
    [segments, servoProfile.maxTorqueNm, servoProfile.label],
  )

  const stats = useMemo(() => {
    const reachMeters = calculateMaxReach(segments)
    const totalMassKg = segments.reduce((sum, seg) => sum + seg.mass, 0)
    const movableSegments = segments.filter((seg) => seg.joint !== 'fixed')

    let peakTorqueNm = 0
    for (let i = 0; i < segments.length; i += 1) {
      if (segments[i].joint === 'fixed') continue
      peakTorqueNm = Math.max(peakTorqueNm, calculateTorqueAtJoint(segments, i))
    }

    return {
      reachMeters,
      totalMassKg,
      peakTorqueNm,
      jointCount: movableSegments.length,
    }
  }, [segments])

  const hasErrors = validation.errors.length > 0
  const hasWarnings = validation.warnings.length > 0
  const hasTargets = Boolean(targets)
  const shouldShowFix = hasErrors

  const handleAutoConfigure = () => {
    const desiredReach = targets?.reachMeters
    const currentReach = stats.reachMeters

    let scaleFactor = 1
    if (desiredReach && currentReach > 0.001) {
      scaleFactor = desiredReach / currentReach
      scaleFactor = Math.min(1.35, Math.max(0.65, scaleFactor))
    }

    let nextSegments = segments.map((segment) => {
      if (segment.joint === 'fixed') return segment
      const scaled = segment.length * scaleFactor
      return {
        ...segment,
        length: Number(
          Math.min(SEGMENT_MAX_LENGTH, Math.max(SEGMENT_MIN_LENGTH, scaled)).toFixed(3),
        ),
      }
    })

    const nextTotalMass = nextSegments.reduce((sum, segment) => sum + segment.mass, 0)
    if (nextTotalMass > 3.95) {
      // Proportionally scale all segment masses down to the 3.9 kg target in one pass.
      // Preserves mass ratios between segments instead of additive trimming per click.
      const targetMass = 3.9
      const massFactor = targetMass / nextTotalMass

      nextSegments = nextSegments.map((segment) => ({
        ...segment,
        mass: Math.max(segment.joint === 'fixed' ? 0.8 : 0.15, Number((segment.mass * massFactor).toFixed(2))),
        material: segment.joint === 'fixed' ? 'aluminum' : 'carbon_fiber',
      }))
    }

    let nextPeakTorque = 0
    for (let i = 0; i < nextSegments.length; i += 1) {
      if (nextSegments[i].joint === 'fixed') continue
      nextPeakTorque = Math.max(nextPeakTorque, calculateTorqueAtJoint(nextSegments, i))
    }

    const recommendedTier = chooseServoTierForTorque(nextPeakTorque)
    if (recommendedTier !== servoTier) {
      setServoTier(recommendedTier)
    }

    setSegments(nextSegments)

    if (targets?.payloadGrams) {
      const requiredForceN = Math.max(20, Math.min(160, (targets.payloadGrams / 1000) * 9.81 * 2.2))
      setGripper({ ...gripper, force: Math.round(requiredForceN) })
    }
  }

  return (
    <section className="validation-panel" aria-label="Arm review">
      <div className="section-header">
        <h3 className="section-title">Design Validation</h3>
        <span
          className={`validation-badge ${validation.isValid ? 'validation-badge--ok' : 'validation-badge--error'}`}
        >
          {validation.isValid ? 'Ready' : 'Needs fixes'}
        </span>
      </div>

      {shouldShowFix && (
        <div className="validation-actions">
          <button
            type="button"
            className="validation-ai-fix-btn"
            onClick={handleAutoConfigure}
            title="Auto-adjust arm geometry and gripper settings"
          >
            Auto Fix
          </button>
        </div>
      )}

      <div className="validation-ai-fix-note">
        Actuator profile: {servoProfile.label} ({servoProfile.maxTorqueNm.toFixed(2)} N m per revolute joint).
      </div>

      {hasTargets && (
        <div className="validation-ai-fix-note">
          Target profile: {targets?.reachMeters.toFixed(2)}m reach, {targets?.payloadGrams.toFixed(0)}g payload, {targets?.jointCount} joints.
        </div>
      )}

      <div className="validation-metrics">
        <div className="metric">
          <span className="metric-label">Reach</span>
          <span className="metric-value">
            {(stats.reachMeters * 1000).toFixed(0)}
            <span className="metric-unit">mm</span>
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Peak Torque</span>
          <span className="metric-value">
            {stats.peakTorqueNm > 0 ? stats.peakTorqueNm.toFixed(2) : <span className="metric-empty">-</span>}
            {stats.peakTorqueNm > 0 && <span className="metric-unit">N m</span>}
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Total Mass</span>
          <span className="metric-value">
            {stats.totalMassKg.toFixed(2)}
            <span className="metric-unit">kg</span>
          </span>
        </div>

        <div className="metric">
          <span className="metric-label">Joints</span>
          <span className="metric-value">
            {stats.jointCount}
            <span className="metric-unit">active</span>
          </span>
        </div>
      </div>

      {hasErrors && (
        <div className="validation-section">
          <h4 className="validation-section-title error">Blocking Issues</h4>
          {validation.errors.map((error, index) => (
            <div key={`${error.type}-${error.segmentId ?? 'global'}-${index}`} className="validation-item validation-item--error">
              <span className="validation-pill validation-pill--error">Error</span>
              <div className="validation-text" style={{ marginTop: 8 }}>{error.message}</div>
              <span className="validation-icon validation-icon--error" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
                  <line x1="8" y1="4.5" x2="8" y2="9.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="11.4" r="0.9" fill="currentColor" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      )}

      {hasWarnings && (
        <div className="validation-section">
          <h4 className="validation-section-title warning">Warnings</h4>
          {validation.warnings.map((warning, index) => (
            <div key={`${warning.type}-${warning.segmentId ?? 'global'}-${index}`} className="validation-item validation-item--warning">
              <span className="validation-pill validation-pill--warning">Warn</span>
              <div className="validation-text" style={{ marginTop: 8 }}>{warning.message}</div>
              <span className="validation-icon validation-icon--warning" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M8 2.2L14 13H2L8 2.2Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
                  <line x1="8" y1="6" x2="8" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                  <circle cx="8" cy="11.2" r="0.8" fill="currentColor" />
                </svg>
              </span>
            </div>
          ))}
        </div>
      )}

      {!hasErrors && !hasWarnings && (
        <div className="validation-ok">
          Design checks passed. Your arm is ready for task planning.
        </div>
      )}
    </section>
  )
}

export default ValidationPanel
