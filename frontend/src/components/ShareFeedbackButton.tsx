import { Button } from '@/components/ui/button'

type Props = {
  onClick: () => void
  className?: string
}

export function ShareFeedbackButton({ onClick, className }: Props) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={onClick}
    >
      Share feedback
    </Button>
  )
}
