// src/components/community/TaskPreviewCard.tsx
import { useCallback } from 'react'
import { useSetAtom } from 'jotai'
import { taskNodesAtom, taskEdgesAtom, taskNameAtom, taskDescriptionAtom } from '../../store/taskAtoms'
import { importingTaskIdAtom } from '../../store/communityAtoms'
import { buildFlowFromAITask } from '../../utils/taskFromAI'
import type { CommunityTask } from '../../data/communityTasks'




// Category accent colors
const CATEGORY_COLOR: Record<string, string> = {
  manipulation: '#0d0d0d',
  assembly:     '#1a1a2e',
  sorting:      '#2d4a22',
  inspection:   '#1a2d4a',
  demo:         '#2a1a3e',
}



const DIFFICULTY_LABEL: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
}




// Category SVG Schematics
function ManipulationIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <rect x="4" y="28" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="9" y1="28" x2="9" y2="12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="9" y1="12" x2="22" y2="6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="22" cy="6" r="3" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M22 9v5M20 14h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <rect x="34" y="24" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6" strokeDasharray="2 1.5"/>
      <path d="M28 19l4 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  )
}

function AssemblyIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <rect x="16" y="26" width="16" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="20" y="16" width="12" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="22" y="8" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <line x1="24" y1="4" x2="24" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="24" cy="3" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

function SortingIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <rect x="4" y="18" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="34" y="18" width="10" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <rect x="18" y="10" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M14 22l4-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M34 22l-4-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M24 10V5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <circle cx="24" cy="3" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

function InspectionIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <circle cx="14" cy="26" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="28" cy="20" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <circle cx="38" cy="30" r="4" stroke="currentColor" strokeWidth="1.6"/>
      <path d="M14 22l6-4M28 16l6 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 1.5"/>
      <line x1="8" y1="6" x2="14" y2="22" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      <circle cx="8" cy="4" r="3" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  )
}

function DemoIcon() {
  return (
    <svg width="48" height="40" viewBox="0 0 48 40" fill="none" aria-hidden="true">
      <path d="M8 32 L24 6 L40 32" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round"/>
      <line x1="14" y1="22" x2="34" y2="22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="24" y1="6" x2="24" y2="32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeDasharray="2 1.5" opacity="0.5"/>
      <circle cx="24" cy="22" r="3" fill="currentColor"/>
    </svg>
  )
}

function CategoryIcon({ category }: { category: string }) {
  if (category === 'assembly')   return <AssemblyIcon />
  if (category === 'sorting')    return <SortingIcon />
  if (category === 'inspection') return <InspectionIcon />
  if (category === 'demo')       return <DemoIcon />
  return <ManipulationIcon />
}

// Component 

type Props = {
  task:       CommunityTask
  onImport?:  () => void   // callback after successful import (e.g. navigate)
}

export default function TaskPreviewCard({ task, onImport }: Props) {
  const setNodes        = useSetAtom(taskNodesAtom)
  const setEdges        = useSetAtom(taskEdgesAtom)
  const setTaskName     = useSetAtom(taskNameAtom)
  const setDescription  = useSetAtom(taskDescriptionAtom)
  const setImportingId  = useSetAtom(importingTaskIdAtom)

  const handleImport = useCallback(() => {
    setImportingId(task.id)

    const flow = buildFlowFromAITask(task.taskSpec)
    setNodes(flow.nodes)
    setEdges(flow.edges)
    setTaskName(task.name)
    setDescription(task.description)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mirai:load-task', {
        detail: { nodes: flow.nodes, edges: flow.edges },
      }))
    }

    // Short delay so the canvas ACK fires before navigation
    setTimeout(() => {
      setImportingId(null)
      onImport?.()
    }, 120)
  }, [task, setNodes, setEdges, setTaskName, setDescription, setImportingId, onImport])

  const accentColor = CATEGORY_COLOR[task.category] ?? '#0d0d0d'
  const isFeatured  = task.featured












  return (
    <article
      className={`tpc-root${isFeatured ? ' tpc-root--featured' : ''}`}
      aria-label={task.name}
    >
      {/* Accent strip */}
      <div className="tpc-accent" style={{ background: accentColor }} />

      {/* Featured label */}
      {isFeatured && task.featuredLabel && (
        <div className="tpc-featured-label">{task.featuredLabel}</div>
      )}

      {/* Icon area */}
      <div className="tpc-icon-area">
        <CategoryIcon category={task.category} />
      </div>

      {/* Content */}
      <div className="tpc-content">
        <h3 className="tpc-name">{task.name}</h3>
        <p className="tpc-desc">{task.description}</p>
      </div>

      {/* Metadata row */}
      <div className="tpc-meta">
        <span className={`tpc-difficulty tpc-difficulty--${task.difficulty}`}>
          {DIFFICULTY_LABEL[task.difficulty]}
        </span>
        <span className="tpc-stat">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M4 8h8M8 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {task.stepCount} steps
        </span>
        <span className="tpc-stat">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
            <path d="M8 5v3.5L10 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          ~{task.estimatedSeconds}s
        </span>
        <span className="tpc-stat">
          <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
            <path d="M8 2.5 L1.5 13.5 H14.5 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
          </svg>
          {(task.requiredReachM * 1000).toFixed(0)}mm reach
        </span>
      </div>

      {/* Tags */}
      <div className="tpc-tags">
        <span className="tpc-category-badge">
          {task.category}
        </span>
        {task.tags.slice(0, 2).map(tag => (
          <span key={tag} className="tpc-tag">{tag}</span>
        ))}
      </div>

      {/* Import CTA */}
      <button
        type="button"
        className="tpc-import-btn"
        onClick={handleImport}
        style={{ cursor: 'pointer' }}
        aria-label={`Import task: ${task.name}`}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
        Import task
      </button>
    </article>
  )
}