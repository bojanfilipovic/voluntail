import { describe, expect, it } from 'vitest'
import {
  boundsFromShelters,
  shelterGeometryKey,
  type LngLatBounds,
} from '@/map/shelterBounds'
import type { Shelter } from '@/schemas/shelters'

function shelter(partial: Partial<Shelter> & Pick<Shelter, 'id'>): Shelter {
  return {
    name: 'S',
    description: '',
    latitude: 0,
    longitude: 0,
    species: [],
    city: '',
    ...partial,
  }
}

describe('shelterGeometryKey', () => {
  it('is stable for same shelters in different order', () => {
    const a = shelter({
      id: 'a',
      latitude: 52.1,
      longitude: 5.1,
    })
    const b = shelter({
      id: 'b',
      latitude: 45.8,
      longitude: 15.9,
    })
    expect(shelterGeometryKey([a, b])).toBe(shelterGeometryKey([b, a]))
  })

  it('changes when coordinates change', () => {
    const a = shelter({ id: 'a', latitude: 1, longitude: 2 })
    const b = shelter({ id: 'a', latitude: 1.000001, longitude: 2 })
    expect(shelterGeometryKey([a])).not.toBe(shelterGeometryKey([b]))
  })

  it('ignores invalid coordinates', () => {
    const x = shelter({ id: 'x', latitude: NaN, longitude: 0 })
    expect(shelterGeometryKey([x])).toBe('')
  })
})

describe('boundsFromShelters', () => {
  it('returns null for empty or invalid-only', () => {
    expect(boundsFromShelters([])).toBeNull()
    expect(boundsFromShelters([shelter({ id: 'x', latitude: NaN, longitude: 0 })])).toBeNull()
  })

  it('expands a single point', () => {
    const b = boundsFromShelters([shelter({ id: 'a', latitude: 40, longitude: -3 })])
    expect(b).not.toBeNull()
    const [[w, s], [e, n]] = b as LngLatBounds
    expect(e - w).toBeGreaterThan(0)
    expect(n - s).toBeGreaterThan(0)
  })

  it('contains both points for NL–HR scale', () => {
    const nl = shelter({ id: 'nl', latitude: 52.37, longitude: 4.9 })
    const hr = shelter({ id: 'hr', latitude: 45.0, longitude: 14.0 })
    const b = boundsFromShelters([nl, hr])
    expect(b).not.toBeNull()
    const [[w, s], [e, n]] = b as LngLatBounds
    expect(w).toBeLessThanOrEqual(4.9)
    expect(e).toBeGreaterThanOrEqual(4.9)
    expect(s).toBeLessThanOrEqual(45.0)
    expect(n).toBeGreaterThanOrEqual(45.0)
  })
})
