import { describe, expect, it } from 'vitest'
import {
  isOtherSpecies,
  OTHER_SPECIES,
  PRIMARY_SPECIES,
  SPECIES_VALUES,
  type ShelterSpecies,
} from '@/domain/species'
import type { SpeciesFilterRow } from '@/components/SpeciesFilterBar'

/**
 * Reproduces the grouped-filter-row computation from App.tsx
 * so it can be tested in isolation.
 */
function buildGroupedShelterFilters(
  shelters: { species: ShelterSpecies[] }[],
): SpeciesFilterRow[] {
  const counts = Object.fromEntries(
    SPECIES_VALUES.map((sp) => [sp, 0]),
  ) as Record<ShelterSpecies, number>
  for (const s of shelters) {
    for (const sp of s.species) {
      counts[sp] += 1
    }
  }
  const rows: SpeciesFilterRow[] = PRIMARY_SPECIES.map((species) => ({
    kind: 'single',
    species,
    count: counts[species],
  }))
  const othersCount = OTHER_SPECIES.reduce((sum, sp) => sum + counts[sp], 0)
  rows.push({ kind: 'group', key: 'others', label: 'Others', count: othersCount })
  return rows
}

function buildGroupedAnimalFilters(
  animals: { species: ShelterSpecies }[],
): SpeciesFilterRow[] {
  const counts = Object.fromEntries(
    SPECIES_VALUES.map((sp) => [sp, 0]),
  ) as Record<ShelterSpecies, number>
  for (const a of animals) {
    counts[a.species] += 1
  }
  const rows: SpeciesFilterRow[] = PRIMARY_SPECIES.map((species) => ({
    kind: 'single',
    species,
    count: counts[species],
  }))
  const othersCount = OTHER_SPECIES.reduce((sum, sp) => sum + counts[sp], 0)
  rows.push({ kind: 'group', key: 'others', label: 'Others', count: othersCount })
  return rows
}

/**
 * Reproduces the shelter filtering logic from App.tsx.
 */
function filterShelters(
  shelters: { species: ShelterSpecies[] }[],
  filter: ShelterSpecies | 'others' | null,
) {
  if (!filter) return shelters
  if (filter === 'others') return shelters.filter((s) => s.species.some(isOtherSpecies))
  return shelters.filter((s) => s.species.includes(filter))
}

function filterAnimals(
  animals: { species: ShelterSpecies }[],
  filter: ShelterSpecies | 'others' | null,
) {
  if (!filter) return animals
  if (filter === 'others') return animals.filter((a) => isOtherSpecies(a.species))
  return animals.filter((a) => a.species === filter)
}

describe('buildGroupedShelterFilters', () => {
  it('returns 5 rows (4 primary + 1 others)', () => {
    const rows = buildGroupedShelterFilters([])
    expect(rows).toHaveLength(5)
    expect(rows[0]).toEqual({ kind: 'single', species: 'dog', count: 0 })
    expect(rows[4]).toEqual({ kind: 'group', key: 'others', label: 'Others', count: 0 })
  })

  it('counts primary species individually', () => {
    const shelters = [
      { species: ['dog', 'cat'] as ShelterSpecies[] },
      { species: ['dog', 'rabbit'] as ShelterSpecies[] },
      { species: ['reptile'] as ShelterSpecies[] },
    ]
    const rows = buildGroupedShelterFilters(shelters)
    expect(rows[0]).toMatchObject({ species: 'dog', count: 2 })
    expect(rows[1]).toMatchObject({ species: 'cat', count: 1 })
    expect(rows[2]).toMatchObject({ species: 'rabbit', count: 1 })
    expect(rows[3]).toMatchObject({ species: 'reptile', count: 1 })
  })

  it('aggregates other species into a single count', () => {
    const shelters = [
      { species: ['rodent', 'amphibian'] as ShelterSpecies[] },
      { species: ['wildlife'] as ShelterSpecies[] },
      { species: ['arachnid', 'dog'] as ShelterSpecies[] },
    ]
    const rows = buildGroupedShelterFilters(shelters)
    const othersRow = rows.find((r) => r.kind === 'group')!
    // rodent:1 + amphibian:1 + wildlife:1 + arachnid:1 = 4
    expect(othersRow.count).toBe(4)
    expect(rows[0]).toMatchObject({ species: 'dog', count: 1 })
  })
})

describe('buildGroupedAnimalFilters', () => {
  it('returns 5 rows (4 primary + 1 others)', () => {
    const rows = buildGroupedAnimalFilters([])
    expect(rows).toHaveLength(5)
  })

  it('counts animals correctly per group', () => {
    const animals: { species: ShelterSpecies }[] = [
      { species: 'dog' },
      { species: 'dog' },
      { species: 'cat' },
      { species: 'rodent' },
      { species: 'amphibian' },
      { species: 'wildlife' },
    ]
    const rows = buildGroupedAnimalFilters(animals)
    expect(rows[0]).toMatchObject({ species: 'dog', count: 2 })
    expect(rows[1]).toMatchObject({ species: 'cat', count: 1 })
    expect(rows[2]).toMatchObject({ species: 'rabbit', count: 0 })
    expect(rows[3]).toMatchObject({ species: 'reptile', count: 0 })
    const othersRow = rows.find((r) => r.kind === 'group')!
    expect(othersRow.count).toBe(3)
  })
})

describe('filterShelters', () => {
  const shelters = [
    { species: ['dog', 'cat'] as ShelterSpecies[] },
    { species: ['rodent'] as ShelterSpecies[] },
    { species: ['amphibian', 'dog'] as ShelterSpecies[] },
    { species: ['reptile'] as ShelterSpecies[] },
  ]

  it('returns all when filter is null', () => {
    expect(filterShelters(shelters, null)).toHaveLength(4)
  })

  it('filters by primary species', () => {
    const result = filterShelters(shelters, 'dog')
    expect(result).toHaveLength(2)
    expect(result.every((s) => s.species.includes('dog'))).toBe(true)
  })

  it('filters by "others" — includes any shelter with a grouped species', () => {
    const result = filterShelters(shelters, 'others')
    expect(result).toHaveLength(2)
    expect(result[0].species).toContain('rodent')
    expect(result[1].species).toContain('amphibian')
  })

  it('returns empty when no shelters match', () => {
    expect(filterShelters(shelters, 'rabbit')).toHaveLength(0)
  })
})

describe('filterAnimals', () => {
  const animals: { species: ShelterSpecies }[] = [
    { species: 'dog' },
    { species: 'cat' },
    { species: 'rodent' },
    { species: 'wildlife' },
    { species: 'reptile' },
  ]

  it('returns all when filter is null', () => {
    expect(filterAnimals(animals, null)).toHaveLength(5)
  })

  it('filters by primary species', () => {
    const result = filterAnimals(animals, 'dog')
    expect(result).toEqual([{ species: 'dog' }])
  })

  it('filters by "others" — includes animals with grouped species', () => {
    const result = filterAnimals(animals, 'others')
    expect(result).toHaveLength(2)
    expect(result[0].species).toBe('rodent')
    expect(result[1].species).toBe('wildlife')
  })

  it('returns empty when no animals match', () => {
    expect(filterAnimals(animals, 'rabbit')).toHaveLength(0)
  })
})
