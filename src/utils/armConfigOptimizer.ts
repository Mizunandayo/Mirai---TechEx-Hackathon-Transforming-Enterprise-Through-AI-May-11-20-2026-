/**
 * Arm Configuration Optimizer
 *
 * Solves the "IK conditioning" problem: when total arm length >> target distance,
 * FABRIK converges poorly — the arm folds sharply on itself near singularity
 * and the end-effector misses the target, causing grip detection to fail.
 *
 * Root cause proven by regression test:
 *   Original arm (350+280 = 630mm revolute) for Box B at 252mm distance
 *   → condition ratio = 252/780 = 0.32 → near-singularity → grip fails
 *
 *   Manually shortened arm (220+240 = 460mm revolute)
 *   → condition ratio = 252/610 = 0.41 → well-conditioned → grip succeeds
 *
 * This optimizer detects poor conditioning and proportionally scales revolute
 * segments to bring the ratio into the well-conditioned zone [0.38, 0.70].
 * The fixed base segment is never touched.
 */

import type { ArmSegment } from '../types/arm'
import type { SceneObject } from '../types/task'

// ── Thresholds ────────────────────────────────────────────────────────────────

/** Below this ratio (targetDist / totalArmLen): IK near-singularity → scale down */
export const POOR_CONDITION_THRESHOLD = 0.33

/** Target ratio after scaling — empirically proven to work for default scene */
export const TARGET_CONDITION_RATIO = 0.44

/** Safety scale factors tried in sequence when initial scale still fails */
export const RETRY_RATIOS = [0.40, 0.36, 0.30]

const SEGMENT_MIN = 0.05
const SEGMENT_MAX = 0.80

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ArmConditionReport {
  conditionRatio: number        // targetDist / totalArmLength
  isWellConditioned: boolean    // ratio >= POOR_CONDITION_THRESHOLD
  targetDistance: number        // horizontal distance to pickup object
  totalArmLength: number        // sum of all segments
  revolveLength: number         // sum of revolute segments only
  recommendation: 'ok' | 'scale_down'
}

export interface ArmScaleResult {
  segments: ArmSegment[]
  changed: boolean
  scaleFactor: number           // < 1.0 when scaled down
  oldRevolveMm: number
  newRevolveMm: number
  newTotalMm: number
}

// ── Core utilities ─────────────────────────────────────────────────────────────

/**
 * Horizontal distance from the arm base origin to the pickup object.
 * This is the IK-relevant distance (vertical offset is handled by joint angles).
 */
export function computeHorizontalTargetDistance(pickObj: SceneObject): number {
  const [x, , z] = pickObj.position
  return Math.sqrt(x * x + z * z)
}

/**
 * Compute IK condition ratio and determine if the arm needs reconfiguration.
 *
 * The arm is well-conditioned when the ratio (target_distance / total_arm_length)
 * is between 0.33 and ~0.85. Below 0.33 the arm is too long — FABRIK enters
 * near-singularity and fails to reach the grip point reliably.
 */
export function checkArmConditioning(
  segments: ArmSegment[],
  pickObj: SceneObject,
): ArmConditionReport {
  const totalArmLength  = segments.reduce((s, seg) => s + seg.length, 0)
  const revolveLength   = segments.filter(s => s.joint !== 'fixed').reduce((s, seg) => s + seg.length, 0)
  const targetDistance  = computeHorizontalTargetDistance(pickObj)
  const conditionRatio  = targetDistance / Math.max(totalArmLength, 0.001)
  const isWellConditioned = conditionRatio >= POOR_CONDITION_THRESHOLD

  return {
    conditionRatio,
    isWellConditioned,
    targetDistance,
    totalArmLength,
    revolveLength,
    recommendation: isWellConditioned ? 'ok' : 'scale_down',
  }
}

/**
 * Scale revolute segments proportionally to achieve optimal IK conditioning.
 *
 * Only scales DOWN (shrinks) — reach extension for out-of-range targets is
 * handled separately by autoConfigureArmForReach. Joint proportions are
 * preserved. Fixed base segment is never touched.
 *
 * @param targetRatio  Desired conditionRatio after scaling (default: 0.44)
 */
