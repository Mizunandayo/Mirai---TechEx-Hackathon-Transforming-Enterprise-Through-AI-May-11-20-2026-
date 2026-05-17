// src/components/community/CommunityBrowse.tsx
import { useState, useMemo } from 'react'
import TaskPreviewCard from './TaskPreviewCard'
import { COMMUNITY_TASKS, FEATURED_TASKS, type TaskCategory } from '../../data/communityTasks'




type Filter = 'featured' | 'all' | TaskCategory

const FILTER_TABS: { id: Filter; label: string }[] = [
  { id: 'featured',     label: 'Featured' },
  { id: 'all',          label: 'All Tasks' },
  { id: 'manipulation', label: 'Manipulation' },
  { id: 'assembly',     label: 'Assembly' },
  { id: 'sorting',      label: 'Sorting' },
  { id: 'inspection',   label: 'Inspection' },
  { id: 'demo',         label: 'Demo' },
]




type Props = {
    onImport?: () => void // navigates to tasks tab  after import
}


export default function CommunityBrowse({ onImport }: Props) {
    const [activeFilter, setActiveFilter] = useState<Filter>('featured')

const visibleTasks = useMemo(() => {
    if (activeFilter === 'featured') return FEATURED_TASKS
    if (activeFilter === 'all')      return COMMUNITY_TASKS
    return COMMUNITY_TASKS.filter(t => t.category === activeFilter)
  }, [activeFilter])

  const featuredCount  = FEATURED_TASKS.length
  const totalCount     = COMMUNITY_TASKS.length






  
  return (
    <div className="lib-root">
      {/* Page header */}
      <div className="lib-header">
        <div className="lib-header-text">
          <h1 className="lib-title">Task Library</h1>
          <p className="lib-subtitle">
            {totalCount} ready-to-import motion programs — one click loads into your arm.
          </p>
        </div>
        <div className="lib-header-stats">
          <div className="lib-stat-chip">
            <span className="lib-stat-num">{totalCount}</span>
            <span className="lib-stat-label">tasks</span>
          </div>
          <div className="lib-stat-chip">
            <span className="lib-stat-num">{featuredCount}</span>
            <span className="lib-stat-label">featured</span>
          </div>
        </div>
      </div>

      {/* Filter tab bar */}
      <div className="lib-filter-bar" role="tablist" aria-label="Task filter">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeFilter === tab.id}
            className={`lib-filter-tab${activeFilter === tab.id ? ' lib-filter-tab--active' : ''}`}
            onClick={() => setActiveFilter(tab.id)}
            style={{ cursor: 'pointer' }}
          >
            {tab.label}
            {tab.id === 'featured' && (
              <span className="lib-filter-badge">{featuredCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* Task grid */}
      {visibleTasks.length === 0 ? (
        <div className="lib-empty">
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
            <circle cx="18" cy="18" r="15"/>
            <path d="M18 12v6M18 24h.01"/>
          </svg>
          <span>No tasks in this category.</span>
        </div>
      ) : (
        <div
          className={`lib-grid${activeFilter === 'featured' ? ' lib-grid--featured' : ''}`}
          role="tabpanel"
        >
          {visibleTasks.map(task => (
            <TaskPreviewCard
              key={task.id}
              task={task}
              onImport={onImport}
            />
          ))}
        </div>
      )}

      {/* Footer note */}
      <div className="lib-footer">
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.4"/>
          <path d="M8 7v4M8 5.5h.01" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
        </svg>
        All tasks import into your current arm configuration. The task editor opens automatically after import.
      </div>
    </div>
  )
}