import type { MessageKey } from '@/i18n/nl'

const LANG_QUERY_KEYS = ['lang', 'locale'] as const

export const LOCALE_STORAGE_KEY = 'voluntail.locale'

export type Locale = 'nl' | 'en'

export const DEFAULT_LOCALE: Locale = 'nl'

export const SUPPORTED_LOCALES: readonly Locale[] = ['nl', 'en']

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'nl' || value === 'en'
}

/** Read `?lang=` / `?locale=` once; returns normalized locale or null if absent/invalid. */
export function readLocaleFromLocationSearch(search: string): Locale | null {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  for (const key of LANG_QUERY_KEYS) {
    const raw = params.get(key)?.trim().toLowerCase()
    if (raw === 'nl' || raw === 'en') return raw
  }
  return null
}

/** Strip lang/locale params from search string for a cleaner URL after bootstrap. */
export function stripLocaleParamsFromSearch(search: string): string {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  for (const key of LANG_QUERY_KEYS) params.delete(key)
  const q = params.toString()
  return q ? `?${q}` : ''
}

export function readStoredLocale(): Locale | null {
  try {
    const raw = localStorage.getItem(LOCALE_STORAGE_KEY)?.trim().toLowerCase()
    return isLocale(raw) ? raw : null
  } catch {
    return null
  }
}

export function writeStoredLocale(locale: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale)
  } catch {
    /* noop */
  }
}

export function formatMessage(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const v = vars[key]
    return v !== undefined && v !== null ? String(v) : ''
  })
}

export type TranslateFn = (key: MessageKey, vars?: Record<string, string | number>) => string
