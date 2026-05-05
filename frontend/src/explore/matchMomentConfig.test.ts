import { describe, expect, it, vi } from 'vitest'
import {
  MATCH_MOMENT_PROBABILITY,
  RARE_MATCH_PROBABILITY,
  rollMatchMoment,
  rollRareMatch,
} from '@/explore/matchMomentConfig'

describe('rollMatchMoment', () => {
  it('returns true when random is below threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(MATCH_MOMENT_PROBABILITY - 0.01)
    expect(rollMatchMoment()).toBe(true)
    vi.restoreAllMocks()
  })

  it('returns false when random is at threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(MATCH_MOMENT_PROBABILITY)
    expect(rollMatchMoment()).toBe(false)
    vi.restoreAllMocks()
  })

  it('returns false when random is above threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99)
    expect(rollMatchMoment()).toBe(false)
    vi.restoreAllMocks()
  })
})

describe('rollRareMatch', () => {
  it('returns true when random is below rare threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(RARE_MATCH_PROBABILITY - 0.01)
    expect(rollRareMatch()).toBe(true)
    vi.restoreAllMocks()
  })

  it('returns false when random is at rare threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(RARE_MATCH_PROBABILITY)
    expect(rollRareMatch()).toBe(false)
    vi.restoreAllMocks()
  })

  it('returns false when random is well above rare threshold', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.5)
    expect(rollRareMatch()).toBe(false)
    vi.restoreAllMocks()
  })
})
