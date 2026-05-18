import { useState, useEffect } from 'react'
import { Reveal } from '../hooks/useScrollReveal.jsx'
import ImagePlaceholder from './shared/ImagePlaceholder'

const STEPS = [
  { n:'01', name:'Design',   sub:'Build arm in 3D',        tech:'React Three Fiber', color:'#38bdf8', icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="14" height="14" rx="3"/><path d="M7 10h6M10 7v6"/></svg> },
  { n:'02', name:'Describe', sub:'Type a task — voice optional',     tech:'Gemini 2.5 Flash', color:'#60a5fa', icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="7" y="2" width="6" height="10" rx="3"/><path d="M10 16v-3"/><path d="M5 11a5 5 0 0 0 10 0"/></svg> },
  { n:'03', name:'Plan',     sub:'ReAct reasoning loop',   tech:'Scene Planner', color:'#a78bfa', icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="10" r="7"/><path d="M10 7v3l2 2"/></svg> },
  { n:'04', name:'Verify',   sub:'Preflight safety check', tech:'Deterministic verifier', color:'#fbbf24', icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 10l5 5 9-9"/></svg> },
  { n:'05', name:'Simulate', sub:'60fps physics playback', tech:'Rapier WASM + MuJoCo', color:'#34d399', icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><polygon points="5,4 17,10 5,16"/></svg> },
  { n:'06', name:'Export',   sub:'Code + BOM + URDF',        tech:'Jinja2 · Signed ZIP', color:'#fb7185', icon:<svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M10 13V5M7 10l3 3 3-3"/><path d="M5 16h10"/></svg> },
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
          <p className="micro-label font-bold uppercase text-zinc-300/90 mb-5">How It Works</p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-4"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            One URL.<br/>
            <span style={{ color:'rgba(228,228,231,0.48)' }}>Entire robotics workflow.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="text-zinc-100/85 text-[1.03rem] leading-relaxed mb-8 max-w-2xl">
            Design → AI plan → physics verify → 60fps simulate → hardware export. Zero install.
          </p>
        </Reveal>

        <Reveal delay={3}>
          <div className="glass-panel rounded-2xl p-4 mb-8">
            <div className="flow-lane mb-2">
              <span className="flow-pulse" />
              <span className="flow-pulse delay-1" />
              <span className="flow-pulse delay-2" />
            </div>
            <div className="small-copy text-zinc-200/80 text-center">
              Continuous data flow from scene input to deterministic execution output.
            </div>
          </div>
        </Reveal>

        {/* Animated pipeline */}
        <Reveal delay={4}>
          <div className="glass-panel rounded-2xl p-2 mb-12 overflow-auto">
            <div className="flex items-stretch min-w-[680px]">
              {STEPS.map((s, i) => (
                <div key={s.n} className="flex-1 flex items-center">
                  {/* Step node */}
                  <div className="flex-1 flex flex-col items-center text-center px-3 py-7 relative">
                    {/* Connecting line left */}
                    {i > 0 && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-px bg-zinc-500/30 pipe-node-idle"
                        style={i <= active ? { background:'rgba(228,228,231,0.9)', boxShadow:'0 0 8px rgba(228,228,231,0.38)', transition:'all .45s ease' } : {}} />
                    )}
                    {/* Connecting line right */}
                    {i < STEPS.length - 1 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-px bg-zinc-500/30 pipe-node-idle"
                        style={i < active ? { background:'rgba(228,228,231,0.9)', boxShadow:'0 0 8px rgba(228,228,231,0.38)', transition:'all .45s ease' } : {}} />
                    )}
                    {/* Node circle */}
                    <div className={`relative z-10 w-12 h-12 rounded-full border flex items-center justify-center mb-3 transition-all duration-400 ${
                      i === active
                        ? 'pipe-node-active text-white'
                        : i < active
                          ? 'pipe-node-passed text-zinc-200'
                          : 'border-zinc-500/45 text-zinc-400'
                    }`}
                         style={i === active ? { background:'rgba(212,212,216,0.16)', borderColor:'rgba(212,212,216,0.9)', boxShadow:'0 0 22px rgba(212,212,216,0.35), 0 0 60px rgba(212,212,216,0.1)' } : i < active ? { borderColor:'rgba(161,161,170,0.55)', background:'rgba(161,161,170,0.12)' } : {}}>
                       <span style={{ color: s.color }}>
                      {s.icon}
                       </span>
                    </div>
                    <div className={`text-[0.84rem] font-bold tracking-wide mb-1 transition-colors duration-300 ${i === active ? 'text-white' : 'text-zinc-300/80'}`}>{s.n}</div>
                    <div className={`text-[0.96rem] font-bold mb-1.5 transition-colors duration-300 ${i === active ? 'text-white' : 'text-zinc-200/90'}`}>{s.name}</div>
                    <div className={`text-[0.84rem] font-medium transition-colors duration-300 ${i === active ? 'text-zinc-100/90' : 'text-zinc-300/70'}`}>{s.sub}</div>
                    <div className={`text-[0.82rem] font-semibold mt-2 px-2 py-0.5 rounded border transition-all duration-300 ${
                      i === active
                        ? 'border-zinc-300/50 text-zinc-100/90 bg-zinc-400/20'
                        : 'border-zinc-500/45 text-zinc-300/75 bg-transparent'
                    }`}>{s.tech}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Workflow screenshot */}
        <Reveal delay={5}>
          <img
            src="/screenshots/workflow.png"
            alt="Mirai — full workflow: Design panel + AI generation + Simulation viewport"
            style={{
              maxWidth: '100%',
              height: 'auto',
              display: 'block',
              margin: '0 auto',
              borderRadius: '0.75rem',
              border: '1px solid rgba(163,163,163,0.15)'
            }}
          />
        </Reveal>

      </div>
    </section>
  )
}
