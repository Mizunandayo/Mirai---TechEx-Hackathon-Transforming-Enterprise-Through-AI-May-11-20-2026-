import { useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react'
import type { WaitBlock } from '../../../types/task'


export type WaitNodeType = Node<WaitBlock, 'wait'>

export function WaitNode({ id, data, selected }: NodeProps<WaitNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow()

  const update = useCallback(
    (durationMs: number) => {
      updateNodeData(id, (node: Node) => {
        const d = node.data as unknown as WaitBlock
        return { ...d, params: { durationMs: Math.max(100, Math.min(10000, durationMs)) } }
      })
    },
    [id, updateNodeData],
  )

  return (
    <div className={`task-node task-node--wait${selected ? ' task-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="task-handle" />

      <div className="task-node-header">
        <span className="task-node-type-label">WAIT</span>
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
          <label className="task-node-label">Duration</label>
          <input
            type="number"
            className="task-node-number-input"
            value={data.params.durationMs}
            min={100}
            max={10000}
            step={100}
            onChange={(e) => update(parseInt(e.target.value) || 1000)}
            style={{ cursor: 'text' }}
          />
          <span className="task-node-value">ms</span>
        </div>
        <div className="task-node-hint">
          {(data.params.durationMs / 1000).toFixed(1)} seconds
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="task-handle" />
    </div>
  )
}