import { createContext, useContext } from 'react'

import type { Locale, TranslateFn } from '@/i18n/locale'

export type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: TranslateFn
}

export const I18nContext = createContext<I18nContextValue | null>(null)

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}
