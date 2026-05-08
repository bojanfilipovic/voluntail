import { describe, expect, it } from 'vitest'
import { countryIsoFromLatLon } from '@/map/shelterCountryIso'

describe('countryIsoFromLatLon', () => {
  it('matches NL pilot coords', () => {
    expect(countryIsoFromLatLon(52.3629026, 4.7845807)).toBe('NL')
  })

  it('matches HR bbox', () => {
    expect(countryIsoFromLatLon(45.8, 15.98)).toBe('HR')
  })

  it('returns null outside regions', () => {
    expect(countryIsoFromLatLon(1, -150)).toBeNull()
  })
})
