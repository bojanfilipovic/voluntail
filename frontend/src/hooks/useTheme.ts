import { useState, useEffect, useCallback } from 'react'
import {
  getStoredTheme,
  setStoredTheme,
  resolveTheme,
  applyThemeClass,
  type ThemeValue,
} from '@/lib/theme'

export function useTheme() {
  const [theme, setTheme] = useState<ThemeValue>(getStoredTheme)
  const resolved = resolveTheme(theme)

  useEffect(() => {
    applyThemeClass(resolved)
  }, [resolved])

  // Listen for system preference changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyThemeClass(resolveTheme('system'))
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  const cycleTheme = useCallback(() => {
    setTheme((prev) => {
      const next: ThemeValue =
        prev === 'system' ? 'light' : prev === 'light' ? 'dark' : 'system'
      setStoredTheme(next)
      return next
    })
  }, [])

  return { theme, resolved, cycleTheme }
}
