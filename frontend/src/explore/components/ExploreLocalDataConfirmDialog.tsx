import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useI18n } from '@/i18n/I18nContext'

type Props = {
  kind: null | 'reshuffle' | 'startOver'
  onOpenChange: (open: boolean) => void
  onConfirmReshuffle: () => void
  onConfirmStartOver: () => void
}

export function ExploreLocalDataConfirmDialog({
  kind,
  onOpenChange,
  onConfirmReshuffle,
  onConfirmStartOver,
}: Props) {
  const { t } = useI18n()

  return (
    <Dialog open={kind !== null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        {kind === 'reshuffle' ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('explore.confirm.reshuffle.title')}</DialogTitle>
              <p className="text-muted-foreground text-sm">
                {t('explore.confirm.reshuffle.body')}
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {t('explore.confirm.cancel')}
              </Button>
              <Button type="button" onClick={onConfirmReshuffle}>
                {t('explore.confirm.reshuffleCta')}
              </Button>
            </DialogFooter>
          </>
        ) : null}
        {kind === 'startOver' ? (
          <>
            <DialogHeader>
              <DialogTitle>{t('explore.confirm.startOver.title')}</DialogTitle>
              <p className="text-muted-foreground text-sm">
                {t('explore.confirm.startOver.body')}
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                {t('explore.confirm.cancel')}
              </Button>
              <Button type="button" variant="destructive" onClick={onConfirmStartOver}>
                {t('explore.confirm.startOverCta')}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
