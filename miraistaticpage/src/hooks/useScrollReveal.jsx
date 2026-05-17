import { useEffect, useRef, useState } from 'react'

/**
 * Triggers a CSS "visible" class when the element enters the viewport.
 * Pair with the `.reveal` CSS class in index.css.
 */
export function useScrollReveal(threshold = 0.07) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          obs.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])

  return { ref, visible }
}

/** Convenience component wrapper */
export function Reveal({ children, delay = 0, className = '' }) {
  const { ref, visible } = useScrollReveal()
  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'visible' : ''} ${delay ? `reveal-d${delay}` : ''} ${className}`}
    >
      {children}
    </div>
  )
}
