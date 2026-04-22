import type { ShelterSpecies } from '@/domain/species'

/** Aligned with product: anonymous “why are you here?” — not used for API filtering in v1. */
export const EXPLORE_INTENTS = [
  'volunteer',
  'adopt',
  'foster',
  'undecided',
] as const
export type ExploreIntent = (typeof EXPLORE_INTENTS)[number]

export type ExploreSpeciesMode = 'all' | ShelterSpecies

export const EXPLORE_STORAGE_KEY = 'voluntail.explore.v1' as const

export type ExplorePersisted = {
  v: 1
  displayName: string
  intent: ExploreIntent
  speciesMode: ExploreSpeciesMode
  /** Default off: left swipes are not remembered across visits unless the user opts in. */
  rememberNo: boolean
  shortlistIds: string[]
  /** Only used when `rememberNo` is true. Cleared when toggling rememberNo off. */
  passedIds: string[]
  /** After “Start swiping”, show the deck (not pre-deck) on return visits. */
  deckEntered: boolean
  /**
   * “Yes” with no match roll: excluded from the deck until new session / reset
   * as implemented (we clear on full reset to refill the game).
   */
  yesNotMatchIds: string[]
}
