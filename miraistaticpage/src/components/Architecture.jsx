import { Reveal } from '../hooks/useScrollReveal.jsx'

const Box = ({ title, sub, v = 'default' }) => {
  const s = {
    default: { bg:'rgba(255,255,255,0.05)', border:'rgba(255,255,255,0.10)', t:'rgba(255,255,255,0.85)', s:'rgba(255,255,255,0.38)' },
    bright:  { bg:'rgba(255,255,255,0.10)', border:'rgba(255,255,255,0.25)', t:'#ffffff',                 s:'rgba(255,255,255,0.55)' },
    green:   { bg:'rgba(74,222,128,0.06)',  border:'rgba(74,222,128,0.22)',  t:'#4ade80',                 s:'rgba(74,222,128,0.55)' },
    blue:    { bg:'rgba(59,130,246,0.06)',  border:'rgba(59,130,246,0.22)',  t:'rgba(147,197,253,0.9)',   s:'rgba(147,197,253,0.55)' },
  }[v]
  return (
    <div className="rounded-xl px-3.5 py-3 flex-1 min-w-[110px]"
         style={{ background:s.bg, border:`1px solid ${s.border}` }}>
      <div className="text-[0.76rem] font-bold mb-0.5" style={{ color:s.t }}>{title}</div>
      <div className="text-[0.65rem] font-medium" style={{ color:s.s }}>{sub}</div>
    </div>
  )
}

const TRADEOFFS = [
  { dec:'Physics',    chosen:'Rapier WASM in-browser',         vs:'vs. server-side',         rat:'Zero round-trip = 60fps guaranteed. MuJoCo validates after.' },
  { dec:'AI path',   chosen:'Direct Gemini SDK (browser)',     vs:'vs. Vertex AI proxy',     rat:'Dropped latency 4–6 min → 5–15s.' },
  { dec:'Code export',chosen:'Jinja2 deterministic templates', vs:'vs. LLM generation',      rat:'Hardware code must be bit-for-bit reproducible.' },
  { dec:'Arm model', chosen:'FK-driven kinematic arm',         vs:'vs. Rapier joint sim',    rat:'Pure lookup table = stable 60fps always.' },
  { dec:'Task UI',   chosen:'React Flow visual editor',        vs:'vs. text DSL',            rat:'Accessible to non-programmers. AI populates it.' },
  { dec:'Deploy',    chosen:'Vercel + Railway web-first',      vs:'vs. desktop app',         rat:'Judges open a URL. Demo runs from a QR scan on stage.' },
]

export default function Architecture() {
  return (
    <section id="architecture" className="relative py-32 z-10" style={{ background:'#070707' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal><p className="text-[0.68rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-5">Engineering Architecture</p></Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-4"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            Intent from AI.<br/>
            <span style={{ color:'rgba(255,255,255,0.22)' }}>Safety from code.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="text-white/65 text-base leading-relaxed mb-12 max-w-lg">
            No unsafe plan ever reaches the physics engine or hardware export.
          </p>
        </Reveal>

        {/* Architecture diagram */}
        <Reveal delay={3}>
          <div className="border border-white/8 rounded-2xl p-7 mb-10 overflow-auto"
               style={{ background:'rgba(255,255,255,0.02)' }}>
            <div className="flex flex-col gap-5 min-w-[560px]">

              <div>
                <div className="text-xs font-bold tracking-[0.10em] uppercase text-white/55 mb-2.5">Browser — React 18 + Vite</div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Box v="bright" title="Arm Designer" sub="React Three Fiber · Rapier WASM" />
                  <span className="text-white/22 text-sm flex-shrink-0">→</span>
                  <Box v="bright" title="Task Editor"  sub="React Flow · Visual programming" />
                  <span className="text-white/22 text-sm flex-shrink-0">→</span>
                  <Box v="bright" title="Gemini AI"    sub="Direct SDK · ReAct loop · 5-15s" />
                </div>
              </div>

              <div className="h-px bg-white/6" />

              <div>
                <div className="text-xs font-bold tracking-[0.10em] uppercase text-white/55 mb-2.5">Deterministic safety pipeline</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['SceneGraph','TaskSpec','ValidationReport','ExecutionPlan'].map((n, i, a) => (
                    <div key={n} className="flex items-center gap-2">
                      <div className="rounded-lg px-3 py-2 border border-white/10 text-[0.70rem] font-bold text-white/65"
                           style={{ background:'rgba(255,255,255,0.04)' }}>{n}</div>
                      {i < a.length-1 && <span className="text-white/22 text-sm">→</span>}
                    </div>
                  ))}
                </div>
                <p className="text-[0.70rem] text-white/55 mt-2 font-medium">
                  Gemini outputs TaskSpec only — never joint angles. Verifier repairs or blocks unsafe plans.
                </p>
              </div>

              <div className="h-px bg-white/6" />

              <div>
                <div className="text-xs font-bold tracking-[0.10em] uppercase text-white/55 mb-2.5">Dual physics — same ExecutionPlan, two validators</div>
                <div className="flex items-center gap-4 flex-wrap">
                  <Box v="green" title="Rapier WASM (client)" sub="60fps · FK-driven · zero latency" />
                  <span className="text-white/12 text-2xl font-thin flex-shrink-0">|</span>
                  <Box v="blue"  title="MuJoCo (server)"      sub="Accuracy % · divergence mm · servo lifespan" />
                </div>
              </div>

              <div className="h-px bg-white/6" />

              <div>
                <div className="text-xs font-bold tracking-[0.10em] uppercase text-white/55 mb-2.5">Export — Jinja2 deterministic, not LLM</div>
                <div className="flex items-center gap-2 flex-wrap">
                  {['Arduino .ino','Python .py','BOM CSV','URDF · QR · SHA-256'].map((n, i, a) => (
                    <div key={n} className="flex items-center gap-2">
                      <div className="rounded-lg px-3 py-2 border border-white/8 text-[0.68rem] font-bold text-white/50"
                           style={{ background:'rgba(255,255,255,0.03)' }}>{n}</div>
                      {i < a.length-1 && <span className="text-white/18 text-sm">+</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Reveal>

        {/* Trade-offs */}
        <h3 className="text-[0.88rem] font-bold text-white/50 mb-4 uppercase tracking-widest text-xs">Key trade-offs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {TRADEOFFS.map((t, i) => (
            <Reveal key={t.dec} delay={(i % 3) + 1}>
              <div className="border border-white/6 rounded-2xl p-5 group hover:border-white/12 transition-colors duration-300"
                   style={{ background:'rgba(255,255,255,0.02)' }}>
                <div className="text-[0.60rem] font-bold tracking-[0.10em] uppercase text-white/25 mb-2">{t.dec}</div>
                <div className="text-[0.86rem] font-bold text-white mb-0.5">{t.chosen}</div>
                <div className="text-[0.70rem] font-semibold text-white/55 mb-2">{t.vs}</div>
                <div className="text-[0.76rem] text-white/65 leading-relaxed">{t.rat}</div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
