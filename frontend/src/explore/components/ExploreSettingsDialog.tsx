import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExploreFormFields } from '@/explore/components/ExploreFormFields'
import type { ExplorePersisted } from '@/explore/types'
import { useI18n } from '@/i18n/I18nContext'

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  session: ExplorePersisted
  setDisplayName: (s: string) => void
  patch: (fn: (s: ExplorePersisted) => ExplorePersisted) => void
  canReshuffle: boolean
  onRequestReshuffle: () => void
  onRequestStartOver: () => void
}

export function ExploreSettingsDialog({
  open,
  onOpenChange,
  session,
  setDisplayName,
  patch,
  canReshuffle,
  onRequestReshuffle,
  onRequestStartOver,
}: Props) {
  const { t } = useI18n()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t('explore.settings.title')}</DialogTitle>
        </DialogHeader>
        <ExploreFormFields
          idSuffix="settings"
          displayName={session.displayName}
          onDisplayNameChange={setDisplayName}
          intent={session.intent}
          onIntentChange={(intent) => patch((s) => ({ ...s, intent }))}
        />
        <div className="grid gap-2 border-t pt-4">
          <p className="text-muted-foreground text-xs">{t('explore.settings.localOnly')}</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="secondary"
              disabled={!canReshuffle}
              onClick={onRequestReshuffle}
              className="w-full transition active:scale-[0.99] enabled:opacity-100 disabled:opacity-40 sm:w-auto"
            >
              {t('explore.settings.reshuffle')}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onRequestStartOver}
              className="w-full text-destructive transition active:scale-[0.99] sm:w-auto"
            >
              {t('explore.settings.startOver')}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            {t('explore.settings.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
