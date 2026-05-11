import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'

type Props = {
  placementMode: boolean
  draftLocationKnown: boolean
  addDialogOpen: boolean
  cmsBusy: boolean
  cancelPlacementDisabled: boolean
  onStartAddPin: () => void
  onEnterDetails: () => void
  onCancelPlacement: () => void
}

export function MapPlacementToolbar({
  placementMode,
  draftLocationKnown,
  addDialogOpen,
  cmsBusy,
  cancelPlacementDisabled,
  onStartAddPin,
  onEnterDetails,
  onCancelPlacement,
}: Props) {
  const { t } = useI18n()

  return (
    <div
      className="pointer-events-auto inline-flex flex-wrap items-center gap-2 rounded-lg bg-background/90 px-2 py-1 shadow-md backdrop-blur-sm"
      role="toolbar"
      aria-label={t('map.cmsToolbarAria')}
    >
      <Button
        type="button"
        size="sm"
        variant={placementMode ? 'secondary' : 'outline'}
        onClick={onStartAddPin}
        disabled={cmsBusy}
      >
        {t('map.addPin')}
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onEnterDetails}
        disabled={cmsBusy || !draftLocationKnown}
      >
        {t('map.enterDetails')}
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={onCancelPlacement}
        disabled={cancelPlacementDisabled}
      >
        {t('map.cancel')}
      </Button>
      {placementMode ? (
        <span className="text-muted-foreground text-xs">{t('map.tapToPlace')}</span>
      ) : draftLocationKnown && !addDialogOpen ? (
        <span className="text-muted-foreground text-xs">{t('map.draftPinCms')}</span>
      ) : null}
    </div>
  )
}
