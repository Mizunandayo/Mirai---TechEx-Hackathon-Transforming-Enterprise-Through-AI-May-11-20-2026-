import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  useReactFlow,
  type EdgeProps,
} from '@xyflow/react'

export function DeletableEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  markerEnd,
  style,
}: EdgeProps) {
  const { deleteElements } = useReactFlow()

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={style}
        interactionWidth={20}
      />
      <EdgeLabelRenderer>
        <div
          className={`task-edge-zone nodrag nopan${selected ? ' task-edge-zone--selected' : ''}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
        >
          <button
            className="task-edge-delete"
            onClick={() => deleteElements({ edges: [{ id }] })}
            title="Remove connection"
          >
            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
              <line x1="1" y1="1" x2="7" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              <line x1="7" y1="1" x2="1" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
