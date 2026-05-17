import { Reveal } from '../hooks/useScrollReveal.jsx'

const SEGS = [
  { label:'Primary',   big:'2M+',  title:'Makers & Students',       desc:'Can\'t afford RoboDK or wait for lab time. Mirai is free, in their browser, right now.', dark:true },
  { label:'Secondary', big:'5K+',  title:'Robotics Startups',       desc:'Rapid arm prototyping before committing to a $200K industrial unit. Hours, not weeks.', dark:false },
  { label:'Tertiary',  big:'$18B', title:'Enterprise Training',     desc:'Train operators on robot tasks before buying equipment. Voice input, no ROS needed.', dark:false },
]

export default function Market() {
  return (
    <section id="market" className="relative py-32 z-10" style={{ background:'#050505' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal><p className="text-[0.68rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-5">Target Market</p></Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-14"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            Three underserved markets.<br/>
            <span style={{ color:'rgba(255,255,255,0.22)' }}>One product.</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {SEGS.map((s, i) => (
            <Reveal key={s.big} delay={i + 1}>
              <div className={`rounded-2xl p-8 h-full group transition-all duration-300 ${
                s.dark
                  ? 'bg-white border border-white hover:bg-white/92'
                  : 'border border-white/8 hover:border-white/16'
              }`}
                   style={!s.dark ? { background:'rgba(255,255,255,0.03)' } : {}}>
                <div className={`text-xs font-bold tracking-[0.10em] uppercase mb-4 ${s.dark ? 'text-black/35' : 'text-white/55'}`}>{s.label}</div>
                <div className={`font-black tracking-[-0.07em] leading-none mb-4 num-display ${s.dark ? 'text-black' : 'text-white'}`}
                     style={{ fontSize:'clamp(3rem,6vw,5rem)' }}>{s.big}</div>
                <div className={`text-[0.92rem] font-bold mb-2 ${s.dark ? 'text-black' : 'text-white'}`}>{s.title}</div>
                <div className={`text-[0.78rem] leading-relaxed ${s.dark ? 'text-black/55' : 'text-white/65'}`}>{s.desc}</div>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Value prop — single bold statement */}
        <Reveal delay={3}>
          <div className="border border-white/8 rounded-2xl p-10 relative overflow-hidden"
               style={{ background:'rgba(255,255,255,0.02)' }}>
            <div className="absolute inset-0 pointer-events-none"
                 style={{ background:'radial-gradient(ellipse 50% 60% at 0% 50%, rgba(255,255,255,0.03) 0%, transparent 70%)' }} />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 items-center">
              <div>
                <div className="text-xs font-bold tracking-[0.10em] uppercase text-white/55 mb-4">Value Proposition</div>
                <blockquote className="font-black tracking-[-0.03em] text-white leading-[1.15]"
                            style={{ fontSize:'clamp(1.4rem,2.8vw,2rem)' }}>
                  "The robotics simulator that meets you where you are."
                </blockquote>
              </div>
              <div className="flex flex-col gap-3.5">
                {[
                  { who:'Students',    txt:'Learn robotics in your browser in 30 minutes, not the 3 months ROS requires.' },
                  { who:'Makers',      txt:'Design, simulate, build a verified arm for under $300 — code and parts already in hand.' },
                  { who:'Enterprises', txt:'Train teams on robot operations before buying physical equipment.' },
                ].map(v => (
                  <div key={v.who} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-white/40 flex-shrink-0 mt-2.5" />
                    <div className="text-[0.82rem] text-white/55 leading-relaxed">
                      <span className="text-white font-bold">{v.who}: </span>{v.txt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>

      </div>
    </section>
  )
}
