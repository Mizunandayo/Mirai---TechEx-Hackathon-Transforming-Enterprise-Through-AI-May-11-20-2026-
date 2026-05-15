export type ReActPhase = 'think' | 'act' | 'observe'

export interface ReActStep {
  phase: ReActPhase
  content: string
  timestamp?: number
}

export interface ConfidenceScore {
  overall: number
  reasonByJoint?: Record<string, number>
  warningFlags: string[]
}

export interface AIPlanRequest {
  userInput: string
  armContext: {
    segments: Array<{ name: string; length: number; mass: number }>
    gripper: { type: 'parallel' | 'suction' | 'magnetic' }
    maxReach: number
    payloadLimit: number
  }
  sceneObjects: string[]
  allowedVerbs: string[]
}

export interface AIValidationError {
  step_index: number
  step_type: string
  error_code: string
  message: string
  suggested_fix?: string
}

export interface AIPreflightReport {
  is_safe: boolean
  errors: AIValidationError[]
  warnings: string[]
}

export interface AITaskResponse {
  task: any
  preflight: AIPreflightReport
}

export interface StreamChunk {
  type: 'react_step' | 'chunk' | 'task_spec' | 'error' | 'done'
  phase?: ReActPhase
  content?: string
  task?: any
  preflight?: AIPreflightReport
  error?: string
}

export interface VoiceState {
  isRecording: boolean
  isTranscribing: boolean
  transcript?: string
  audioBlob?: Blob
  error?: string
}

export interface AISuggestRequest {
  userInput: string
  armContext: AIPlanRequest['armContext']
  sceneObjects: string[]
  taskSpec?: any
  preflight?: AIPreflightReport | null
}

export interface AISuggestResponse {
  suggestions: string[]
  source: 'gemini' | 'deterministic' | 'hybrid'
}

export interface ExecutionGateState {
  phase: 'idle' | 'verifying' | 'ready' | 'blocked'
  message: string
  updatedAt: number
}