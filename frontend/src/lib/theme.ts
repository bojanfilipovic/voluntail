const STORAGE_KEY = 'voluntail.theme'

export type ThemeValue = 'light' | 'dark' | 'system'

export function getStoredTheme(): ThemeValue {
  try {
    const v = localStorage.getItem(STORAGE_KEY)
    if (v === 'light' || v === 'dark' || v === 'system') return v
  } catch { /* ignore */ }
  return 'system'
}

export function setStoredTheme(value: ThemeValue): void {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch { /* ignore */ }
}

export function resolveTheme(value: ThemeValue): 'light' | 'dark' {
  if (value === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return value
}

export function applyThemeClass(resolved: 'light' | 'dark'): void {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}
