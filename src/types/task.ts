// ─── Primitives ───────────────────────────────────────────────────────────────

export type SkillType =
  | 'move_to'
  | 'grasp'
  | 'release'
  | 'place'
  | 'stack'
  | 'wait'
  | 'align'

export type NodeKind = 'start' | 'end' | 'move' | 'grip' | 'wait' | 'loop' | 'if'

export type ApproachDirection = 'above' | 'front' | 'side'

// ─── Scene Graph ──────────────────────────────────────────────────────────────

export type SceneObjectType = 'box' | 'cylinder' | 'sphere' | 'surface' | 'zone'

export interface SceneObject {
  id: string
  name: string
  type: SceneObjectType
  position: [number, number, number]   // meters [x, y, z]
  dimensions: [number, number, number] // meters [w, h, d]
  scale?: [number, number, number]
  color?: string
}

export interface TargetZone {
  id: string
  name: string
  position: [number, number, number]
  radius: number // meters — placement tolerance
}

export interface SceneGraph {
  objects: SceneObject[]
  targetZones: TargetZone[]
}

// ─── Task Block Params ────────────────────────────────────────────────────────

export interface MoveParams {
  targetId: string | null    // SceneObject/TargetZone id, or null for custom coords
  x: number                  // meters
  y: number
  z: number
  speed: number              // 0.1 – 1.0
  approach: ApproachDirection
}

export interface GripParams {
  action: 'open' | 'close'
  force: number              // 0 – 100 percent
}

export interface WaitParams {
  durationMs: number         // 100 – 10000
}

export interface LoopParams {
  count: number              // 1 – 99
}

export interface IfParams {
  condition: string
}

// ─── Task Block (stored in React Flow Node.data) ──────────────────────────────

export interface BaseBlock extends Record<string, unknown> {
  kind: NodeKind
  label: string
}

export interface StartBlock extends BaseBlock { kind: 'start' }
export interface EndBlock   extends BaseBlock { kind: 'end' }

export interface MoveBlock extends BaseBlock {
  kind: 'move'
  params: MoveParams
}

export interface GripBlock extends BaseBlock {
  kind: 'grip'
  params: GripParams
}

export interface WaitBlock extends BaseBlock {
  kind: 'wait'
  params: WaitParams
}

export interface LoopBlock extends BaseBlock {
  kind: 'loop'
  params: LoopParams
}

export interface IfBlock extends BaseBlock {
  kind: 'if'
  params: IfParams
}

export type TaskBlock =
  | StartBlock | EndBlock
  | MoveBlock  | GripBlock
  | WaitBlock  | LoopBlock
  | IfBlock

// ─── Task Spec (exported JSON) ────────────────────────────────────────────────

export interface TaskSpec {
  id: string
  name: string
  version: '1.0'
  createdAt: string          // ISO 8601
  description: string
  sceneId: string
  blocks: TaskBlock[]
}

// ─── Validation ───────────────────────────────────────────────────────────────

export type ValidationIssueType =
  | 'unreachable_target'
  | 'invalid_coordinates'
  | 'no_start_node'
  | 'no_end_node'
  | 'loop_count_invalid'
  | 'speed_zero'
  | 'duplicate_start'
  | 'empty_condition'

export type ValidationSeverity = 'error' | 'warning'

export interface ValidationIssue {
  nodeId: string
  severity: ValidationSeverity
  type: ValidationIssueType
  message: string
}

export interface ValidationReport {
  isValid: boolean
  issues: ValidationIssue[]
  issuesByNodeId: Record<string, ValidationIssue[]>
}

// ─── Execution Plan (output for Day 4 Rapier + Day 6 MuJoCo) ─────────────────

export type MotionPrimitiveType =
  | 'joint_move'
  | 'gripper_open'
  | 'gripper_close'
  | 'wait'
  | 'loop_start'
  | 'loop_end'
  | 'conditional_branch'

export interface MotionPrimitive {
  type: MotionPrimitiveType
  params: Record<string, unknown>
  estimatedDurationMs: number
}

export interface ExecutionPlan {
  taskId: string
  taskName: string
  compiledAt: string
  primitives: MotionPrimitive[]
  totalEstimatedDurationMs: number
}