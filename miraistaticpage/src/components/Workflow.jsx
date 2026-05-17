import { useState, useEffect } from 'react'
import { Reveal } from '../hooks/useScrollReveal.jsx'
import ImagePlaceholder from './shared/ImagePlaceholder'

const STEPS = [
  { n:'01', name:'Design',   sub:'Build arm in 3D',        tech:'React Three Fiber',   icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="14" height="14" rx="3"/><path d="M7 10h6M10 7v6"/></svg> },
  { n:'02', name:'Describe', sub:'Type a task — voice optional',     tech:'Gemini 2.5 Flash',    icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="7" y="2" width="6" height="10" rx="3"/><path d="M10 16v-3"/><path d="M5 11a5 5 0 0 0 10 0"/></svg> },
  { n:'03', name:'Plan',     sub:'ReAct reasoning loop',   tech:'Scene Planner',        icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="10" r="7"/><path d="M10 7v3l2 2"/></svg> },
  { n:'04', name:'Verify',   sub:'Preflight safety check', tech:'Deterministic verifier',icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 10l5 5 9-9"/></svg> },
  { n:'05', name:'Simulate', sub:'60fps physics playback', tech:'Rapier WASM + MuJoCo', icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="5,4 17,10 5,16"/></svg> },
  { n:'06', name:'Export',   sub:'Code + BOM + QR',        tech:'Jinja2 · Signed ZIP',  icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M10 13V5M7 10l3 3 3-3"/><path d="M5 16h10"/></svg> },
]

export default function Workflow() {
  const [active, setActive] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setActive(p => (p + 1) % STEPS.length), 1400)
    return () => clearInterval(t)
  }, [])

  return (
    <section id="solution" className="relative py-32 z-10" style={{ background:'#050505' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal>
          <p className="text-[0.76rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-5">How It Works</p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-4"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            One URL.<br/>
            <span style={{ color:'rgba(255,255,255,0.22)' }}>Entire robotics workflow.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="text-white/65 text-base leading-relaxed mb-14 max-w-lg">
            Design → AI plan → physics verify → 60fps simulate → hardware export. Zero install.
          </p>
        </Reveal>

        {/* Animated pipeline */}
        <Reveal delay={3}>
          <div className="border border-white/8 rounded-2xl p-2 mb-12 overflow-auto"
               style={{ background:'rgba(255,255,255,0.02)' }}>
            <div className="flex items-stretch min-w-[680px]">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex-1 flex items-center">
                  {/* Step node */}
                  <div className="flex-1 flex flex-col items-center text-center px-3 py-7 relative">
                    {/* Connecting line left */}
                    {i > 0 && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-px bg-white/8 pipe-node-idle"
                           style={i <= active ? { background:'rgba(255,255,255,0.45)', boxShadow:'0 0 8px rgba(255,255,255,0.22)', transition:'all .45s ease' } : {}} />
                    )}
                    {/* Connecting line right */}
                    {i < STEPS.length - 1 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-px bg-white/8 pipe-node-idle"
                           style={i < active ? { background:'rgba(255,255,255,0.45)', boxShadow:'0 0 8px rgba(255,255,255,0.22)', transition:'all .45s ease' } : {}} />
                    )}
                    {/* Node circle */}
                    <div className={`relative z-10 w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-all duration-400 ${
                      i === active
                        ? 'pipe-node-active text-white'
                        : i < active
                          ? 'pipe-node-passed text-white/60'
                          : 'border-white/12 text-white/30'
                    }`}
                         style={i === active ? { background:'rgba(255,255,255,0.10)', borderColor:'rgba(255,255,255,0.85)', boxShadow:'0 0 22px rgba(255,255,255,0.28), 0 0 60px rgba(255,255,255,0.08)' } : i < active ? { borderColor:'rgba(255,255,255,0.35)', background:'rgba(255,255,255,0.05)' } : {}}>
                      {s.icon}
                    </div>
                    <div className={`text-xs font-bold tracking-wide mb-1 transition-colors duration-300 ${i === active ? 'text-white' : 'text-white/45'}`}>{s.n}</div>
                    <div className={`text-sm font-bold mb-1.5 transition-colors duration-300 ${i === active ? 'text-white' : 'text-white/60'}`}>{s.name}</div>
                    <div className={`text-xs font-medium transition-colors duration-300 ${i === active ? 'text-white/75' : 'text-white/40'}`}>{s.sub}</div>
                    <div className={`text-xs font-semibold mt-2 px-2 py-0.5 rounded border transition-all duration-300 ${
                      i === active
                        ? 'border-white/30 text-white/70 bg-white/8'
                        : 'border-white/10 text-white/35 bg-transparent'
                    }`}>{s.tech}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Workflow screenshot */}
        <Reveal delay={4}>
          <ImagePlaceholder label="Mirai — full workflow: Design panel + AI generation + Simulation viewport" aspect="21/9" />
        </Reveal>

      </div>
    </section>
  )
}
