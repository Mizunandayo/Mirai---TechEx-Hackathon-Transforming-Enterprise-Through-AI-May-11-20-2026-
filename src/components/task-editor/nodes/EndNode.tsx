import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react'
import type { EndBlock } from '../../../types/task'

export type EndNodeType = Node<EndBlock, 'end'>

export function EndNode({ id, selected }: NodeProps<EndNodeType>) {
  const { deleteElements } = useReactFlow()
  return (
    <div className={`task-node task-node--end${selected ? ' task-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top} className="task-handle" />
      <div className="task-node-header">
        <span className="task-node-type-label">END</span>
        <span className="task-node-title">Task complete</span>
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
    </div>
  )
}