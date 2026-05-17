import { Reveal } from '../hooks/useScrollReveal.jsx'

const CARDS = [
  { big:'$2,500+', unit:'/ year', title:'RoboDK or MATLAB Robotics', sub:'Desktop-only. Corporate pricing.' },
  { big:'30',      unit:'min',   title:'Minimum setup time',         sub:'Before a single joint moves.' },
  { big:'0',       unit:'',      title:'Simulators with real code export', sub:'No bridge to actual hardware.' },
]

export default function Problem() {
  return (
    <section id="problem" className="relative py-32 z-10" style={{ background:'#070707' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal>
          <p className="text-[0.76rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-5">
            The Problem
          </p>
        </Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-16"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            Robotics is powerful.<br/>
            <span style={{ color:'rgba(255,255,255,0.22)' }}>But locked behind expertise.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.big + c.title} delay={i + 1}>
              <div className="border border-white/8 rounded-2xl p-8 relative overflow-hidden group hover:border-white/16 transition-colors duration-300"
                   style={{ background:'rgba(255,255,255,0.03)' }}>
                {/* Subtle hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
                     style={{ background:'radial-gradient(ellipse at 30% 30%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />
                <div className="relative z-10">
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="font-black tracking-[-0.06em] leading-none text-white num-display"
                          style={{ fontSize:'clamp(3rem,6vw,5rem)' }}>{c.big}</span>
                    {c.unit && <span className="text-white/35 font-bold text-xl">{c.unit}</span>}
                  </div>
                  <div className="text-[0.92rem] font-bold text-white/80 mb-1.5">{c.title}</div>
                  <div className="text-[0.78rem] text-white/38 font-medium">{c.sub}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
