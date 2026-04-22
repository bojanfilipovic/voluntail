import type { ExploreIntent } from '@/explore/types'

export function intentLabel(intent: ExploreIntent): string {
  const labels: Record<ExploreIntent, string> = {
    volunteer: 'Volunteer or help out',
    adopt: 'Adopt',
    foster: 'Foster',
    undecided: 'Just browsing',
  }
  return labels[intent]
}
