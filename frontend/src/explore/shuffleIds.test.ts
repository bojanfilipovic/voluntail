import { describe, expect, it, vi } from 'vitest'
import { shuffleIdsInPlace } from '@/explore/shuffleIds'

describe('shuffleIdsInPlace', () => {
  it('is deterministic with a fixed random function', () => {
    const rand = vi
      .fn<() => number>()
      .mockReturnValueOnce(0)
      .mockReturnValueOnce(0)
    // Fisher–Yates: swap toward index 0 twice
    expect(shuffleIdsInPlace(['a', 'b', 'c'], rand)).toEqual(['b', 'c', 'a'])
  })

  it('returns same length and preserves multiset of ids', () => {
    const r = () => 0.5
    const out = shuffleIdsInPlace(['x', 'y', 'z', 'x'], r)
    expect(out).toHaveLength(4)
    expect([...out].sort()).toEqual(['x', 'x', 'y', 'z'])
  })
})
