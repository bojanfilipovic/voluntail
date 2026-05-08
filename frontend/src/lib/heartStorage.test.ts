import { describe, expect, it } from 'vitest'
import { normalizeHeartIdsFromStorage } from '@/lib/heartStorage'

describe('normalizeHeartIdsFromStorage', () => {
  it('returns empty for non-arrays', () => {
    expect(normalizeHeartIdsFromStorage(null)).toEqual([])
    expect(normalizeHeartIdsFromStorage({})).toEqual([])
  })

  it('keeps unique trimmed strings in order', () => {
    expect(
      normalizeHeartIdsFromStorage(['  a ', 'b', 'b', '', 'a', 1, null, 'c']),
    ).toEqual(['a', 'b', 'c'])
  })

  it('handles empty array', () => {
    expect(normalizeHeartIdsFromStorage([])).toEqual([])
  })
})
