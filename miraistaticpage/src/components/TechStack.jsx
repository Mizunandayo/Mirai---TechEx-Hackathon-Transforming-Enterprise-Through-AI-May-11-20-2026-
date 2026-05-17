import { Reveal } from '../hooks/useScrollReveal.jsx'

const CDN = ({ slug, color, alt }) => (
  <img src={`https://cdn.simpleicons.org/${slug}/${color}`} width={20} height={20} alt={alt} loading="lazy" style={{ objectFit:'contain' }} />
)

const RapierIcon = () => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M13 2L4 13h7l-2 7 9-11h-7l2-7z" fill="#e8534a"/></svg>
const MuJoCoIcon = () => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3.5" stroke="#60a5fa" strokeWidth="1.4"/><path d="M11 2v2.5M11 17.5V20M2 11h2.5M17.5 11H20M4.6 4.6l1.8 1.8M15.6 15.6l1.8 1.8M4.6 17.4l1.8-1.8M15.6 6.4l1.8-1.8" stroke="#60a5fa" strokeWidth="1.4" strokeLinecap="round"/></svg>
const JotaiIcon  = () => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="3" fill="white"/><ellipse cx="11" cy="11" rx="8.5" ry="3.5" stroke="white" strokeWidth="1.2" fill="none"/><ellipse cx="11" cy="11" rx="8.5" ry="3.5" stroke="white" strokeWidth="1.2" fill="none" transform="rotate(60 11 11)"/><ellipse cx="11" cy="11" rx="8.5" ry="3.5" stroke="white" strokeWidth="1.2" fill="none" transform="rotate(120 11 11)"/></svg>
const FlowIcon   = () => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="4" cy="4" r="2.5" stroke="#FF0072" strokeWidth="1.3"/><circle cx="18" cy="4" r="2.5" stroke="#FF0072" strokeWidth="1.3"/><circle cx="11" cy="18" r="2.5" stroke="#FF0072" strokeWidth="1.3"/><line x1="6.5" y1="4" x2="15.5" y2="4" stroke="#FF0072" strokeWidth="1.1"/><line x1="4" y1="6.5" x2="11" y2="15.5" stroke="#FF0072" strokeWidth="1.1"/><line x1="18" y1="6.5" x2="11" y2="15.5" stroke="#FF0072" strokeWidth="1.1"/></svg>
const WSIcon     = () => <svg width="20" height="20" viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8.5" stroke="white" strokeWidth="1.3"/><path d="M7 11h8M11 7l4 4-4 4" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
const GemStar    = ({ c='#4285F4' }) => <svg width="20" height="20" viewBox="0 0 24 24" fill={c}><path d="M12 24C12 18.053 7.947 14 2 14c5.947 0 10-4.053 10-10 0 5.947 4.053 10 10 10-5.947 0-10 4.053-10 10z"/></svg>

