import { SPECIES_VALUES, PRIMARY_SPECIES, OTHER_SPECIES, isOtherSpecies, type ShelterSpecies, type SpeciesFilterValue } from './species'
import type { SpeciesFilterRow } from '@/components/SpeciesFilterBar'

/** Build the filter-bar row data from a species count map. */
export function buildSpeciesFilterRows(counts: Record<ShelterSpecies, number>): SpeciesFilterRow[] {
  const rows = PRIMARY_SPECIES.map((species) => ({
    kind: 'single' as const,
    species,
    count: counts[species],
  }))
  const othersCount = OTHER_SPECIES.reduce((sum, sp) => sum + counts[sp], 0)
  return [...rows, { kind: 'group' as const, key: 'others' as const, label: 'Others', count: othersCount }]
}

/**
 * Filter items by species selection. Works for:
 * - shelters (getSpecies returns ShelterSpecies[])
 * - animals (getSpecies returns ShelterSpecies)
 */
export function filterBySpecies<T>(
  items: T[],
  filter: SpeciesFilterValue | null,
  getSpecies: (item: T) => ShelterSpecies | ShelterSpecies[],
): T[] {
  if (!filter) return items
  return items.filter((item) => {
    const sp = getSpecies(item)
    if (filter === 'others') {
      return Array.isArray(sp) ? sp.some(isOtherSpecies) : isOtherSpecies(sp)
    }
    return Array.isArray(sp) ? sp.includes(filter) : sp === filter
  })
}

/** Count species occurrences across items. */
export function countSpecies<T>(
  items: T[],
  getSpecies: (item: T) => ShelterSpecies | ShelterSpecies[],
): Record<ShelterSpecies, number> {
  const counts = Object.fromEntries(
    SPECIES_VALUES.map((sp) => [sp, 0]),
  ) as Record<ShelterSpecies, number>
  for (const item of items) {
    const sp = getSpecies(item)
    if (Array.isArray(sp)) {
      for (const s of sp) counts[s] += 1
    } else {
      counts[sp] += 1
    }
  }
  return counts
}
