import { useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react'
import { useAtomValue } from 'jotai'
import { taskValidationAtom } from '../../../store/taskAtoms'
import type { IfBlock } from '../../../types/task'

export type IfNodeType = Node<IfBlock, 'if'>

export function IfNode({ id, data, selected }: NodeProps<IfNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow()
  const validation = useAtomValue(taskValidationAtom)

  const issues     = validation.issuesByNodeId[id] ?? []
  const hasWarning = issues.some((i) => i.severity === 'warning')

  const update = useCallback(
    (condition: string) => {
      // Sanitize: strip any script-injection patterns
      const safe = condition.replace(/<[^>]*>/g, '').slice(0, 200)
      updateNodeData(id, (node: Node) => {
        const d = node.data as unknown as IfBlock
        return { ...d, params: { condition: safe } }
      })
    },
    [id, updateNodeData],
  )

  const nodeClass = [
    'task-node task-node--if',
    selected    ? 'task-node--selected' : '',
    hasWarning  ? 'task-node--warning'  : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={nodeClass}>
      <Handle type="target" position={Position.Top} className="task-handle" />

      <div className="task-node-header">
        <span className="task-node-type-label">IF</span>
        <button
          className="task-node-delete nodrag"
          onClick={(e) => { e.stopPropagation(); deleteElements({ nodes: [{ id }] }) }}
          title="Delete node"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      <div className="task-node-body nodrag" onClick={(e) => e.stopPropagation()}>
        <div className="task-node-row task-node-row--column">
          <label className="task-node-label">Condition</label>
          <input
            type="text"
            className="task-node-text-input"
            placeholder="e.g. gripper_has_object"
            value={data.params.condition}
            onChange={(e) => update(e.target.value)}
            maxLength={200}
            style={{ cursor: 'text' }}
          />
        </div>
      </div>

      {/* Dual output handles */}
      <div className="task-node-if-outputs">
        <div className="task-node-if-branch">
          <Handle
            type="source"
            position={Position.Bottom}
            id="then"
            className="task-handle"
            style={{ left: '30%' }}
          />
          <span className="task-node-branch-label">then</span>
        </div>
        <div className="task-node-if-branch">
          <Handle
            type="source"
            position={Position.Bottom}
            id="else"
            className="task-handle"
            style={{ left: '70%' }}
          />
          <span className="task-node-branch-label">else</span>
        </div>
      </div>
    </div>
  )
}