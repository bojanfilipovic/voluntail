import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import { I18nContext } from '@/i18n/I18nContext'
import { enMessages } from '@/i18n/en'
import {
  DEFAULT_LOCALE,
  formatMessage,
  readLocaleFromLocationSearch,
  readStoredLocale,
  stripLocaleParamsFromSearch,
  writeStoredLocale,
  type Locale,
  type TranslateFn,
} from '@/i18n/locale'
import { nlMessages, type MessageKey } from '@/i18n/nl'

const DICTS: Record<Locale, Record<MessageKey, string>> = {
  nl: nlMessages,
  en: enMessages,
}

type Props = { children: ReactNode }

export function I18nProvider({ children }: Props) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const fromUrl =
      typeof window !== 'undefined'
        ? readLocaleFromLocationSearch(window.location.search)
        : null
    if (fromUrl) return fromUrl
    const stored = typeof window !== 'undefined' ? readStoredLocale() : null
    return stored ?? DEFAULT_LOCALE
  })

  useLayoutEffect(() => {
    const fromUrl = readLocaleFromLocationSearch(window.location.search)
    if (!fromUrl) return
    writeStoredLocale(fromUrl)
    const nextSearch = stripLocaleParamsFromSearch(window.location.search)
    const next =
      `${window.location.pathname}${nextSearch}${window.location.hash}`
    window.history.replaceState(null, '', next)
  }, [])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    writeStoredLocale(next)
  }, [])

  const t = useCallback<TranslateFn>(
    (key, vars) => {
      const dict = DICTS[locale]
      const raw = dict[key] ?? DICTS.nl[key] ?? key
      return formatMessage(raw, vars)
    },
    [locale],
  )

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
