import { ShareFeedbackButton } from '@/components/ShareFeedbackButton'
import { cn } from '@/lib/utils'

type Props = {
  onClick: () => void
  className?: string
}

/**
 * "Share feedback" rendered as its own bordered row inside a `DialogFooterStack`.
 *
 * Used by both `ShelterDetailDialog` and `AnimalDetailDialog` so the affordance
 * reads consistently (feedback to the maintainer, not to the shelter).
 */
export function ShareFeedbackRow({ onClick, className }: Props) {
  return (
    <div className={cn('border-border/50 border-t pt-3', className)}>
      <ShareFeedbackButton onClick={onClick} />
    </div>
  )
}
