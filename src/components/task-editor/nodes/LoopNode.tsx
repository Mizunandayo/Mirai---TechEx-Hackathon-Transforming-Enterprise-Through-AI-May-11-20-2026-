import { useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react'
import { useAtomValue } from 'jotai'
import { taskValidationAtom } from '../../../store/taskAtoms'
import type { LoopBlock } from '../../../types/task'

export type LoopNodeType = Node<LoopBlock, 'loop'>

export function LoopNode({ id, data, selected }: NodeProps<LoopNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow()
  const validation = useAtomValue(taskValidationAtom)

  const issues  = validation.issuesByNodeId[id] ?? []
  const hasError = issues.some((i) => i.severity === 'error')

  const update = useCallback(
    (count: number) => {
      updateNodeData(id, (node: Node) => {
        const d = node.data as unknown as LoopBlock
        return { ...d, params: { count: Math.max(1, Math.min(99, Math.round(count))) } }
      })
    },
    [id, updateNodeData],
  )

  const nodeClass = [
    'task-node task-node--loop',
    selected ? 'task-node--selected' : '',
    hasError ? 'task-node--error'    : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={nodeClass}>
      <Handle type="target" position={Position.Top} className="task-handle" />

      <div className="task-node-header">
        <span className="task-node-type-label">LOOP</span>
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
        <div className="task-node-row">
          <label className="task-node-label">Repeat</label>
          <div className="task-node-stepper">
            <button
              className="task-stepper-btn"
              onClick={() => update(data.params.count - 1)}
              disabled={data.params.count <= 1}
              style={{ cursor: data.params.count <= 1 ? 'not-allowed' : 'pointer' }}
            >−</button>
            <span className="task-stepper-value">{data.params.count}</span>
            <button
              className="task-stepper-btn"
              onClick={() => update(data.params.count + 1)}
              disabled={data.params.count >= 99}
              style={{ cursor: data.params.count >= 99 ? 'not-allowed' : 'pointer' }}
            >+</button>
          </div>
          <span className="task-node-value">times</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="task-handle" />
    </div>
  )
}