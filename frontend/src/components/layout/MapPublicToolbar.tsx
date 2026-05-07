import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MapPin } from 'lucide-react'

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
  /** Only after starting suggest: picking a pin or when a draft exists on the map (not idle). */
  const suggestFlowActive = placementMode || draftLocationKnown

  return (
    <div
      className="pointer-events-auto inline-flex flex-wrap items-center gap-2"
      role="toolbar"
      aria-label="Public map actions"
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
        Suggest a shelter
      </Button>
      {suggestFlowActive ? (
        <span className="inline-flex flex-wrap items-center gap-2 rounded-lg bg-background/90 px-2 py-1 shadow-md backdrop-blur-sm">
          <Button
            type="button"
            size="sm"
            onClick={onEnterDetails}
            disabled={!draftLocationKnown}
          >
            Enter details
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onCancelPlacement}
            disabled={cancelPlacementDisabled}
          >
            Cancel
          </Button>
          {placementMode ? (
            <span className="text-muted-foreground text-xs">
              Tap map to place pin.
            </span>
          ) : draftLocationKnown && !suggestDialogOpen ? (
            <span className="text-muted-foreground text-xs">
              Pin set — Enter details or tap to move.
            </span>
          ) : null}
        </span>
      ) : null}
    </div>
  )
}
