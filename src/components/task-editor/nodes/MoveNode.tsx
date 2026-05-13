import { useCallback } from 'react'
import { Handle, Position, useReactFlow, type NodeProps, type Node } from '@xyflow/react'
import { useAtomValue, useSetAtom } from 'jotai'
import { taskValidationAtom, ghostArmTargetAtom } from '../../../store/taskAtoms'
import { getAllTargets, getTargetById } from '../../../utils/sceneRegistry'
import type { MoveBlock } from '../../../types/task'

export type MoveNodeType = Node<MoveBlock, 'move'>

const ALL_TARGETS = getAllTargets()

export function MoveNode({ id, data, selected }: NodeProps<MoveNodeType>) {
  const { updateNodeData, deleteElements } = useReactFlow()
  const validation = useAtomValue(taskValidationAtom)
  const setGhostTarget = useSetAtom(ghostArmTargetAtom)

  const issues = validation.issuesByNodeId[id] ?? []
  const hasError   = issues.some((i) => i.severity === 'error')
  const hasWarning = issues.some((i) => i.severity === 'warning')

  const update = useCallback(
    (patch: Partial<MoveBlock['params']>) => {
      updateNodeData(id, (node: Node) => {
        const d = node.data as unknown as MoveBlock
        return { ...d, params: { ...d.params, ...patch } }
      })
    },
    [id, updateNodeData],
  )

  // Manual coordinate edits always detach from preset targets.
  const handleCoordInput = useCallback(
    (axis: 'x' | 'y' | 'z', rawValue: string) => {
      const parsed = parseFloat(rawValue)
      update({ [axis]: Number.isFinite(parsed) ? parsed : 0, targetId: null })
    },
    [update],
  )

  // Update target coordinates when a preset target is selected
  const handleTargetChange = useCallback(
    (targetId: string) => {
      if (targetId === '__custom__') {
        update({ targetId: null })
        return
      }
      const target = getTargetById(targetId)
      if (target) {
        update({
          targetId,
          x: parseFloat(target.position[0].toFixed(3)),
          y: parseFloat(target.position[1].toFixed(3)),
          z: parseFloat(target.position[2].toFixed(3)),
        })
        setGhostTarget(target.position)
      }
    },
    [update, setGhostTarget],
  )

  const nodeClass = [
    'task-node task-node--move',
    selected    ? 'task-node--selected' : '',
    hasError    ? 'task-node--error'    : '',
    hasWarning  ? 'task-node--warning'  : '',
  ].filter(Boolean).join(' ')

  return (
    <div className={nodeClass}>
      <Handle type="target" position={Position.Top} className="task-handle" />

      <div className="task-node-header">
        <span className="task-node-type-label">MOVE TO</span>
        {hasError && (
          <svg className="task-node-issue-icon" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.6"/>
            <line x1="8" y1="4.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="8" cy="11" r="0.9" fill="currentColor"/>
          </svg>
        )}
        {!hasError && hasWarning && (
          <svg className="task-node-issue-icon task-node-issue-icon--warn" width="13" height="13" viewBox="0 0 16 16" fill="none">
            <path d="M7.13 2.5L1.07 13a1 1 0 00.87 1.5h12.12a1 1 0 00.87-1.5L8.87 2.5a1 1 0 00-1.74 0z" stroke="currentColor" strokeWidth="1.5"/>
            <line x1="8" y1="6.5" x2="8" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            <circle cx="8" cy="12" r="0.9" fill="currentColor"/>
          </svg>
        )}
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
        {/* Target Preset */}
        <div className="task-node-row">
          <label className="task-node-label">Target</label>
          <select
            className="task-node-select"
            value={data.params.targetId ?? '__custom__'}
            onChange={(e) => handleTargetChange(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="__custom__">Custom coords</option>
            {ALL_TARGETS.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        {/* Coordinate inputs */}
        <div className="task-node-coords">
          {(['x', 'y', 'z'] as const).map((axis) => (
            <div key={axis} className="task-node-coord-field">
              <label className="task-node-coord-label">{axis.toUpperCase()}</label>
              <input
                type="number"
                className="task-node-coord-input"
                value={data.params[axis]}
                step={0.01}
                min={-2}
                max={2}
                onChange={(e) => handleCoordInput(axis, e.target.value)}
                style={{ cursor: 'text' }}
              />
            </div>
          ))}
          <span className="task-node-coord-unit">m</span>
        </div>

        {/* Speed */}
        <div className="task-node-row">
          <label className="task-node-label">Speed</label>
          <input
            type="range"
            className="task-node-slider"
            min={0.1}
            max={1.0}
            step={0.05}
            value={data.params.speed}
            onChange={(e) => update({ speed: parseFloat(e.target.value) })}
            style={{ cursor: 'pointer' }}
          />
          <span className="task-node-value">{data.params.speed.toFixed(1)}x</span>
        </div>

        {/* Approach */}
        <div className="task-node-row">
          <label className="task-node-label">Approach</label>
          <select
            className="task-node-select"
            value={data.params.approach}
            onChange={(e) => update({ approach: e.target.value as MoveBlock['params']['approach'] })}
            style={{ cursor: 'pointer' }}
          >
            <option value="above">Above</option>
            <option value="front">Front</option>
            <option value="side">Side</option>
          </select>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="task-handle" />
    </div>
  )
}