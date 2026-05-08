import type { Animal } from '@/api/animals'
import type { SpeciesFilterValue } from '@/domain/species'
import { filterBySpecies } from '@/domain/speciesFilter'

/**
 * When favorites/matches toggles are on, the list must intersect stored IDs with the
 * full directory (unscoped fetch), not only city/shelter-filtered rows.
 */
export function animalsRowsForDirectoryList(params: {
  favoritesOrMatchesOnly: boolean
  scopedAnimals: Animal[] | undefined
  unscopedAnimals: Animal[] | undefined
  speciesFilter: SpeciesFilterValue | null
}): Animal[] | undefined {
  const { favoritesOrMatchesOnly, scopedAnimals, unscopedAnimals, speciesFilter } = params
  if (!favoritesOrMatchesOnly) return scopedAnimals
  if (!unscopedAnimals) return undefined
  return filterBySpecies(unscopedAnimals, speciesFilter, (a) => a.species)
}
