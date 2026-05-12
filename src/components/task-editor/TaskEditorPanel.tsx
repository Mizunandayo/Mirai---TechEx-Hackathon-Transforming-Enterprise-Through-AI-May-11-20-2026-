import { useAtom, useAtomValue } from 'jotai'
import { useCallback } from 'react'
import {
  taskNameAtom,
  taskDescriptionAtom,
  taskValidationAtom,
  taskNodesAtom,
  taskEdgesAtom,
} from '../../store/taskAtoms'
import { exportTaskJson, loadTaskFromFile } from '../../utils/taskExport'
import NodePalette from './NodePalette'

export default function TaskEditorPanel() {
  const [taskName, setTaskName]         = useAtom(taskNameAtom)
  const [description, setDescription]   = useAtom(taskDescriptionAtom)
  const validation                       = useAtomValue(taskValidationAtom)
  const nodes                            = useAtomValue(taskNodesAtom)
  const edges                            = useAtomValue(taskEdgesAtom)

  const errorCount   = validation.issues.filter((i) => i.severity === 'error').length
  const warningCount = validation.issues.filter((i) => i.severity === 'warning').length

  const handleExport = useCallback(() => {
    exportTaskJson(taskName, description, nodes, edges)
  }, [taskName, description, nodes, edges])

  const handleLoad = useCallback(async () => {
    // Note: Canvas also handles this via the pendingAddNodeAtom pattern.
    // For full load, we emit to a shared atom that TaskFlowCanvas watches.
    // This is wired in TaskFlowCanvas via loadResultAtom — see Step 9.
    const result = await loadTaskFromFile()
    if (!result) return
    setTaskName(result.name)
    setDescription(result.description)
    // Signal canvas to reload nodes/edges — see Step 9 for loadResultAtom
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mirai:load-task', { detail: result }))
    }
  }, [setTaskName, setDescription])

  const blockCount = nodes.filter((n) => n.data.kind !== 'start').length











  
  return (



    <aside className="designer-panel task-editor-panel">



      {/* Topbar */}
      <div className="panel-topbar">
        <input
          className="panel-arm-name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value.slice(0, 60))}
          placeholder="Unnamed task"
          maxLength={60}
          spellCheck={false}
          aria-label="Task name"
        />
        <div className="panel-topbar-actions">
          <button
            className="btn-topbar btn-topbar--ghost"
            onClick={handleLoad}
            title="Load task from file"
            style={{ cursor: 'pointer' }}
          >
            Open
          </button>
          <button
            className="btn-topbar btn-topbar--primary"
            onClick={handleExport}
            title="Save task as JSON"
            style={{ cursor: 'pointer' }}
          >
            Save
          </button>
        </div>
      </div>




      {/* Description */}
      <div className="task-panel-desc-wrap">
        <textarea
          className="task-panel-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value.slice(0, 400))}
          placeholder="Describe what this task does (optional)"
          rows={2}
          maxLength={400}
          spellCheck={false}
        />
      </div>




      {/* Palette */}
      <div className="panel-content">
        <NodePalette />
      </div>




      {/* Validation footer */}
      <div className="panel-footer task-validation-footer">
        <div className={`task-val-badge ${validation.isValid ? 'task-val-badge--ok' : 'task-val-badge--fail'}`}>
          {validation.isValid ? (
            <>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.6"/>
                <path d="M5 8.5l2 2 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Valid — {blockCount} block{blockCount !== 1 ? 's' : ''}
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.6"/>
                <line x1="8" y1="4.5" x2="8" y2="8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                <circle cx="8" cy="11" r="0.9" fill="currentColor"/>
              </svg>
              {errorCount > 0 && `${errorCount} error${errorCount !== 1 ? 's' : ''}`}
              {errorCount > 0 && warningCount > 0 && ', '}
              {warningCount > 0 && `${warningCount} warning${warningCount !== 1 ? 's' : ''}`}
            </>
          )}
        </div>

        {validation.issues.length > 0 && (
          <div className="task-val-issues">
            {validation.issues.slice(0, 5).map((issue, i) => (
              <div
                key={i}
                className={`task-val-issue task-val-issue--${issue.severity}`}
              >
                <span className="task-val-issue-dot" />
                <span className="task-val-issue-msg">{issue.message}</span>
              </div>
            ))}
            {validation.issues.length > 5 && (
              <div className="task-val-issue-more">
                +{validation.issues.length - 5} more
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}