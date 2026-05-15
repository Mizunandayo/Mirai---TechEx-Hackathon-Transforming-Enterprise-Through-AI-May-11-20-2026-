import { atom } from 'jotai'
import type { ReActStep, ConfidenceScore, VoiceState, AIPreflightReport, ExecutionGateState } from '../types/ai'
import type { TaskSpec } from '../types/task'

export const reactStepsAtom = atom<ReActStep[]>([])

export const confidenceScoreAtom = atom<ConfidenceScore>({
  overall: 0,
  warningFlags: [],
})

export const generatedTaskSpecAtom = atom<TaskSpec | null>(null)

export const preflightReportAtom = atom<AIPreflightReport | null>(null)

export const aiLoadingAtom = atom(false)
export const aiStreamingAtom = atom(false)

export const voiceStateAtom = atom<VoiceState>({
  isRecording: false,
  isTranscribing: false,
})

export const aiTextInputAtom = atom('')

export const streamAbortControllerAtom = atom<AbortController | null>(null)

export const executionGateAtom = atom<ExecutionGateState>({
  phase: 'idle',
  message: 'No verification has run yet.',
  updatedAt: 0,
})