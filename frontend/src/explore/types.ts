import type { ShelterSpecies } from '@/domain/species'

/** Aligned with product: anonymous "why are you here?" — not used for API filtering in v1. */
export const EXPLORE_INTENTS = [
  'volunteer',
  'adopt',
  'foster',
  'undecided',
] as const
export type ExploreIntent = (typeof EXPLORE_INTENTS)[number]

export const EXPLORE_STORAGE_KEY = 'voluntail.explore.v2' as const

/** Same-tab notification when explore session (e.g. shortlist) is written — `storage` events omit same-tab writes. */
export const EXPLORE_SESSION_CHANGED_EVENT = 'voluntail-explore-session-changed' as const

export type ExplorePersisted = {
  v: 1
  displayName: string
  intent: ExploreIntent
  /** @deprecated Kept for localStorage parse compat only; UI removed, logic no-ops. */
  speciesMode: 'all' | ShelterSpecies
  /** @deprecated Kept for localStorage parse compat only; UI removed. */
  rememberNo: boolean
  shortlistIds: string[]
  /** Only used when `rememberNo` is true. Cleared when toggling rememberNo off. */
  passedIds: string[]
  /** After "Start swiping", show the deck (not pre-deck) on return visits. */
  deckEntered: boolean
  /** Server-side shuffle order for public animal listing (Explore deck base order). */
  deckShuffleSeed: string
  /**
   * "Yes" with no match roll: excluded from the deck until new session / reset
   * as implemented (we clear on full reset to refill the game).
   */
  yesNotMatchIds: string[]
}
