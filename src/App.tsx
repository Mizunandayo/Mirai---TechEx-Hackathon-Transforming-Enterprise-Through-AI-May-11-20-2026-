import { useState, useRef, useEffect } from 'react'
import { useAtom } from 'jotai'
import { isAdvancedModeAtom } from './store/atoms'
import ArmViewer, { type ArmViewerHandle } from './components/ArmViewer'
import ArmDesignerPanel from './components/arm-designer/ArmDesignerPanel'

// ─── Header Dust ───────────────────────────────────────────────────────────────
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
// ───────────────────────────────────────────────────────────────────────────────

type NavItem = 'design' | 'tasks' | 'simulate' | 'export'
const NAV_ITEMS: { id: NavItem; label: string }[] = [
  { id: 'design', label: 'Design' },
  { id: 'tasks', label: 'Tasks' },
  { id: 'simulate', label: 'Simulate' },
  { id: 'export', label: 'Export' },
]

export default function App() {
  const [isAdvanced, setIsAdvanced] = useAtom(isAdvancedModeAtom)
  const [activeNav, setActiveNav] = useState<NavItem>('design')
  const [panelOpen, setPanelOpen] = useState(true)
  const [showHint, setShowHint] = useState(true)
  const viewerRef = useRef<ArmViewerHandle>(null)

  function handleNavClick(nav: NavItem) {
    if (nav === activeNav) {
      setPanelOpen((o) => !o)
    } else {
      setActiveNav(nav)
      setPanelOpen(nav === 'design')
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
          <span className="hdr-logo">未来</span>
          <span className="hdr-wordmark">MIRAI</span>
        </div>

        <div className="hdr-right" style={{ position: 'relative', zIndex: 1 }}>
          <span className="hdr-step">Step 1 of 4</span>
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
        <ArmDesignerPanel hidden={!panelOpen} />

        <main className="viewport-wrapper">
          <ArmViewer ref={viewerRef} />

          <button
            className="viewport-reset-btn"
            onClick={() => viewerRef.current?.resetCamera()}
            title="Reset camera to center"
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
          Mirai 0.1.0 · arm designer complete
        </span>
      </footer>
    </div>
  )
}