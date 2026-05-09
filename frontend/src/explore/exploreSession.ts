import { SPECIES_VALUES, type ShelterSpecies } from '@/domain/species'
import { pickFunnyDisplayName } from '@/explore/funnyDisplayNames'
import {
  type ExploreIntent,
  type ExplorePersisted,
  EXPLORE_SESSION_CHANGED_EVENT,
  EXPLORE_STORAGE_KEY,
} from '@/explore/types'

function notifyExploreSessionChanged(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EXPLORE_SESSION_CHANGED_EVENT))
}

const INTENTS: readonly ExploreIntent[] = [
  'volunteer',
  'adopt',
  'foster',
  'undecided',
]

function isShelterSpecies(s: string): s is ShelterSpecies {
  return (SPECIES_VALUES as readonly string[]).includes(s)
}

function parseIntent(raw: unknown): ExploreIntent {
  if (typeof raw === 'string' && (INTENTS as readonly string[]).includes(raw)) {
    return raw as ExploreIntent
  }
  return 'undecided'
}

function parseSpeciesMode(raw: unknown): ExplorePersisted['speciesMode'] {
  if (raw === 'all') return 'all'
  if (typeof raw === 'string' && isShelterSpecies(raw)) return raw
  return 'all'
}

function parseStringArray(raw: unknown): string[] {
  if (!Array.isArray(raw)) return []
  return raw.filter((x): x is string => typeof x === 'string')
}

export function makeShuffleSeed(): string {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`
  }
}

export function defaultExploreSession(): ExplorePersisted {
  return {
    v: 1,
    displayName: '',
    intent: 'undecided',
    speciesMode: 'all',
    rememberNo: false,
    shortlistIds: [],
    passedIds: [],
    deckEntered: false,
    deckShuffleSeed: makeShuffleSeed(),
    yesNotMatchIds: [],
  }
}

/**
 * Read and normalize persisted state. Assigns a funny default display name once if empty.
 */
export function loadExploreSession(): ExplorePersisted {
  if (typeof window === 'undefined') {
    return defaultExploreSession()
  }
  let base = defaultExploreSession()
  let migrateDeckSeed = false
  try {
    const raw = window.localStorage.getItem(EXPLORE_STORAGE_KEY)
    if (raw) {
      const o = JSON.parse(raw) as Record<string, unknown>
      if (o && typeof o === 'object') {
        const seedRaw = o.deckShuffleSeed
        const seedFromStorage =
          typeof seedRaw === 'string' && seedRaw.trim() ? seedRaw.trim() : ''
        if (!seedFromStorage) migrateDeckSeed = true
        base = {
          v: 1,
          displayName: typeof o.displayName === 'string' ? o.displayName : base.displayName,
          intent: parseIntent(o.intent),
          speciesMode: parseSpeciesMode(o.speciesMode),
          rememberNo: o.rememberNo === true,
          shortlistIds: parseStringArray(o.shortlistIds),
          passedIds: parseStringArray(o.passedIds),
          deckEntered: o.deckEntered === true,
          deckShuffleSeed: seedFromStorage || makeShuffleSeed(),
          yesNotMatchIds: parseStringArray(o.yesNotMatchIds),
        }
      }
    }
  } catch {
    base = defaultExploreSession()
  }
  let shouldPersist = false
  if (!base.displayName.trim()) {
    base = { ...base, displayName: pickFunnyDisplayName() }
    shouldPersist = true
  }
  if (migrateDeckSeed) shouldPersist = true
  if (shouldPersist) {
    try {
      saveExploreSession(base)
    } catch {
      /* ignore */
    }
  }
  return base
}

export function saveExploreSession(session: ExplorePersisted): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(EXPLORE_STORAGE_KEY, JSON.stringify(session))
    notifyExploreSessionChanged()
  } catch {
    /* ignore */
  }
}

export function clearStoredPassedIds(session: ExplorePersisted): ExplorePersisted {
  return { ...session, passedIds: [] }
}
