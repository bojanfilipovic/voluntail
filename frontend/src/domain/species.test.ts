import { describe, expect, it } from 'vitest'
import {
  isOtherSpecies,
  OTHER_SPECIES,
  PRIMARY_SPECIES,
  SPECIES_VALUES,
  type ShelterSpecies,
} from '@/domain/species'

describe('species grouping constants', () => {
  it('PRIMARY_SPECIES + OTHER_SPECIES covers all SPECIES_VALUES', () => {
    const combined = [...PRIMARY_SPECIES, ...OTHER_SPECIES].sort()
    const all = [...SPECIES_VALUES].sort()
    expect(combined).toEqual(all)
  })

  it('PRIMARY_SPECIES and OTHER_SPECIES do not overlap', () => {
    const overlap = PRIMARY_SPECIES.filter((sp) =>
      (OTHER_SPECIES as readonly string[]).includes(sp),
    )
    expect(overlap).toEqual([])
  })

  it('PRIMARY_SPECIES contains the expected pilot species', () => {
    expect(PRIMARY_SPECIES).toEqual(['dog', 'cat', 'rabbit', 'reptile'])
  })

  it('OTHER_SPECIES contains the remaining species', () => {
    expect(OTHER_SPECIES).toEqual(['rodent', 'amphibian', 'wildlife', 'arachnid'])
  })
})

describe('isOtherSpecies', () => {
  it.each(OTHER_SPECIES)('returns true for %s', (sp) => {
    expect(isOtherSpecies(sp)).toBe(true)
  })

  it.each(PRIMARY_SPECIES)('returns false for %s', (sp) => {
    expect(isOtherSpecies(sp)).toBe(false)
  })

  it('correctly classifies all known species', () => {
    const results = SPECIES_VALUES.map((sp) => [sp, isOtherSpecies(sp)] as const)
    const others = results.filter(([, v]) => v).map(([sp]) => sp)
    const primaries = results.filter(([, v]) => !v).map(([sp]) => sp)
    expect(others).toEqual(OTHER_SPECIES)
    expect(primaries).toEqual(PRIMARY_SPECIES)
  })
})
