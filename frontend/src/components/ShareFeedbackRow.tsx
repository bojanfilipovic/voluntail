import { ShareFeedbackButton } from '@/components/ShareFeedbackButton'

type Props = {
  onClick: () => void
}

/**
 * "Share feedback" rendered as its own bordered row inside a `DialogFooterStack`.
 *
 * Used by both `ShelterDetailDialog` and `AnimalDetailDialog` so the affordance
 * reads consistently (feedback to the maintainer, not to the shelter).
 */
export function ShareFeedbackRow({ onClick }: Props) {
  return (
    <div className="border-border/50 border-t pt-3">
      <ShareFeedbackButton onClick={onClick} />
    </div>
  )
}
