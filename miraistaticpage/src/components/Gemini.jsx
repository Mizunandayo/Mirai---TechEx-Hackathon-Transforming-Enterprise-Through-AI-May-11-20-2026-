import { Reveal } from '../hooks/useScrollReveal.jsx'
import ImagePlaceholder from './shared/ImagePlaceholder'

const GeminiStar = ({ size = 28, color = '#4285F4' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 24C12 18.053 7.947 14 2 14c5.947 0 10-4.053 10-10 0 5.947 4.053 10 10 10-5.947 0-10 4.053-10 10z"/>
  </svg>
)

const MODELS = [
  {
    badge:'Primary',  name:'gemini-2.5-flash', color:'#4285F4',
    use:'Real-time planning · Voice · 5–15s',
    points:['25× faster than Vertex AI proxy', 'Native multimodal voice input', 'Free tier — no cloud credits needed'],
  },
  {
    badge:'Reasoning', name:'gemini-2.0-pro',   color:'#8E75B2',
    use:'ReAct loop · Complex planning · NL arm',
    points:['Deep spatial constraint analysis', 'Think → Act → Observe streams live', '"1.2m reach, 500g" → full arm config'],
  },
  {
    badge:'Fallback',  name:'Auto chain',        color:'rgba(255,255,255,0.35)',
    use:'Zero downtime during deprecations',
    chain:['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'],
  },
]

const USES = [
  { icon:<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 10h14M10 3l7 7-7 7"/></svg>, title:'Motion generation', desc:'NL → TaskSpec via grounded prompt. Gemini never touches joint angles.' },
  { icon:<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><circle cx="10" cy="10" r="7"/><path d="M10 7v3l2 2"/></svg>, title:'ReAct loop (visible)', desc:'Think → Act → Observe streams live in the panel. Not a black box.' },
  { icon:<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="7" y="2" width="6" height="10" rx="3"/><path d="M10 16v-3M5 11a5 5 0 0 0 10 0"/></svg>, title:'Voice input', desc:'Press mic → speak → arm moves in 15s. No keyboard required on stage.' },
  { icon:<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M3 6h14M3 10h10M3 14h7"/></svg>, title:'NL arm designer', desc:'"Arm reaching 1.2m, lifts 500g" → auto-configures segments + gripper.' },
]

export default function Gemini() {
  return (
    <section id="gemini" className="relative py-32 z-10 overflow-hidden" style={{ background:'#050505' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background:'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(66,133,244,0.06) 0%, transparent 70%)' }} />

      <div className="max-w-[1100px] mx-auto px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-8 mb-16">
          <Reveal>
            <div className="w-20 h-20 rounded-2xl border border-white/10 flex items-center justify-center flex-shrink-0"
                 style={{ background:'rgba(66,133,244,0.08)', boxShadow:'0 0 40px rgba(66,133,244,0.18)' }}>
              <GeminiStar size={46} color="#4285F4" />
            </div>
          </Reveal>
          <div>
            <Reveal><p className="text-[0.76rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-3">Gemini Award — Best Use of Gemini API</p></Reveal>
            <Reveal delay={1}>
              <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-3"
                  style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
                Gemini is the<br/>
                <span style={{ color:'rgba(255,255,255,0.22)' }}>intelligence layer.</span>
              </h2>
            </Reveal>
            <Reveal delay={2}>
              <p className="text-white/45 text-base leading-relaxed max-w-lg">
                Every motion plan flows through Gemini — intent, reasoning, voice, and confidence scoring.
                The deterministic verifier handles safety.
              </p>
            </Reveal>
          </div>
        </div>

        {/* Model cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {MODELS.map((m, i) => (
            <Reveal key={m.name} delay={i + 1}>
              <div className="border border-white/8 rounded-2xl p-6 h-full hover:border-white/14 transition-colors duration-300"
                   style={{ background:'rgba(255,255,255,0.03)' }}>
                <div className="text-xs font-bold tracking-[0.10em] uppercase text-white/55 mb-3">{m.badge}</div>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <GeminiStar size={16} color={m.color} />
                  <div className="text-[0.96rem] font-bold text-white tracking-tight">{m.name}</div>
                </div>
                <div className="text-[0.72rem] font-medium text-white/65 mb-4 leading-relaxed">{m.use}</div>

                {m.points && (
                  <div className="flex flex-col gap-2">
                    {m.points.map(p => (
                      <div key={p} className="flex items-start gap-2 text-[0.76rem] text-white/55 leading-relaxed">
                        <div className="w-1 h-1 rounded-full bg-white/35 flex-shrink-0 mt-2" />
                        {p}
                      </div>
                    ))}
                  </div>
                )}

                {m.chain && (
                  <div className="border border-white/8 rounded-xl p-3.5"
                       style={{ background:'rgba(255,255,255,0.03)' }}>
                    <div className="text-[0.62rem] font-bold tracking-[0.09em] uppercase text-white/25 mb-3">Priority order</div>
                    {m.chain.map((n, idx) => (
                      <div key={n}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${idx === 0 ? 'bg-green-400' : 'bg-white/22'}`} />
                          <span className={`font-mono text-[0.74rem] font-semibold ${idx === 0 ? 'text-white/75' : idx === 1 ? 'text-white/45' : 'text-white/55'}`}>{n}</span>
                        </div>
                        {idx < m.chain.length - 1 && <div className="text-[0.60rem] text-white/20 pl-4 mb-1.5">↓ on 404</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>

        {/* 4 use cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
          {USES.map((u, i) => (
            <Reveal key={u.title} delay={(i % 2) + 1}>
              <div className="border border-white/6 rounded-2xl p-5 flex items-start gap-4 hover:border-white/12 transition-colors duration-300"
                   style={{ background:'rgba(255,255,255,0.02)' }}>
                <div className="w-8 h-8 rounded-lg border border-white/10 flex items-center justify-center flex-shrink-0 text-white/60"
                     style={{ background:'rgba(255,255,255,0.05)' }}>
                  {u.icon}
                </div>
                <div>
                  <div className="text-[0.86rem] font-bold text-white mb-1">{u.title}</div>
                  <div className="text-[0.76rem] text-white/65 leading-relaxed">{u.desc}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* AI Results screenshot */}
        <Reveal delay={3}>
          <ImagePlaceholder label="Mirai — AI Results panel: Gemini ReAct trace, Confidence %, Physics tab, Gate Debug" aspect="21/8" className="border-white/10" />
        </Reveal>

      </div>
    </section>
  )
}
