// src/store/simAtoms.ts

import { atom } from 'jotai'
import type { ExecutionPlan, PlaybackStatus, PlaybackSpeed } from '../types/simulation'



// Core playback atoms

export const compiledPlanAtom      = atom<ExecutionPlan | null>(null)
export const playbackStatusAtom    = atom<PlaybackStatus>('idle')
export const currentFrameAtom      = atom<number>(0)
export const playbackSpeedAtom     = atom<PlaybackSpeed>(1)
export const loopAtom              = atom<boolean>(false)
export const skipCollisionPauseAtom = atom<boolean>(false)


// Derived atoms

export const currentSimFrameAtom = atom((get) => {
  const plan  = get(compiledPlanAtom)
  const frame = get(currentFrameAtom)
  if (!plan || plan.frames.length === 0) return null
  return plan.frames[Math.min(frame, plan.frames.length - 1)] ?? null
})


// End-effector positions from frame 0
export const pathTrailPointsAtom = atom((get) => {
  const plan  = get(compiledPlanAtom)
  const frame = get(currentFrameAtom)
  if (!plan) return [] as [number, number, number][]
  return plan.frames.slice(0, frame + 1).map((f) => f.endEffectorPos)
})



// Playback progress 0-1

export const playbackProgressAtom = atom((get) => {
  const plan  = get(compiledPlanAtom)
  const frame = get(currentFrameAtom)
  if (!plan || plan.totalFrames === 0) return 0
  return frame / (plan.totalFrames - 1)
})