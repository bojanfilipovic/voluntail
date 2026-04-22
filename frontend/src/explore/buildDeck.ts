import type { Animal } from '@/api/animals'
import type { ExploreSpeciesMode } from '@/explore/types'

export type BuildDeckInput = {
  shortlistIds: readonly string[]
  passedIds: readonly string[]
  /**
   * “Yes” swipes that did not roll a match (this session). Excluded from the deck
   * but not stored as matches / not a “not for me” pass.
   */
  sessionYesNotMatchIds: readonly string[]
  speciesMode: ExploreSpeciesMode
}

/**
 * Published animals from the API, minus shortlist, passed, and session “yes but no match”,
 * optionally filtered by species. Order follows the input array (API order).
 */
export function buildDeck(animals: readonly Animal[], input: BuildDeckInput): Animal[] {
  const short = new Set(input.shortlistIds)
  const pass = new Set(input.passedIds)
  const noList = new Set(input.sessionYesNotMatchIds)
  return animals.filter((a) => {
    if (!a.published) return false
    if (short.has(a.id) || pass.has(a.id) || noList.has(a.id)) return false
    if (input.speciesMode !== 'all' && a.species !== input.speciesMode) return false
    return true
  })
}
