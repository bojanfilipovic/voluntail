import { describe, expect, it } from 'vitest'
import { parseValidatedCoords } from '@/domain/coordinates'

describe('parseValidatedCoords', () => {
  it('accepts valid coordinates', () => {
    const r = parseValidatedCoords('52.3', '5.2')
    expect(r).toEqual({ ok: true, latitude: 52.3, longitude: 5.2 })
  })

  it('rejects non-numeric input', () => {
    const r = parseValidatedCoords('abc', '5')
    expect(r).toEqual({
      ok: false,
      error: 'Latitude and longitude must be valid numbers.',
    })
  })

  it('rejects out-of-range latitude', () => {
    const r = parseValidatedCoords('91', '0')
    expect(r).toEqual({ ok: false, error: 'Coordinates out of range.' })
  })

  it('rejects out-of-range longitude', () => {
    const r = parseValidatedCoords('0', '181')
    expect(r).toEqual({ ok: false, error: 'Coordinates out of range.' })
  })
})
