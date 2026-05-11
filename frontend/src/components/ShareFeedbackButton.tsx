import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'

type Props = {
  onClick: () => void
  className?: string
}

export function ShareFeedbackButton({ onClick, className }: Props) {
  const { t } = useI18n()
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={className}
      onClick={onClick}
    >
      {t('discovery.shareFeedback')}
    </Button>
  )
}
