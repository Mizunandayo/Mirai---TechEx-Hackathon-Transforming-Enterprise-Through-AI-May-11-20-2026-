// src/utils/forwardKinematics.ts
import type { ArmSegment } from '../types/arm'

const D2R = Math.PI / 180

export interface FKResult {
    jointPositions: [number, number, number][]
    endEffector: [number, number, number]
    cumulativePitchRads: number[]
}


export function forwardKinematics(
  segments: ArmSegment[],
  pitchAngles: number[],   
  waistYawDeg: number,
): FKResult {
  const yawRad = waistYawDeg * D2R
  const cosYaw = Math.cos(yawRad)
  const sinYaw = Math.sin(yawRad)
  
  const jointPositions: [number, number, number][] = [[0, 0, 0]]
  const cumulativePitchRads: number[] = []

  let planX = 0
  let planY = 0
  let cumPitchRad = 0
  let revolveIdx = 0

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]
    const L = seg.length

    if (seg.joint === 'fixed') {
      planY += L
      cumulativePitchRads.push(0)
      jointPositions.push([planX * sinYaw, planY, planX * cosYaw])
      continue
    }


    const delta = (pitchAngles[revolveIdx] ?? 0) * D2R
    revolveIdx++
    cumPitchRad += delta
 
    const dPlanX = Math.sin(cumPitchRad) * L
    const dPlanY = Math.cos(cumPitchRad) * L

    planX += dPlanX
    planY += dPlanY

    cumulativePitchRads.push(cumPitchRad)
    jointPositions.push([planX * sinYaw, planY, planX * cosYaw])
  }

  const last = jointPositions[jointPositions.length - 1]
  return { jointPositions, endEffector: last, cumulativePitchRads }
}



// Helpers

export function getHomeState(segments: ArmSegment[]): {
  pitchAngles: number[]
  waistYawDeg: number
} {
  const count = segments.filter((s) => s.joint !== 'fixed').length
  return { pitchAngles: new Array(count).fill(0), waistYawDeg: 0 }
}



// Clamp pitch angles to joint limits.
export function clampPitchAngles(
  segments: ArmSegment[],
  pitchAngles: number[],
): number[] {
  const revolve = segments.filter((s) => s.joint !== 'fixed')
  return pitchAngles.map((a, i) => {
    const seg = revolve[i]
    if (!seg) return a
    return Math.max(seg.jointLimitMin, Math.min(seg.jointLimitMax, a))
  })
}






// Linear interpolate two angle arrays.
export function lerpAngles(a: number[], b: number[], t: number): number[] {
  const len = Math.max(a.length, b.length)
  return Array.from({ length: len }, (_, i) => (a[i] ?? 0) + ((b[i] ?? 0) - (a[i] ?? 0)) * t)
}


// Ease in out cubice
export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}


// lerp a scalar
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}