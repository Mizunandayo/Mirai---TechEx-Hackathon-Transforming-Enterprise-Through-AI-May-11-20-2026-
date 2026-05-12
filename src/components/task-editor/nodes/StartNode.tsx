import { Handle, Position, type NodeProps, type Node } from '@xyflow/react'
import type { StartBlock } from '../../../types/task'

export type StartNodeType = Node<StartBlock, 'start'>

export function StartNode({ selected }: NodeProps<StartNodeType>) {
  return (
    <div className={`task-node task-node--start${selected ? ' task-node--selected' : ''}`}>
      <div className="task-node-header">
        <span className="task-node-type-label">START</span>
        <span className="task-node-title">Task begins here</span>
      </div>
      <Handle type="source" position={Position.Bottom} className="task-handle" />
    </div>
  )
}