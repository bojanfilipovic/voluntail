import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'
import { useI18n } from '@/i18n/I18nContext'

type Props = {
  placementMode: boolean
  draftLocationKnown: boolean
  /** Hide map hint while the suggest dialog is open (draft still on map). */
  suggestDialogOpen: boolean
  cancelPlacementDisabled: boolean
  onStartAddPin: () => void
  onEnterDetails: () => void
  onCancelPlacement: () => void
}

/**
 * Public map actions — mirrors {@link MapPlacementToolbar} affordances for the suggest-shelter flow.
 */
export function MapPublicToolbar({
  placementMode,
  draftLocationKnown,
  suggestDialogOpen,
  cancelPlacementDisabled,
  onStartAddPin,
  onEnterDetails,
  onCancelPlacement,
}: Props) {
  const { t } = useI18n()
  /** Only after starting suggest: picking a pin or when a draft exists on the map (not idle). */
  const suggestFlowActive = placementMode || draftLocationKnown

  return (
    <div
      className="pointer-events-auto inline-flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label={t('map.publicToolbarAria')}
    >
      <Button
        type="button"
        size="sm"
        variant={placementMode ? 'secondary' : 'default'}
        className={cn(
          'shadow-md',
          !placementMode && 'gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700',
        )}
        onClick={onStartAddPin}
      >
        <MapPin className="size-4" aria-hidden />
        {t('map.suggestShelter')}
      </Button>
      {suggestFlowActive ? (
        <span className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-background/90 px-2 py-1 shadow-md backdrop-blur-sm">
          <Button
            type="button"
            size="sm"
            onClick={onEnterDetails}
            disabled={!draftLocationKnown}
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
          ) : draftLocationKnown && !suggestDialogOpen ? (
            <span className="text-muted-foreground text-xs">{t('map.pinSetSuggest')}</span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}
