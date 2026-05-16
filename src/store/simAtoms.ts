import { atom } from 'jotai'
import type { ExecutionPlan, PlaybackStatus, PlaybackSpeed } from '../types/simulation'

export const compiledPlanAtom = atom<ExecutionPlan | null>(null)
export const playbackStatusAtom = atom<PlaybackStatus>('idle')
export const currentFrameAtom = atom<number>(0)
export const playbackSpeedAtom = atom<PlaybackSpeed>(1)
export const loopAtom = atom<boolean>(false)
export const skipCollisionPauseAtom = atom<boolean>(false)
export const ptpSequencePlayingAtom = atom<boolean>(false)


// Collision polish controls
export const autoRewindOnCollisionAtom = atom<boolean>(false)
export const collisionRewindFramesAtom = atom<number>(12) // clamped in UI and playback engine
export const collisionFlashMsAtom = atom<number>(420)

export type SimObjectBaseline = {
  position: [number, number, number]
  rotation: [number, number, number, number]
  scale: [number, number, number]
}

export const simBaselineObjectStatesAtom = atom<Record<string, SimObjectBaseline>>({})


export const currentSimFrameAtom = atom((get) => {
  const plan = get(compiledPlanAtom)
  const frame = get(currentFrameAtom)
  if (!plan || plan.frames.length === 0) return null
  return plan.frames[Math.min(frame, plan.frames.length - 1)] ?? null
})



export const pathTrailPointsAtom = atom((get) => {
  const plan = get(compiledPlanAtom)
  const frame = get(currentFrameAtom)
  if (!plan) return [] as [number, number, number][]
  return plan.frames.slice(0, frame + 1).map((f) => f.endEffectorPos)
})



export const playbackProgressAtom = atom((get) => {
  const plan = get(compiledPlanAtom)
  const frame = get(currentFrameAtom)
  if (!plan || plan.totalFrames === 0) return 0
  return frame / (plan.totalFrames - 1)
})