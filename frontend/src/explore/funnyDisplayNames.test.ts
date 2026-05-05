import { describe, expect, it, vi } from 'vitest'
import {
  FUNNY_DISPLAY_NAME_SAMPLES,
  pickFunnyDisplayName,
} from '@/explore/funnyDisplayNames'

describe('pickFunnyDisplayName', () => {
  it('returns a string from the samples array', () => {
    const name = pickFunnyDisplayName()
    expect(FUNNY_DISPLAY_NAME_SAMPLES).toContain(name)
  })

  it('returns first item when random returns 0', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    expect(pickFunnyDisplayName()).toBe(FUNNY_DISPLAY_NAME_SAMPLES[0])
    vi.restoreAllMocks()
  })

  it('returns last item when random is just below 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.999)
    expect(pickFunnyDisplayName()).toBe(
      FUNNY_DISPLAY_NAME_SAMPLES[FUNNY_DISPLAY_NAME_SAMPLES.length - 1],
    )
    vi.restoreAllMocks()
  })

  it('never returns empty string', () => {
    for (let i = 0; i < 50; i++) {
      expect(pickFunnyDisplayName().length).toBeGreaterThan(0)
    }
  })
})
