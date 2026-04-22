import type { Animal } from '@/api/animals'
import type { ExploreSpeciesMode } from '@/explore/types'

export type BuildDeckInput = {
  shortlistIds: readonly string[]
  passedIds: readonly string[]
  speciesMode: ExploreSpeciesMode
}

/**
 * Published animals from the API, minus shortlist and passed, optionally filtered by species.
 * Order follows the input array (API order).
 */
export function buildDeck(animals: readonly Animal[], input: BuildDeckInput): Animal[] {
  const short = new Set(input.shortlistIds)
  const pass = new Set(input.passedIds)
  return animals.filter((a) => {
    if (short.has(a.id) || pass.has(a.id)) return false
    if (input.speciesMode !== 'all' && a.species !== input.speciesMode) return false
    return true
  })
}
