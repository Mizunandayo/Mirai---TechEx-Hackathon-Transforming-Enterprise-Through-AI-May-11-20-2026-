import type { Node, Edge } from '@xyflow/react'
import type { TaskBlock, ValidationReport, ValidationIssue, MoveBlock, LoopBlock, IfBlock } from '../types/task'
import { calculateMaxReach } from './armPhysics'
import type { ArmSegment } from '../types/arm'

const COORD_MAX = 2.0  // meters — beyond this is clearly wrong

export function validateTask(
  nodes: Node<TaskBlock>[],
  _edges: Edge[],
  armSegments: ArmSegment[],
): ValidationReport {
  const issues: ValidationIssue[] = []
  const maxReach = calculateMaxReach(armSegments)

  // ── Structural checks ────────────────────────────────────────────────────

  const startNodes = nodes.filter((n) => n.data.kind === 'start')
  const endNodes   = nodes.filter((n) => n.data.kind === 'end')

  if (startNodes.length === 0) {
    issues.push({
      nodeId: '__global__',
      severity: 'error',
      type: 'no_start_node',
      message: 'Every task needs a Start block.',
    })
  }

  startNodes.slice(1).forEach((n) => {
    issues.push({
      nodeId: n.id,
      severity: 'error',
      type: 'duplicate_start',
      message: 'Only one Start block is allowed.',
    })
  })

  if (endNodes.length === 0) {
    issues.push({
      nodeId: '__global__',
      severity: 'warning',
      type: 'no_end_node',
      message: 'Add an End block to mark task completion.',
    })
  }

  // ── Per-node checks ──────────────────────────────────────────────────────

  nodes.forEach((node) => {
    const block = node.data

    if (block.kind === 'move') {
      const { x, y, z, speed } = (block as MoveBlock).params

      if (Math.abs(x) > COORD_MAX || Math.abs(y) > COORD_MAX || Math.abs(z) > COORD_MAX) {
        issues.push({
          nodeId: node.id,
          severity: 'error',
          type: 'invalid_coordinates',
          message: `Coordinates must be within ±${COORD_MAX}m of origin.`,
        })
      }

      const dist = Math.sqrt(x * x + y * y + z * z)
      if (dist > maxReach) {
        issues.push({
          nodeId: node.id,
          severity: 'error',
          type: 'unreachable_target',
          message: `Target (${dist.toFixed(2)}m) exceeds arm reach (${maxReach.toFixed(2)}m).`,
        })
      } else if (dist > maxReach * 0.85) {
        issues.push({
          nodeId: node.id,
          severity: 'warning',
          type: 'unreachable_target',
          message: `Target at ${Math.round((dist / maxReach) * 100)}% of max reach — near limit.`,
        })
      }

      if (speed <= 0) {
        issues.push({
          nodeId: node.id,
          severity: 'error',
          type: 'speed_zero',
          message: 'Speed must be greater than 0.',
        })
      }
    }

    if (block.kind === 'loop') {
      const { count } = (block as LoopBlock).params
      if (count < 1 || count > 99 || !Number.isInteger(count)) {
        issues.push({
          nodeId: node.id,
          severity: 'error',
          type: 'loop_count_invalid',
          message: 'Loop count must be a whole number between 1 and 99.',
        })
      }
    }

    if (block.kind === 'if') {
      const { condition } = (block as IfBlock).params
      if (!condition.trim()) {
        issues.push({
          nodeId: node.id,
          severity: 'warning',
          type: 'empty_condition',
          message: 'IF condition is empty — branch always takes "then" path.',
        })
      }
    }
  })

  // Build nodeId → issues lookup 

  const issuesByNodeId: Record<string, ValidationIssue[]> = {}
  issues.forEach((issue) => {
    if (!issuesByNodeId[issue.nodeId]) issuesByNodeId[issue.nodeId] = []
    issuesByNodeId[issue.nodeId].push(issue)
  })

  return {
    isValid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
    issuesByNodeId,
  }
}