/**
 * YouTubePlaceholder — shows an embedded YouTube video or a styled placeholder.
 *
 * Usage with a real video ID:
 *   <YouTubePlaceholder videoId="dQw4w9WgXcQ" title="Mirai Demo" />
 *
 * Usage as placeholder (no video yet):
 *   <YouTubePlaceholder title="Full demo walkthrough" />
 *
 * To add your video: set the videoId prop to your YouTube video ID.
 * The video ID is the part after "?v=" in the YouTube URL.
 */
export default function YouTubePlaceholder({ videoId, title = 'Demo video', className = '' }) {
  if (videoId) {
    return (
      <div
        className={`w-full rounded-2xl overflow-hidden shadow-lg ${className}`}
        style={{ aspectRatio: '16/9' }}
      >
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    )
  }

  return (
    <div
      className={`w-full rounded-2xl bg-[#0d0d0d] flex flex-col items-center justify-center gap-4 cursor-pointer group ${className}`}
      style={{ aspectRatio: '16/9' }}
    >
      {/* YouTube-style play button */}
      <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:bg-white/18 transition-colors duration-200">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
          <polygon points="5,3 19,12 5,21" />
        </svg>
      </div>
      <div className="text-center px-6">
        <p className="text-white font-semibold text-sm">{title}</p>
        <p className="text-white/40 text-xs mt-1.5">
          Demo video coming soon &nbsp;·&nbsp; Set <code className="font-mono text-white/30">videoId</code> prop to embed
        </p>
      </div>
      {/* Corner label */}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/8 border border-white/10 rounded-lg px-3 py-1.5">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.4 31.4 0 0 0 0 12a31.4 31.4 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.4 31.4 0 0 0 24 12a31.4 31.4 0 0 0-.5-5.8z"/>
          <polygon points="9.7,15.5 15.8,12 9.7,8.5" fill="white"/>
        </svg>
        <span className="text-white/50 text-xs font-medium">YouTube</span>
      </div>
    </div>
  )
}
