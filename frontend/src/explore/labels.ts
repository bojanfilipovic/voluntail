import type { ExploreIntent } from '@/explore/types'
import type { MessageKey } from '@/i18n/nl'

export const EXPLORE_INTENT_MESSAGE_KEYS: Record<ExploreIntent, MessageKey> = {
  volunteer: 'explore.intent.volunteer',
  adopt: 'explore.intent.adopt',
  foster: 'explore.intent.foster',
  undecided: 'explore.intent.undecided',
}
