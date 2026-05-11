import { describe, expect, it } from 'vitest'

import {
  formatMessage,
  readLocaleFromLocationSearch,
  stripLocaleParamsFromSearch,
} from '@/i18n/locale'

describe('i18n locale helpers', () => {
  it('readLocaleFromLocationSearch parses lang and locale query keys', () => {
    expect(readLocaleFromLocationSearch('?lang=en')).toBe('en')
    expect(readLocaleFromLocationSearch('?locale=nl')).toBe('nl')
    expect(readLocaleFromLocationSearch('?lang=EN')).toBe('en')
    expect(readLocaleFromLocationSearch('?lang=fr')).toBeNull()
    expect(readLocaleFromLocationSearch('')).toBeNull()
  })

  it('stripLocaleParamsFromSearch removes lang/locale', () => {
    expect(stripLocaleParamsFromSearch('?lang=en&view=explore')).toBe('?view=explore')
    expect(stripLocaleParamsFromSearch('?locale=nl')).toBe('')
  })

  it('formatMessage interpolates placeholders', () => {
    expect(formatMessage('Hello {{name}}', { name: 'Ada' })).toBe('Hello Ada')
  })
})
