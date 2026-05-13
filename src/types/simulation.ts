export type PlaybackStatus =
  | 'idle'
  | 'playing'
  | 'reverse_playing'
  | 'paused'
  | 'collision_paused'
  | 'complete'

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2 | 4


// One snapshot of the arm state at a given instant
export interface SimFrame {
  frameIndex: number
  timeMs: number

  waistYawDeg: number    
  pitchAngles: number[]    

  gripperOpen: boolean
  gripperForce: number  

  endEffectorPos: [number, number, number]

  isCollision: boolean
  collidingObjectId?: string

  heldObjectId?: string
  heldObjectPos?: [number, number, number]

  approachTargetId?: string   // object being approached — frozen in physics so arm reaches correct grab center

  gripEmpty?: boolean          // gripper closed but no object was in grab range (soft warning)

  jointTorques: number[]       
  jointVelocities: number[]  
}


// The full compiled motion plan
export interface ExecutionPlan {
  frames: SimFrame[]
  totalFrames: number
  durationMs: number
  fps: number
  taskName: string
  armConfigHash: string 
}

// Live joint status for HUD
export interface JointMetrics {
  index: number
  name: string
  angleDeg: number
  torqueNm: number
  velocityDegPerSec: number
  atLimit: boolean
  limitMin: number
  limitMax: number
}
