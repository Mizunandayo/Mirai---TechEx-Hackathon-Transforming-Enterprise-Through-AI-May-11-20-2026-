// src/utils/inverseKinematics.ts

import type { ArmSegment } from '../types/arm'
import { clampPitchAngles } from './forwardKinematics'

const R2D = 180 / Math.PI
const FABRIK_TOL = 0.008   // 8mm convergence threshold
const FABRIK_ITER = 32

export interface IKResult {
  pitchAngles: number[]    // degrees, one per revolute joint
  waistYawDeg: number      // degrees
  reachable: boolean
  actualDist: number       // how close we got to target (meters)
}

/**
 * Solve IK for target world position using FABRIK in 2D + waist yaw.
 *
 * Algorithm:
 * 1. Compute waist yaw from horizontal target direction.
 * 2. Project target into arm's vertical plane: (r, y).
 * 3. Run FABRIK on 2D joint chain.
 * 4. Extract joint angles from final 2D positions.
 * 5. Clamp to joint limits.
 */
export function solveIK(
  segments: ArmSegment[],
  targetWorld: [number, number, number],
): IKResult {
  const [tx, ty, tz] = targetWorld

  // 1. Waist yaw
  const waistYawDeg = Math.atan2(tx, tz) * R2D

  // 2. Horizontal reach
  const r = Math.sqrt(tx * tx + tz * tz)

  // Separate fixed and revolute segments
  const revolveSegs = segments.filter((s) => s.joint !== 'fixed')
  const revolveLens = revolveSegs.map((s) => s.length)

  // Fixed segments: vertical offset
  let baseY = 0
  for (const seg of segments) {
    if (seg.joint === 'fixed') baseY += seg.length
    else break
  }

  // Total reach of revolute links
  const totalReach = revolveLens.reduce((a, b) => a + b, 0)

  // Distance from base of revolute chain to target
  const relR = r
  const relY = ty - baseY
  const targetDist = Math.sqrt(relR * relR + relY * relY)
  const reachable = targetDist <= totalReach + 0.005  // 5mm tolerance

  if (revolveSegs.length === 0) {
    return { pitchAngles: [], waistYawDeg, reachable: false, actualDist: targetDist }
  }

  // 3. FABRIK setup: 2D points in (horizontal, vertical) plane
  const origin2D: [number, number] = [0, baseY]

  // Clamp target if unreachable
  const clampedR = reachable ? relR : (relR / targetDist) * totalReach * 0.99
  const clampedY = reachable
    ? ty
    : baseY + (relY / targetDist) * totalReach * 0.99
  const target2D: [number, number] = [clampedR, clampedY]

  // Initialize: arm straight up
  let pts: [number, number][] = [[0, baseY]]
  let cy = baseY
  for (const L of revolveLens) {
    cy += L
    pts.push([0, cy])
  }

  // 4. FABRIK iterations
  let finalDist = Infinity
  for (let iter = 0; iter < FABRIK_ITER; iter++) {
    // Forward pass (end → base)
    pts[pts.length - 1] = [...target2D]
    for (let i = pts.length - 2; i >= 0; i--) {
      const d = dist2d(pts[i + 1], pts[i])
      if (d < 1e-9) continue
      const t = revolveLens[i] / d
      pts[i] = [
        pts[i + 1][0] + (pts[i][0] - pts[i + 1][0]) * t,
        pts[i + 1][1] + (pts[i][1] - pts[i + 1][1]) * t,
      ]
    }

    // Backward pass (base → end)
    pts[0] = [...origin2D]
    for (let i = 1; i < pts.length; i++) {
      const d = dist2d(pts[i - 1], pts[i])
      if (d < 1e-9) continue
      const t = revolveLens[i - 1] / d
      pts[i] = [
        pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
        pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
      ]
    }

    finalDist = dist2d(pts[pts.length - 1], target2D)
    if (finalDist < FABRIK_TOL) break
  }

  // 5. Extract joint angles from 2D positions
  // Convention: angle = 0 means link points straight up
  // atan2(dx, dy): 0 = up, positive = leaning toward +horizontal
  const cumPitchRads: number[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const dx = pts[i + 1][0] - pts[i][0]
    const dy = pts[i + 1][1] - pts[i][1]
    cumPitchRads.push(Math.atan2(dx, dy))  // 0 = straight up
  }

  // Convert cumulative pitch to DELTA angles
  const pitchAngles: number[] = []
  let prevCumPitch = 0
  for (const cp of cumPitchRads) {
    pitchAngles.push((cp - prevCumPitch) * R2D)
    prevCumPitch = cp
  }

  return {
    pitchAngles: clampPitchAngles(segments, pitchAngles),
    waistYawDeg,
    reachable,
    actualDist: finalDist,
  }
}

function dist2d(a: [number, number], b: [number, number]): number {
  return Math.sqrt((b[0] - a[0]) ** 2 + (b[1] - a[1]) ** 2)
}