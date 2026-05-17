import { useEffect, useRef } from 'react'
import ImagePlaceholder from './shared/ImagePlaceholder'

/* ── Star-field canvas — identical to WeavePay aesthetic ── */
function StarField() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    function resize() {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      draw()
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      // 240 random stars with varying size + opacity
      for (let i = 0; i < 240; i++) {
        const x  = Math.random() * canvas.width
        const y  = Math.random() * canvas.height
        const r  = Math.random() * 1.1 + 0.15
        const op = Math.random() * 0.55 + 0.08
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${op})`
        ctx.fill()
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)
    return () => ro.disconnect()
  }, [])

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:0 }}
    />
  )
}

/* ── Subtle perspective grid ── */
function PerspectiveGrid() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none',
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '80px 80px',
        maskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)',
        WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 50%, black 30%, transparent 100%)',
      }}
    />
  )
}

const STATS = [
  { num:'60fps', lbl:'In-browser physics' },
  { num:'5–15s', lbl:'AI generation' },
  { num:'<$300', lbl:'Build a real arm' },
  { num:'0 min', lbl:'Setup time' },
]

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden" style={{ minHeight:'100dvh', background:'#050505' }}>

      <StarField />
      <PerspectiveGrid />

      {/* Radial spotlight — behind the headline */}
      <div aria-hidden="true" style={{
        position:'absolute', inset:0, zIndex:1, pointerEvents:'none',
        background:'radial-gradient(ellipse 65% 55% at 50% 42%, rgba(255,255,255,0.055) 0%, transparent 70%)',
      }} />

      {/* ── Main content ── */}
      <div
        style={{
          position:'relative', zIndex:2,
          display:'flex', flexDirection:'column', alignItems:'center',
          justifyContent:'center', minHeight:'100dvh',
          padding:'100px 32px 80px',
          textAlign:'center',
        }}
      >
        {/* Hackathon badge */}
        <div
          className="hero-enter"
          style={{
            animationDelay: '0.05s',
            display:'inline-flex', alignItems:'center', gap:8,
            border:'1px solid rgba(255,255,255,0.14)',
            borderRadius:999,
            padding:'7px 18px',
            marginBottom:36,
            background:'rgba(255,255,255,0.05)',
            backdropFilter:'blur(12px)',
            fontSize:'0.78rem', fontWeight:600,
            color:'rgba(255,255,255,0.70)',
            letterSpacing:'0.02em',
          }}
        >
          <span style={{
            width:7, height:7, borderRadius:'50%',
            background:'#22c55e',
            flexShrink:0,
            animation:'pulseDot 2.2s ease-in-out infinite',
          }} />
          Transforming Enterprise Through AI &nbsp;·&nbsp; lablab.ai &nbsp;·&nbsp; May 11–19, 2026
        </div>

        {/* Kanji */}
        <p
          className="hero-enter"
          style={{
            animationDelay:'0.12s',
            fontSize:'0.92rem', fontWeight:500,
            color:'rgba(255,255,255,0.35)',
            letterSpacing:'0.18em',
            marginBottom:14,
          }}
        >
          未来 &nbsp;—&nbsp; "Future"
        </p>

        {/* MIRAI — the centrepiece */}
        <h1
          className="hero-enter"
          style={{
            animationDelay:'0.20s',
            fontWeight:900,
            letterSpacing:'-0.06em',
            lineHeight:0.92,
            color:'#ffffff',
            marginBottom:20,
            fontSize:'clamp(5rem,14vw,11rem)',
          }}
        >
          MIRAI
        </h1>

        {/* Subtitle */}
        <p
          className="hero-enter"
          style={{
            animationDelay:'0.30s',
            fontSize:'clamp(1rem,2.2vw,1.4rem)',
            fontWeight:500,
            color:'rgba(255,255,255,0.55)',
            letterSpacing:'-0.01em',
            marginBottom:14,
            lineHeight:1.4,
          }}
        >
          AI-Powered Robot Arm Simulator
        </p>

        {/* One-liner */}
        <p
          className="hero-enter"
          style={{
            animationDelay:'0.38s',
            fontSize:'clamp(0.88rem,1.4vw,1.05rem)',
            fontWeight:400,
            color:'rgba(255,255,255,0.42)',
            maxWidth:520,
            lineHeight:1.75,
            marginBottom:44,
          }}
        >
          Describe a task. Gemini generates the motion plan.
          Watch physics prove it works. Download the code. Build it for under $300.
        </p>

        {/* CTA buttons */}
        <div
          className="hero-enter"
          style={{
            animationDelay:'0.46s',
            display:'flex', gap:12, flexWrap:'wrap',
            justifyContent:'center', marginBottom:56,
          }}
        >
          <a
            href="https://mirai-tech-ex-hackathon-transformin.vercel.app"
            target="_blank" rel="noopener noreferrer"
            style={{
              display:'inline-flex', alignItems:'center', gap:10,
              background:'#ffffff', color:'#050505',
              fontSize:'0.88rem', fontWeight:700,
              padding:'14px 28px', borderRadius:999,
              textDecoration:'none',
              transition:'opacity 150ms cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity='0.86'}
            onMouseLeave={e => e.currentTarget.style.opacity='1'}
          >
            Try Live Demo
            <span style={{
              width:24, height:24, borderRadius:'50%',
              background:'rgba(0,0,0,0.10)',
              display:'flex', alignItems:'center', justifyContent:'center',
              flexShrink:0,
            }}>
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none">
                <path d="M3 13L13 3M13 3H7M13 3v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </span>
          </a>
          <a
            href="https://github.com/Mizunandayo/mirai"
            target="_blank" rel="noopener noreferrer"
            style={{
              display:'inline-flex', alignItems:'center', gap:8,
              border:'1px solid rgba(255,255,255,0.18)',
              color:'rgba(255,255,255,0.72)',
              fontSize:'0.88rem', fontWeight:500,
              padding:'14px 28px', borderRadius:999,
              textDecoration:'none',
              background:'rgba(255,255,255,0.04)',
              backdropFilter:'blur(8px)',
              transition:'all 200ms cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={e => { e.currentTarget.style.color='#fff'; e.currentTarget.style.borderColor='rgba(255,255,255,0.32)' }}
            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor='rgba(255,255,255,0.18)' }}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View on GitHub
          </a>
        </div>

        {/* Stats bar */}
        <div
          className="hero-enter"
          style={{
            animationDelay:'0.54s',
            display:'grid',
            gridTemplateColumns:`repeat(${STATS.length}, 1fr)`,
            border:'1px solid rgba(255,255,255,0.09)',
            borderRadius:16,
            overflow:'hidden',
            background:'rgba(255,255,255,0.03)',
            backdropFilter:'blur(12px)',
            width:'100%', maxWidth:560,
          }}
        >
          {STATS.map((s, i) => (
            <div
              key={s.num}
              style={{
                display:'flex', flexDirection:'column', alignItems:'center',
                padding:'18px 20px',
                borderLeft: i !== 0 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <span style={{
                fontSize:'clamp(1.2rem,2.4vw,1.55rem)',
                fontWeight:900, letterSpacing:'-0.05em', lineHeight:1,
                color:'#ffffff', marginBottom:4,
              }}>{s.num}</span>
              <span style={{
                fontSize:'0.72rem', fontWeight:500,
                color:'rgba(255,255,255,0.42)',
                textAlign:'center', whiteSpace:'nowrap',
              }}>{s.lbl}</span>
            </div>
          ))}
        </div>

        {/* Hackathon metadata row */}
        <div
          className="hero-enter"
          style={{
            animationDelay:'0.62s',
            marginTop:32,
            display:'flex', flexWrap:'wrap', gap:20,
            justifyContent:'center', alignItems:'center',
          }}
        >
          {[
            { label:'Developer', value:'Francis Daniel — Mizu' },
            { label:'Track',     value:'Track 3 · Robotics & Simulation' },
            { label:'Award',     value:'+ Gemini Award' },
            { label:'Deadline',  value:'May 19, 2026 · 8:00 AM PST' },
          ].map(m => (
            <div key={m.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <span style={{ fontSize:'0.64rem', fontWeight:700, letterSpacing:'0.10em', textTransform:'uppercase', color:'rgba(255,255,255,0.25)' }}>{m.label}</span>
              <span style={{ fontSize:'0.82rem', fontWeight:600, color:'rgba(255,255,255,0.68)' }}>{m.value}</span>
            </div>
          ))}
        </div>

      </div>

      {/* App screenshot strip below fold */}
      <div style={{
        position:'relative', zIndex:2,
        width:'100%', maxWidth:1100,
        margin:'0 auto',
        padding:'0 32px 80px',
      }}>
        <div style={{
          position:'relative',
          borderRadius:20,
          overflow:'hidden',
          border:'1px solid rgba(255,255,255,0.09)',
          boxShadow:'0 0 80px rgba(255,255,255,0.04), 0 40px 100px rgba(0,0,0,0.6)',
        }}>
          {/* Floating chips */}
          <div className="chip-f1" style={{
            position:'absolute', top:-14, right:48, zIndex:10,
            display:'flex', alignItems:'center', gap:6,
            border:'1px solid rgba(255,255,255,0.14)', borderRadius:12,
            padding:'7px 14px', fontSize:'0.72rem', fontWeight:700,
            color:'rgba(255,255,255,0.85)',
            background:'rgba(5,5,5,0.80)', backdropFilter:'blur(12px)',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }} />
            Rapier 60fps
          </div>
          <div className="chip-f2" style={{
            position:'absolute', top:36, left:-16, zIndex:10,
            display:'flex', alignItems:'center', gap:6,
            border:'1px solid rgba(255,255,255,0.14)', borderRadius:12,
            padding:'7px 14px', fontSize:'0.72rem', fontWeight:700,
            color:'rgba(255,255,255,0.85)',
            background:'rgba(5,5,5,0.80)', backdropFilter:'blur(12px)',
          }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#4285F4">
              <path d="M12 24C12 18.053 7.947 14 2 14c5.947 0 10-4.053 10-10 0 5.947 4.053 10 10 10-5.947 0-10 4.053-10 10z"/>
            </svg>
            Gemini AI
          </div>
          <div className="chip-f3" style={{
            position:'absolute', bottom:-14, right:80, zIndex:10,
            display:'flex', alignItems:'center', gap:6,
            border:'1px solid rgba(255,255,255,0.14)', borderRadius:12,
            padding:'7px 14px', fontSize:'0.72rem', fontWeight:700,
            color:'rgba(255,255,255,0.85)',
            background:'rgba(5,5,5,0.80)', backdropFilter:'blur(12px)',
          }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'#60a5fa' }} />
            MuJoCo 94%
          </div>
          <ImagePlaceholder
            label="Mirai App — Arm Designer + AI Results + Simulation viewport"
            aspect="21/9"
            className="border-0 rounded-none"
          />
        </div>
      </div>

      {/* Scroll cue */}
      <div style={{
        position:'relative', zIndex:2,
        display:'flex', flexDirection:'column', alignItems:'center',
        gap:6, paddingBottom:24, opacity:0.28,
      }}>
        <div style={{ width:1, height:32, background:'rgba(255,255,255,0.5)' }} />
        <span style={{ fontSize:'0.62rem', fontWeight:600, letterSpacing:'0.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)' }}>Scroll</span>
      </div>
    </section>
  )
}
