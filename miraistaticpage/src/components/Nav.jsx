import { useState, useEffect } from 'react'

const LINKS = [
  { href:'#problem',         label:'Problem' },
  { href:'#solution',        label:'Workflow' },
  { href:'#differentiation', label:'Why Mirai' },
  { href:'#gemini',          label:'Gemini' },
  { href:'#architecture',    label:'Architecture' },
  { href:'#features',        label:'Features' },
  { href:'#techstack',       label:'Stack' },
  { href:'#market',          label:'Market' },
  { href:'#revenue',         label:'Revenue' },
  { href:'#roadmap',         label:'Roadmap' },   
  { href:'#demo',            label:'Demo' },
]

export default function Nav() {
  const [active, setActive] = useState('')

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActive(e.target.id) }),
      { threshold: 0.3 }
    )
    document.querySelectorAll('section[id]').forEach(s => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const go = (e, href) => {
    e.preventDefault()
    document.querySelector(href)?.scrollIntoView({ behavior:'smooth', block:'start' })
  }

  return (
    /* Floating pill nav — no border, detached from top */
    <nav
      className="nav-glass fixed top-5 left-1/2 z-50"
      style={{
        transform: 'translateX(-50%)',
        borderRadius: 999,
        padding: '0 6px',
        height: 52,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        border: '1px solid rgba(163,163,163,0.26)',
        boxShadow: '0 0 0 1px rgba(0,0,0,0.5), 0 8px 32px rgba(0,0,0,0.4)',
        minWidth: 'max-content',
      }}
    >
      {/* Brand */}
      <a
        href="#hero"
        onClick={e => go(e, '#hero')}
        className="flex items-center gap-2 no-underline text-white px-4"
        style={{ fontWeight:700, fontSize:'0.84rem', letterSpacing:'0.14em', textTransform:'uppercase', whiteSpace:'nowrap' }}
      >
        <span style={{ fontSize:'0.96rem', letterSpacing:'-0.01em' }}>ミライ</span>
        MIRAI
      </a>

      {/* Divider */}
      <div style={{ width:1, height:20, background:'rgba(255,255,255,0.10)', flexShrink:0, margin:'0 4px' }} />

      {/* Links */}
      <div className="hidden lg:flex" style={{ gap:2 }}>
        {LINKS.map(({ href, label }) => (
          <a
            key={href}
            href={href}
            onClick={e => go(e, href)}
            className="no-underline transition-all"
            style={{
              fontSize: '0.84rem',
              fontWeight: active === href.slice(1) ? 600 : 500,
              color: active === href.slice(1) ? '#fff' : 'rgba(255,255,255,0.50)',
              padding: '6px 12px',
              borderRadius: 999,
              background: active === href.slice(1) ? 'rgba(161,161,170,0.22)' : 'transparent',
              whiteSpace: 'nowrap',
              transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
            }}
          >
            {label}
          </a>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width:1, height:20, background:'rgba(255,255,255,0.10)', flexShrink:0, margin:'0 4px' }} />

      {/* CTA */}
      <a
        href="https://mirai-tech-ex-hackathon-transformin.vercel.app"
        target="_blank"
        rel="noopener noreferrer"
        className="no-underline flex items-center gap-2"
        style={{
          background: '#ffffff',
          color: '#050505',
          fontSize: '0.78rem',
          fontWeight: 700,
          padding: '8px 18px',
          borderRadius: 999,
          transition: 'opacity 150ms',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.86'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        Live Demo
        <span style={{
          width:20, height:20, borderRadius:'50%',
          background:'rgba(0,0,0,0.10)',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <svg width="9" height="9" viewBox="0 0 16 16" fill="none">
            <path d="M3 13L13 3M13 3H7M13 3v6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </a>
    </nav>
  )
}
