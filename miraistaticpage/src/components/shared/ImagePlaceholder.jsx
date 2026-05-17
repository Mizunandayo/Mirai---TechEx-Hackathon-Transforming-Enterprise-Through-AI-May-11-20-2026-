/**
 * Dark-themed ImagePlaceholder.
 * Replace with: <img src="/screenshots/file.png" className="w-full rounded-xl" />
 */
export default function ImagePlaceholder({ label = 'Screenshot', aspect = '16/9', className = '' }) {
  return (
    <div
      className={`w-full rounded-xl border border-dashed border-white/12 bg-white/3 flex flex-col items-center justify-center gap-2.5 ${className}`}
      style={{ aspectRatio: aspect }}
    >
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" opacity="0.3">
        <rect x="2" y="6" width="28" height="20" rx="3" stroke="white" strokeWidth="1.4"/>
        <circle cx="12" cy="16" r="4.5" stroke="white" strokeWidth="1.4"/>
        <path d="M2 22l7-7 5 5 5-7 7 9" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className="text-center">
        <p className="text-[0.70rem] font-semibold text-white/30">{label}</p>
        <p className="text-[0.62rem] text-white/18 mt-0.5">Drop into <code className="font-mono">public/screenshots/</code></p>
      </div>
    </div>
  )
}
