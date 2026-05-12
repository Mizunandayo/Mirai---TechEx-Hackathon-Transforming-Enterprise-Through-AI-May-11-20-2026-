import { useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react'
import { useAtomValue } from 'jotai'
import { taskValidationAtom } from '../../../store/taskAtoms'
import type { GripBlock } from '../../../types/task'

export type GripNodeType = Node<GripBlock, 'grip'>

export function GripNode({ id, data, selected }: NodeProps<GripNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow()
  const validation = useAtomValue(taskValidationAtom)

  const issues = validation.issuesByNodeId[id] ?? []
  const hasError = issues.some((i) => i.severity === 'error')

  const update = useCallback(
    (patch: Partial<GripBlock['params']>) => {
      updateNodeData(id, (node: Node) => {
        const d = node.data as unknown as GripBlock
        return { ...d, params: { ...d.params, ...patch } }
      })
    },
    [id, updateNodeData],
  )

  const nodeClass = [
    'task-node task-node--grip',
    selected ? 'task-node--selected' : '',
    hasError ? 'task-node--error'    : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={nodeClass}>
      <Handle type="target" position={Position.Top} className="task-handle" />

      <div className="task-node-header">
        <span className="task-node-type-label">GRIP</span>
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
        {/* Open / Close toggle */}
        <div className="task-node-row">
          <label className="task-node-label">Action</label>
          <div className="task-node-toggle">
            <button
              className={`task-toggle-btn task-toggle-btn--open${data.params.action === 'open' ? ' task-toggle-btn--active' : ''}`}
              onClick={() => update({ action: 'open' })}
              style={{ cursor: 'pointer' }}
            >
              Open
            </button>
            <button
              className={`task-toggle-btn task-toggle-btn--close${data.params.action === 'close' ? ' task-toggle-btn--active' : ''}`}
              onClick={() => update({ action: 'close' })}
              style={{ cursor: 'pointer' }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Force slider */}
        <div className="task-node-row">
          <label className="task-node-label">Force</label>
          <input
            type="range"
            className="task-node-slider nodrag"
            min={5}
            max={100}
            step={5}
            value={data.params.force}
            onChange={(e) => update({ force: parseInt(e.target.value) })}
            style={{ cursor: 'pointer' }}
          />
          <span className="task-node-value">{data.params.force}%</span>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="task-handle" />
    </div>
  )
}