export function scaleArmForTarget(
  segments: ArmSegment[],
  pickObj: SceneObject,
  targetRatio: number = TARGET_CONDITION_RATIO,
): ArmScaleResult {
  const fixedLength   = segments.filter(s => s.joint === 'fixed').reduce((s, seg) => s + seg.length, 0)
  const revolveLength = segments.filter(s => s.joint !== 'fixed').reduce((s, seg) => s + seg.length, 0)
  const totalLength   = fixedLength + revolveLength

  const oldRevolveMm = Math.round(revolveLength * 1000)

  if (revolveLength <= 0) {
    return { segments, changed: false, scaleFactor: 1, oldRevolveMm, newRevolveMm: oldRevolveMm, newTotalMm: Math.round(totalLength * 1000) }
  }

  const targetDist = computeHorizontalTargetDistance(pickObj)

  // Optimal total arm length such that conditionRatio = targetRatio
  const optimalTotal   = targetDist / targetRatio
  const optimalRevolve = Math.max(optimalTotal - fixedLength, SEGMENT_MIN)

  // Only SHRINK: scaleFactor capped at 1.0
  const scaleFactor = Math.min(1.0, optimalRevolve / revolveLength)

  // No meaningful change — skip
  if (Math.abs(scaleFactor - 1.0) < 0.02) {
    return { segments, changed: false, scaleFactor: 1, oldRevolveMm, newRevolveMm: oldRevolveMm, newTotalMm: Math.round(totalLength * 1000) }
  }

  const updated = segments.map(seg => {
    if (seg.joint === 'fixed') return { ...seg }
    const raw = seg.length * scaleFactor
    const clamped = Math.min(SEGMENT_MAX, Math.max(SEGMENT_MIN, raw))
    return { ...seg, length: parseFloat(clamped.toFixed(3)) }
  })

  const newRevolve = updated.filter(s => s.joint !== 'fixed').reduce((s, seg) => s + seg.length, 0)
  const newTotal   = fixedLength + newRevolve

  return {
    segments: updated,
    changed: true,
    scaleFactor,
    oldRevolveMm,
    newRevolveMm: Math.round(newRevolve * 1000),
    newTotalMm:   Math.round(newTotal * 1000),
  }
}

/**
 * Single entry-point: check conditioning and auto-scale if needed.
 * Returns null if arm is already well-conditioned (no change needed).
 */
export function autoOptimizeArmForPickup(
  segments: ArmSegment[],
  pickObj: SceneObject,
  targetRatio: number = TARGET_CONDITION_RATIO,
): ArmScaleResult | null {
  const report = checkArmConditioning(segments, pickObj)
  if (report.isWellConditioned) return null
  return scaleArmForTarget(segments, pickObj, targetRatio)
}

// ── Destination reachability ──────────────────────────────────────────────────

export interface DestinationReachReport {
  canReach: boolean
  destDistance: number       // 3D distance from base to destination
  maxReach: number
  deficit: number            // how much extra reach is needed (0 if reachable)
  description: string        // human-readable diagnosis
}

/**
 * Check if the arm can physically reach the destination (shelf, drawer zone, etc.).
 * This is separate from the pickup IK conditioning — it checks the 3D distance
 * from the arm base to the destination deposit position.
 */
export function checkDestinationReachability(
  segments: ArmSegment[],
  destPosition: [number, number, number],
): DestinationReachReport {
  const totalLength = segments.reduce((s, seg) => s + seg.length, 0)
  const maxReach = totalLength * 1.1
  const [dx, dy, dz] = destPosition
  const destDistance = Math.sqrt(dx * dx + dy * dy + dz * dz)
  const canReach = destDistance <= maxReach
  const deficit = Math.max(0, destDistance - maxReach)

  let description = canReach
    ? `Destination within reach (${(destDistance * 1000).toFixed(0)}mm / ${(maxReach * 1000).toFixed(0)}mm max).`
    : `Destination out of reach: ${(destDistance * 1000).toFixed(0)}mm away, max reach is ${(maxReach * 1000).toFixed(0)}mm. Arm needs ${(deficit * 1000).toFixed(0)}mm more reach.`

  return { canReach, destDistance, maxReach, deficit, description }
}

/**
 * Extend revolute segments so the arm can reach the destination.
 * Only GROWS segments (unlike scaleArmForTarget which only shrinks).
 */
export function extendArmForDestination(
  segments: ArmSegment[],
  destPosition: [number, number, number],
): ArmScaleResult {
  const totalLength   = segments.reduce((s, seg) => s + seg.length, 0)
  const fixedLength   = segments.filter(s => s.joint === 'fixed').reduce((s, seg) => s + seg.length, 0)
  const revolveLength = segments.filter(s => s.joint !== 'fixed').reduce((s, seg) => s + seg.length, 0)

  const [dx, dy, dz] = destPosition
  const destDistance  = Math.sqrt(dx * dx + dy * dy + dz * dz)
  const requiredTotal = destDistance / 1.0 + 0.05   // require 5cm margin
  const requiredRevolve = Math.max(requiredTotal - fixedLength, SEGMENT_MIN)

  const scaleFactor = Math.max(1.0, requiredRevolve / revolveLength)  // only GROW

  if (Math.abs(scaleFactor - 1.0) < 0.02) {
    return { segments, changed: false, scaleFactor: 1, oldRevolveMm: Math.round(revolveLength * 1000), newRevolveMm: Math.round(revolveLength * 1000), newTotalMm: Math.round(totalLength * 1000) }
  }

  const updated = segments.map(seg => {
    if (seg.joint === 'fixed') return { ...seg }
    const raw = seg.length * scaleFactor
    const clamped = Math.min(SEGMENT_MAX, Math.max(SEGMENT_MIN, raw))
    return { ...seg, length: parseFloat(clamped.toFixed(3)) }
  })

  const newRevolve = updated.filter(s => s.joint !== 'fixed').reduce((s, seg) => s + seg.length, 0)
  const newTotal   = fixedLength + newRevolve

  return {
    segments: updated,
    changed: true,
    scaleFactor,
    oldRevolveMm: Math.round(revolveLength * 1000),
    newRevolveMm: Math.round(newRevolve * 1000),
    newTotalMm:   Math.round(newTotal * 1000),
  }
}
