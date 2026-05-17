import { Reveal } from '../hooks/useScrollReveal.jsx'
import ImagePlaceholder from './shared/ImagePlaceholder'

export default function Features() {
  return (
    <section id="features" className="relative py-32 z-10 overflow-hidden" style={{ background:'#050505' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal><p className="text-[0.68rem] font-bold tracking-[0.12em] uppercase text-white/30 mb-5">Features</p></Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-14"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            Rebuilt for humans.
          </h2>
        </Reveal>

        {/* Row 1: Voice AI large + Dual Physics */}
        <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-3 mb-3">
          <Reveal delay={1}>
            <div className="border border-white/8 rounded-2xl p-7 group hover:border-white/14 transition-all duration-300 h-full"
                 style={{ background:'rgba(255,255,255,0.03)' }}>
              <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center mb-5 text-white/65"
                   style={{ background:'rgba(255,255,255,0.06)' }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <rect x="7" y="2" width="6" height="10" rx="3"/><path d="M10 16v-3"/><path d="M5 11a5 5 0 0 0 10 0"/>
                </svg>
              </div>
              <span className="text-[0.65rem] font-bold tracking-[0.10em] uppercase text-white/55 mb-2 block">Voice + AI</span>
              <div className="text-[0.96rem] font-bold text-white mb-2">Describe a task. Gemini generates motion nodes in 5–15 seconds.</div>
              <div className="text-[0.78rem] text-white/65 leading-relaxed mb-5">
                ReAct streams live. Confidence %, collision check, gate status — all inline.
              </div>
              {/* Code block */}
              <div className="rounded-xl p-4 font-mono text-[0.70rem] leading-7 mb-5 border border-white/6"
                   style={{ background:'#050505' }}>
                <span className="code-cm">// Gemini output — verifier approved</span><br/>
                <span className="code-kw">steps</span><span className="code-tx">: [</span><br/>
                &nbsp;<span className="code-tx">{'{ type: '}</span><span className="code-st">"move"</span><span className="code-tx">{', y: '}</span><span className="code-nu">0.53</span><span className="code-tx"> {'},'}</span><br/>
                &nbsp;<span className="code-tx">{'{ type: '}</span><span className="code-st">"grip"</span><span className="code-tx">{', force: '}</span><span className="code-nu">50</span><span className="code-tx"> {'},'}</span><br/>
                &nbsp;<span className="code-tx">{'{ type: '}</span><span className="code-st">"move"</span><span className="code-tx">{', target: '}</span><span className="code-st">"zone-shelf"</span><span className="code-tx"> {'}'}</span><br/>
                <span className="code-tx">]</span>
              </div>
              <ImagePlaceholder label="AI Results — Confidence %, ReAct trace, Physics tab" aspect="16/7" />
            </div>
          </Reveal>

          <Reveal delay={2}>
            <div className="border border-white/8 rounded-2xl p-7 group hover:border-white/14 transition-all duration-300 h-full"
                 style={{ background:'rgba(255,255,255,0.03)' }}>
              <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center mb-5 text-white/65"
                   style={{ background:'rgba(255,255,255,0.06)' }}>
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 3"/>
                </svg>
              </div>
              <span className="text-[0.65rem] font-bold tracking-[0.10em] uppercase text-white/55 mb-2 block">Dual Physics</span>
              <div className="text-[0.96rem] font-bold text-white mb-2">60fps Rapier + MuJoCo validation.</div>
              <div className="text-[0.78rem] text-white/65 leading-relaxed mb-5">Two engines, one execution plan.</div>
              <div className="font-black tracking-[-0.07em] leading-none text-white mb-1" style={{ fontSize:'4rem' }}>94%</div>
              <div className="text-[0.72rem] font-medium text-white/30 mb-5">typical MuJoCo accuracy score</div>
              <ImagePlaceholder label="Simulation viewport — 60fps playback + path trail" aspect="4/3" />
            </div>
          </Reveal>
        </div>

        {/* Row 2: 3 small cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {[
            { tag:'Export', title:'Arduino + Python', sub:'Jinja2 deterministic. SHA-256 signed. Never LLM.', icon:<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M4 4h12M4 8h12M4 12h8M4 16h6"/></svg>, stat:'SHA-256', statSub:'every download' },
            { tag:'BOM',    title:'Live-priced parts', sub:'AliExpress + Amazon pricing per arm config.', icon:<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="14" height="14" rx="2"/><path d="M7 7h6M7 10h6M7 13h4"/></svg>, stat:'$300', statSub:'average build cost' },
            { tag:'QR',     title:'Scan on stage',    sub:'QR → BOM + code on phone instantly.', icon:<svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1"/><rect x="3" y="11" width="6" height="6" rx="1"/><circle cx="14" cy="14" r="2"/></svg>, stat:'0s', statSub:'to open BOM on phone' },
          ].map((c, i) => (
            <Reveal key={c.tag} delay={i + 1}>
              <div className="border border-white/8 rounded-2xl p-6 group hover:border-white/14 transition-all duration-300 h-full"
                   style={{ background:'rgba(255,255,255,0.03)' }}>
                <div className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center mb-4 text-white/60"
                     style={{ background:'rgba(255,255,255,0.05)' }}>{c.icon}</div>
                <span className="text-xs font-bold tracking-[0.10em] uppercase text-white/25 mb-1.5 block">{c.tag}</span>
                <div className="text-[0.90rem] font-bold text-white mb-1.5">{c.title}</div>
                <div className="text-[0.76rem] text-white/65 leading-relaxed mb-4">{c.sub}</div>
                <div className="font-black tracking-[-0.06em] leading-none text-white mb-1" style={{ fontSize:'2.4rem' }}>{c.stat}</div>
                <div className="text-[0.68rem] font-medium text-white/55">{c.statSub}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Row 3: Community + Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { tag:'Library', title:'12 ready-to-import tasks', sub:'Boston Dynamics · Tesla Optimus · Toyota Research preloads. One click loads into your arm.', img:'Community Library — task card grid with filter tabs' },
            { tag:'Presets', title:'Real robot specs in one click', sub:'UR5 (850mm) · KUKA KR6 (706mm) · ABB IRB 1200 (700mm). All community tasks adapt automatically.', img:'Robot Presets — UR5, KUKA, ABB selector' },
          ].map((c, i) => (
            <Reveal key={c.tag} delay={i + 1}>
              <div className="border border-white/8 rounded-2xl p-7 group hover:border-white/14 transition-all duration-300 h-full"
                   style={{ background:'rgba(255,255,255,0.03)' }}>
                <span className="text-xs font-bold tracking-[0.10em] uppercase text-white/25 mb-2 block">{c.tag}</span>
                <div className="text-[0.96rem] font-bold text-white mb-2">{c.title}</div>
                <div className="text-[0.78rem] text-white/65 leading-relaxed mb-5">{c.sub}</div>
                <ImagePlaceholder label={c.img} aspect="16/9" />
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
