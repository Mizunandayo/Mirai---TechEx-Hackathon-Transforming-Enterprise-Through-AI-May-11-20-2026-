/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'system-ui', 'sans-serif'],
        mono:    ['"SF Mono"', '"Cascadia Code"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      colors: {
        surface:  'rgba(255,255,255,0.04)',
        surface2: 'rgba(255,255,255,0.07)',
        border1:  'rgba(255,255,255,0.08)',
        border2:  'rgba(255,255,255,0.14)',
      },
      animation: {
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-dot': 'pulseDot 2.2s ease-in-out infinite',
      },
      keyframes: {
        fadeUp:   { from:{ opacity:'0', transform:'translateY(22px)' }, to:{ opacity:'1', transform:'translateY(0)' } },
        pulseDot: { '0%,100%':{ opacity:'1' }, '50%':{ opacity:'0.3' } },
      },
    },
  },
  plugins: [],
}
