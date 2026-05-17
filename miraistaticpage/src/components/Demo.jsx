import { Reveal } from '../hooks/useScrollReveal.jsx'
import YouTubePlaceholder from './shared/YouTubePlaceholder'
import ImagePlaceholder from './shared/ImagePlaceholder'

const STEPS = [
  { n:'1', title:'Open the URL',          chip:'Design tab',          img:'Arm Designer — 3-segment arm, BOM counter' },
  { n:'2', title:'Browse the library',    chip:'Library tab',         img:'Community Library — task grid' },
  { n:'3', title:'Describe your task to Gemini', chip:'Tasks · Gemini', img:'Task Editor — AI input + ReAct trace' },
  { n:'4', title:'Watch AI Results',      chip:'AI Results',          img:'Confidence %, Physics tab, MuJoCo 94%' },
  { n:'5', title:'Auto-sim at 60fps',     chip:'Simulate tab',        img:'Simulation viewport — path trail' },
  { n:'6', title:'Download + scan QR',    chip:'Export · QR',         img:'Export panel — ZIP + QR code' },
]

export default function Demo() {
  return (
    <section id="demo" className="relative py-32 z-10" style={{ background:'#070707' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal><p className="text-[0.68rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-5">Demo</p></Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-3"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            Physics-verified motion<br/>
            <span style={{ color:'rgba(255,255,255,0.22)' }}>in under 60 seconds.</span>
          </h2>
        </Reveal>
        <Reveal delay={2}>
          <p className="text-white/65 mb-12">
            Live at&nbsp;
            <a href="https://mirai-tech-ex-hackathon-transformin.vercel.app"
               target="_blank" rel="noopener noreferrer"
               className="text-white/70 font-semibold underline underline-offset-2 hover:text-white transition-colors">
              mirai-tech-ex-hackathon-transformin.vercel.app
            </a>
          </p>
        </Reveal>

        {/* YouTube embed — set videoId prop when ready */}
        <Reveal delay={3}>
          <div className="mb-12">
            <YouTubePlaceholder title="Mirai — Full Demo: Design → Voice → Simulate → Export → QR (2 min)" />
          </div>
        </Reveal>

        {/* 6 step cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={(i % 3) + 1}>
              <div className="border border-white/8 rounded-2xl p-5 group hover:border-white/14 transition-all duration-300 h-full flex flex-col"
                   style={{ background:'rgba(255,255,255,0.03)' }}>
                <div className="w-7 h-7 rounded-full bg-white/10 border border-white/14 flex items-center justify-center text-[0.72rem] font-bold text-white/70 mb-3 flex-shrink-0">
                  {s.n}
                </div>
                <div className="text-[0.88rem] font-bold text-white mb-2">{s.title}</div>
                <div className="flex mb-3">
                  <span className="text-[0.62rem] font-semibold text-white/60 border border-white/10 rounded-lg px-2.5 py-1"
                        style={{ background:'rgba(255,255,255,0.04)' }}>{s.chip}</span>
                </div>
                <div className="flex-1">
                  <ImagePlaceholder label={s.img} aspect="16/9" />
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
