import { useState, useRef, useEffect } from 'react'
import { useAtom } from 'jotai'
import { isAdvancedModeAtom } from './store/atoms'
import ArmViewer, { type ArmViewerHandle } from './components/ArmViewer'
import ArmDesignerPanel from './components/arm-designer/ArmDesignerPanel'
import TaskEditorPanel from './components/task-editor/TaskEditorPanel'
import TaskFlowCanvas from './components/task-editor/TaskFlowCanvas'








// Header Dust
const DUST_COUNT = 90

function HeaderDust() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!

    // Resize canvas to match header
    function resize() {
      canvas!.width = canvas!.offsetWidth
      canvas!.height = canvas!.offsetHeight
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    // Generate particles with unique orbital params
    const particles = Array.from({ length: DUST_COUNT }, (_, i) => {
      const seed = i * 2.399963
      return {
        // orbit center (as fraction of canvas dimensions, set at render time)
        cx: 0.05 + Math.abs(Math.sin(seed * 1.3)) * 0.9,
        cy: 0.1 + Math.abs(Math.sin(seed * 0.7)) * 0.8,
        // ellipse semi-axes in px
        rx: 6 + Math.abs(Math.sin(seed * 2.1)) * 28,
        ry: 3 + Math.abs(Math.cos(seed * 1.7)) * 14,
        // orbit speed (rad/s) — different for each
        speed: (0.12 + Math.abs(Math.sin(seed * 0.9)) * 0.28) * (i % 2 === 0 ? 1 : -1),
        phase: seed * 6.2832,
        // wind drift
        windAmpX: (Math.random() - 0.5) * 18,
        windAmpY: (Math.random() - 0.5) * 6,
        windFreq: 0.18 + Math.random() * 0.32,
        windPhase: Math.random() * 6.2832,
        // visual
        r: 0.8 + Math.random() * 1.6,
        opacity: 0.12 + Math.random() * 0.32,
      }
    })

    let raf: number
    let startTime = performance.now()

    function draw() {
      const t = (performance.now() - startTime) / 1000
      const w = canvas!.width
      const h = canvas!.height

      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        const angle = p.phase + t * p.speed
        const wx = Math.sin(t * p.windFreq + p.windPhase) * p.windAmpX
        const wy = Math.cos(t * p.windFreq * 0.7 + p.windPhase) * p.windAmpY
        const x = p.cx * w + Math.cos(angle) * p.rx + wx
        const y = p.cy * h + Math.sin(angle) * p.ry + wy

        ctx.beginPath()
        ctx.arc(x, y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(80,72,64,${p.opacity})`
        ctx.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
//



type NavItem = 'design' | 'tasks' | 'simulate' | 'export'
const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'simulate', label: 'Simulate' },
  { id: 'export', label: 'Export' },
]

const STEP_MAP: Record<NavItem, number> = { design: 1, tasks: 2, simulate: 3, export: 4 }

const STATUS_MAP: Record<NavItem, string> = {
  design: 'arm designer active',
  tasks: 'task editor active',
  simulate: 'simulation · coming day 4',
  export: 'export · coming day 6',
}

export default function App() {
  const [isAdvanced, setIsAdvanced] = useAtom(isAdvancedModeAtom)
  const [activeNav, setActiveNav] = useState<NavItem>('design')
  const [panelOpen, setPanelOpen] = useState(true)
  const [showHint, setShowHint] = useState(true)
  const [focusLevel, setFocusLevel] = useState<0 | 1 | 2>(1)
  const viewerRef = useRef<ArmViewerHandle>(null)

  const FOCUS_LABELS = ['Base', 'Mid', 'Top'] as const
  const FOCUS_DOT_Y  = [13, 8, 3] as const

  function handleFocusCycle() {
    const next = ((focusLevel + 1) % 3) as 0 | 1 | 2
    setFocusLevel(next)
    viewerRef.current?.setCameraFocus(next)
  }




function handleNavClick(nav: NavItem) {
  if (nav === activeNav) {
    setPanelOpen((o) => !o)
  } else {
    setActiveNav(nav)
    setPanelOpen(nav === 'design' || nav === 'tasks')
  }
}











  return (
    <div className="app-shell">
      <header className="app-header" style={{ position: 'relative', overflow: 'hidden' }}>
        <HeaderDust />
        <nav className="hdr-nav" aria-label="Workflow steps" style={{ position: 'relative', zIndex: 1 }}>
          {NAV_ITEMS.map(({ id, label }) => (
            <span
              key={id}
              className={`hdr-nav-item${activeNav === id ? ' hdr-nav-item--active' : ''}`}
              onClick={() => handleNavClick(id)}
              style={{ cursor: 'pointer' }}
            >
              {label}
            </span>
          ))}
        </nav>

        <div className="hdr-brand" style={{ position: 'relative', zIndex: 1 }}>
          <span className="hdr-logo">ミライ</span>
          <span className="hdr-wordmark">MIRAI</span>
        </div>

        <div className="hdr-right" style={{ position: 'relative', zIndex: 1 }}>
          <span className="hdr-step">Step {STEP_MAP[activeNav]} of 4</span>
          <button
            className={`hdr-mode${isAdvanced ? ' hdr-mode--detailed' : ''}`}
            onClick={() => setIsAdvanced(!isAdvanced)}
            title={isAdvanced ? 'Switch to Basic' : 'Switch to Detailed'}
            aria-pressed={isAdvanced}
          >
            <span className="hdr-mode-opt">Basic</span>
            <span className="hdr-mode-opt">Detailed</span>
          </button>
        </div>
      </header>

      <div className="app-body">
        {activeNav === 'design' && <ArmDesignerPanel hidden={!panelOpen} />}
        {activeNav === 'tasks' && panelOpen && <TaskEditorPanel />}

        <main className="viewport-wrapper">
          {activeNav === 'tasks' ? <TaskFlowCanvas /> : (<>
          <ArmViewer ref={viewerRef} />

          <button
            className={`viewport-focus-btn${focusLevel !== 1 ? ' viewport-focus-btn--active' : ''}`}
            onClick={handleFocusCycle}
            title={`Camera focus: ${FOCUS_LABELS[focusLevel]} — click to cycle`}
            aria-label={`Camera focus: ${FOCUS_LABELS[focusLevel]}`}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              {/* vertical rail */}
              <line x1="8" y1="1.5" x2="8" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.35"/>
              {/* tick marks */}
              <line x1="5.5" y1="3" x2="10.5" y2="3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
              <line x1="6" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
              <line x1="5.5" y1="13" x2="10.5" y2="13" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
              {/* moving dot */}
              <circle cx="8" cy={FOCUS_DOT_Y[focusLevel]} r="2.8" fill="currentColor"/>
            </svg>
          </button>

          <button
            className="viewport-reset-btn"
            onClick={() => { viewerRef.current?.resetCamera(); setFocusLevel(1); viewerRef.current?.setCameraFocus(1) }}
            title="Reset camera to default"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13.5 2.5v4.5h-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M13.36 7A6 6 0 1 1 10.5 3.14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
          </button>
          {showHint && (
            <div className="viewport-hint">
              <span>Drag to orbit · Ctrl+right-click to pan · Click a part to select</span>
              <button
                className="viewport-hint-close"
                onClick={() => setShowHint(false)}
                title="Dismiss"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <line x1="2" y1="2" x2="10" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                  <line x1="10" y1="2" x2="2" y2="10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
          )}
          </>)}
        </main>
      </div>

      <footer className="app-status-bar">
        <span className="status-item">
          <span className="status-dot status-dot--green" />
          Live preview ready
        </span>
        <span className="status-item">
          Server: <span className="status-offline">not connected · run python server/main.py</span>
        </span>
        <span className="status-item status-right">
          Mirai 0.1.0 · {STATUS_MAP[activeNav]}
        </span>
      </footer>
    </div>
  )
}