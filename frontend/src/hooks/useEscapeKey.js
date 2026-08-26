import { useEffect } from 'react'

export function useEscapeKey(enabled, onEscape) {
  useEffect(() => {
    if (!enabled) return undefined
    const handler = (e) => {
      if (e.key === 'Escape') onEscape()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [enabled, onEscape])
}
