import { Reveal } from '../hooks/useScrollReveal.jsx'

export default function CTA() {
  return (
    <section className="relative py-32 z-10 overflow-hidden" style={{ background:'#050505' }}>
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none"
           style={{ background:'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(255,255,255,0.04) 0%, transparent 70%)' }} />

      <div className="max-w-[1100px] mx-auto px-8 relative z-10">

        {/* Main CTA block */}
        <Reveal>
          <div className="border border-white/10 rounded-3xl px-12 py-20 text-center relative overflow-hidden mb-12"
               style={{ background:'rgba(255,255,255,0.03)' }}>
            {/* Inner glow */}
            <div className="absolute inset-0 pointer-events-none rounded-3xl"
                 style={{ background:'radial-gradient(ellipse 55% 40% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 70%)' }} />
            <div className="relative z-10">
              <p className="text-[0.65rem] font-bold tracking-[0.14em] uppercase text-white/55 mb-6">
                Transforming Enterprise Through AI · lablab.ai · Track 3 + Gemini Award
              </p>
              <h2 className="font-black tracking-[-0.05em] text-white leading-[0.95] mb-6"
                  style={{ fontSize:'clamp(3rem,7vw,6rem)' }}>
                The future of robotics<br/>is a browser tab.
              </h2>
              <p className="text-white/65 mb-10 max-w-md mx-auto leading-relaxed">
                Speak a task. Watch physics prove it works. Download the code and build it for real.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <a href="https://mirai-tech-ex-hackathon-transformin.vercel.app"
                   target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-sm font-bold text-black bg-white px-8 py-4 rounded-xl no-underline hover:opacity-88 hover:-translate-y-0.5 transition-all duration-150">
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,2 13,8 3,14"/></svg>
                  Try Live Demo
                </a>
                <a href="https://github.com/Mizunandayo/mirai"
                   target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 text-sm font-medium text-white/65 border border-white/16 px-8 py-4 rounded-xl no-underline hover:text-white hover:border-white/32 hover:-translate-y-0.5 transition-all duration-150"
                   style={{ background:'rgba(255,255,255,0.04)' }}>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/></svg>
                  View Source
                </a>
              </div>
            </div>
          </div>
        </Reveal>

        {/* Footer */}
        <Reveal delay={2}>
          <footer className="flex items-center justify-between flex-wrap gap-3 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.08)' }}>
            <span className="text-sm font-bold tracking-[0.16em] uppercase text-white/70">ミライ MIRAI</span>
            <span className="text-xs font-medium text-white/50">
              Built by Francis Daniel (Mizu) · Solo · May 11–19, 2026 · lablab.ai
            </span>
            <div className="flex gap-5">
              {[
                { label:'Live Demo', href:'https://mirai-tech-ex-hackathon-transformin.vercel.app' },
                { label:'GitHub',   href:'https://github.com/Mizunandayo/mirai' },
                { label:'API',      href:'https://mirai-techex-hackathon-transforming-enterprise-production.up.railway.app/health' },
              ].map(l => (
                <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                   className="text-xs font-medium text-white/55 hover:text-white/70 no-underline transition-colors duration-150">
                  {l.label}
                </a>
              ))}
            </div>
          </footer>
        </Reveal>

      </div>
    </section>
  )
}
