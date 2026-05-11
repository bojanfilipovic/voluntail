import type { ComponentProps, ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'
import { cn } from '@/lib/utils'

type ButtonProps = Pick<ComponentProps<typeof Button>, 'variant' | 'size' | 'className'>

type Props = ButtonProps & {
  onClick: () => void
  /** Optional icon before the label (e.g. header uses `MessageSquare`). */
  leadingIcon?: ReactNode
}

export function ShareFeedbackButton({
  onClick,
  className,
  variant = 'outline',
  size = 'sm',
  leadingIcon,
}: Props) {
  const { t } = useI18n()
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn(leadingIcon && 'gap-2', className)}
      onClick={onClick}
    >
      {leadingIcon}
      {t('discovery.shareFeedback')}
    </Button>
  )
}
