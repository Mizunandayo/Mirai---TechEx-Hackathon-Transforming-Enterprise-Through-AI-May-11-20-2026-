import { Reveal } from '../hooks/useScrollReveal.jsx'

const Check = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.5)" strokeWidth="1.2"/>
    <path d="m5 8 2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const Cross = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.12)" strokeWidth="1.2"/>
    <path d="m5.5 5.5 5 5M10.5 5.5l-5 5" stroke="rgba(255,255,255,0.22)" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)
const Part = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="rgba(255,255,255,0.22)" strokeWidth="1.2"/>
    <path d="M5 8h6" stroke="rgba(255,255,255,0.35)" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
)

const ROWS = [
  { feat:'Zero install (browser)',    m:true,  d1:false, d2:false, d3:false, d4:false },
  { feat:'Natural language input',    m:true,  d1:false, d2:false, d3:false, d4:false },
  { feat:'Voice input',               m:true,  d1:false, d2:false, d3:false, d4:false },
  { feat:'60fps real-time physics',   m:true,  d1:true,  d2:true,  d3:true,  d4:true  },
  { feat:'Server-side validation',    m:true,  d1:false, d2:false, d3:'~',   d4:false },
  { feat:'Arduino + Python export',   m:true,  d1:'~',   d2:false, d3:'~',   d4:false },
  { feat:'BOM with live pricing',     m:true,  d1:false, d2:false, d3:false, d4:false },
  { feat:'Free to start',             m:true,  d1:false, d2:true,  d3:false, d4:'~'   },
  { feat:'Setup time',                m:'0 min',d1:'20+',d2:'30+', d3:'30+', d4:'25+' },
]

function Cell({ v }) {
  if (v === true)  return <Check />
  if (v === false) return <Cross />
  if (v === '~')   return <Part />
  return <span className="font-mono text-[0.70rem] font-bold text-white/55">{v}</span>
}

const DIFFS = [
  { n:'01', title:'Neuro-symbolic',   desc:'Gemini for intent. Deterministic verifier for safety. No LLM touches hardware code.' },
  { n:'02', title:'Dual physics',     desc:'Rapier at 60fps client-side. MuJoCo validates the exact same plan server-side.' },
  { n:'03', title:'Hardware bridge',  desc:'Jinja2 code + live BOM + QR. Build the arm for under $300 from the download.' },
  { n:'04', title:'Visible reasoning',desc:'Gemini ReAct streams Think → Act → Observe live. Not a black box.' },
]

export default function WhyMirai() {
  return (
    <section id="differentiation" className="relative py-32 z-10" style={{ background:'#070707' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal><p className="text-[0.76rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-5">Why Mirai</p></Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-4"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            No existing tool<br/>
            <span style={{ color:'rgba(255,255,255,0.22)' }}>does all of this.</span>
          </h2>
        </Reveal>

        {/* Comparison table */}
        <Reveal delay={2}>
          <div className="border border-white/8 rounded-2xl overflow-auto mb-8"
               style={{ background:'rgba(255,255,255,0.02)' }}>
            <table className="w-full border-collapse" style={{ minWidth:580 }}>
              <thead>
                <tr className="border-b border-white/8">
                  <th className="py-3.5 px-5 text-left text-[0.70rem] font-bold text-white/55 tracking-wide uppercase">Capability</th>
                  <th className="py-3.5 px-5 text-left text-[0.70rem] font-bold text-white uppercase tracking-wide" style={{ background:'rgba(255,255,255,0.07)' }}>Mirai</th>
                  <th className="py-3.5 px-5 text-left text-[0.70rem] font-bold text-white/55 tracking-wide uppercase">RoboDK</th>
                  <th className="py-3.5 px-5 text-left text-[0.70rem] font-bold text-white/55 tracking-wide uppercase">Webots</th>
                  <th className="py-3.5 px-5 text-left text-[0.70rem] font-bold text-white/55 tracking-wide uppercase">MATLAB</th>
                  <th className="py-3.5 px-5 text-left text-[0.70rem] font-bold text-white/55 tracking-wide uppercase">CoppeliaSim</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r, i) => (
                  <tr key={r.feat} className={`${i < ROWS.length-1 ? 'border-b border-white/6' : ''} hover:bg-white/2 transition-colors`}>
                    <td className="py-3 px-5 text-[0.80rem] text-white/45 font-normal">{r.feat}</td>
                    <td className="py-3 px-5" style={{ background:'rgba(255,255,255,0.04)' }}><Cell v={r.m}/></td>
                    <td className="py-3 px-5"><Cell v={r.d1}/></td>
                    <td className="py-3 px-5"><Cell v={r.d2}/></td>
                    <td className="py-3 px-5"><Cell v={r.d3}/></td>
                    <td className="py-3 px-5"><Cell v={r.d4}/></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>

        {/* 4 diff cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DIFFS.map((d, i) => (
            <Reveal key={d.n} delay={i + 1}>
              <div className="border border-white/8 rounded-2xl p-5 group hover:border-white/16 transition-colors duration-300 h-full"
                   style={{ background:'rgba(255,255,255,0.03)' }}>
                <div className="text-3xl font-black tracking-[-0.06em] text-white/20 mb-3 group-hover:text-white/35 transition-colors">{d.n}</div>
                <div className="text-[0.88rem] font-bold text-white mb-2">{d.title}</div>
                <div className="text-sm text-white/65 leading-relaxed">{d.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