const CATS = [
  { label:'Core Languages', items:[
    { name:'TypeScript',  icon:<CDN slug="typescript" color="3178C6" alt="TypeScript"/> },
    { name:'Python',      icon:<CDN slug="python"     color="3776AB" alt="Python"/> },
    { name:'JavaScript',  icon:<CDN slug="javascript" color="F7DF1E" alt="JavaScript"/> },
    { name:'HTML5',       icon:<CDN slug="html5"      color="E34F26" alt="HTML5"/> },
    { name:'CSS3',        icon:<CDN slug="css3"       color="1572B6" alt="CSS3"/> },
  ]},
  { label:'Frontend & Framework', items:[
    { name:'React 18',       icon:<CDN slug="react"       color="61DAFB" alt="React"/> },
    { name:'Vite 7',         icon:<CDN slug="vite"        color="646CFF" alt="Vite"/> },
    { name:'Three.js',       icon:<CDN slug="threedotjs"  color="ffffff" alt="Three.js"/> },
    { name:'TailwindCSS',    icon:<CDN slug="tailwindcss" color="06B6D4" alt="TailwindCSS"/> },
    { name:'Framer Motion',  icon:<CDN slug="framer"      color="0055FF" alt="Framer"/> },
    { name:'Jotai',          icon:<JotaiIcon/> },
    { name:'React Flow',     icon:<FlowIcon/> },
    { name:'Tauri v2',       icon:<CDN slug="tauri"       color="FFC131" alt="Tauri"/> },
  ]},
  { label:'Physics & Simulation', items:[
    { name:'Rapier WASM', icon:<RapierIcon/> },
    { name:'MuJoCo 3.x',  icon:<MuJoCoIcon/> },
    { name:'WebAssembly', icon:<CDN slug="webassembly"  color="654FF0" alt="WebAssembly"/> },
  ]},
  { label:'AI & APIs', items:[
    { name:'Gemini 2.5 Flash', icon:<GemStar c="#4285F4"/> },
    { name:'Gemini 2.0 Pro',   icon:<GemStar c="#8E75B2"/> },
    { name:'Google AI Studio', icon:<CDN slug="google"    color="4285F4" alt="Google"/> },
  ]},
  { label:'Backend & Data', items:[
    { name:'FastAPI',   icon:<CDN slug="fastapi" color="009688" alt="FastAPI"/> },
    { name:'SQLite',    icon:<CDN slug="sqlite"  color="003B57" alt="SQLite"/> },
    { name:'WebSocket', icon:<WSIcon/> },
    { name:'Jinja2',    icon:<svg width="20" height="20" viewBox="0 0 22 22" fill="none"><path d="M3 6h16M3 11h10M3 16h13" stroke="#B41717" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 8l4 4-4 4" stroke="#B41717" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  ]},
  { label:'Infrastructure', items:[
    { name:'Docker',  icon:<CDN slug="docker"  color="2496ED" alt="Docker"/> },
    { name:'Vercel',  icon:<CDN slug="vercel"  color="ffffff" alt="Vercel"/> },
    { name:'Railway', icon:<CDN slug="railway" color="c8c8c8" alt="Railway"/> },
    { name:'Arduino', icon:<CDN slug="arduino" color="00979D" alt="Arduino"/> },
    { name:'GitHub',  icon:<CDN slug="github"  color="ffffff" alt="GitHub"/> },
  ]},
]

export default function TechStack() {
  return (
    <section id="techstack" className="relative py-32 z-10" style={{ background:'#070707' }}>
      <div className="max-w-[1100px] mx-auto px-8">

        <Reveal><p className="text-[0.68rem] font-bold tracking-[0.12em] uppercase text-white/55 mb-5">Tech Stack</p></Reveal>
        <Reveal delay={1}>
          <h2 className="font-black tracking-[-0.04em] leading-none text-white mb-14"
              style={{ fontSize:'clamp(2.4rem,5vw,4rem)' }}>
            32 technologies.<br/>
            <span style={{ color:'rgba(255,255,255,0.22)' }}>One browser tab.</span>
          </h2>
        </Reveal>

        <div className="flex flex-col gap-3">
          {CATS.map((cat, ci) => (
            <Reveal key={cat.label} delay={(ci % 3) + 1}>
              <div className="border border-white/8 rounded-2xl px-6 py-5 hover:border-white/12 transition-colors duration-300"
                   style={{ background:'rgba(255,255,255,0.02)' }}>
                <div className="text-[0.65rem] font-bold tracking-[0.10em] uppercase text-white/55 mb-4">{cat.label}</div>
                <div className="flex flex-wrap gap-2">
                  {cat.items.map(item => (
                    <div key={item.name}
                         className="flex items-center gap-2 border border-white/8 rounded-xl px-3 py-2 hover:border-white/18 hover:bg-white/4 transition-all duration-150"
                         style={{ background:'rgba(255,255,255,0.03)' }}>
                      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                      <span className="text-[0.76rem] font-semibold text-white/85 whitespace-nowrap">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>

      </div>
    </section>
  )
}
