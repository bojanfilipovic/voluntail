import { Button } from '@/components/ui/button'

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
  return (
    <div
      className="pointer-events-auto inline-flex flex-wrap items-center gap-2 rounded-lg bg-background/90 px-2 py-1 shadow-md backdrop-blur-sm"
      role="toolbar"
      aria-label="Shelter CMS"
    >
      <Button
        type="button"
        size="sm"
        variant={placementMode ? 'secondary' : 'outline'}
        onClick={onStartAddPin}
        disabled={cmsBusy}
      >
        Add pin
      </Button>
      <Button
        type="button"
        size="sm"
        onClick={onEnterDetails}
        disabled={cmsBusy || !draftLocationKnown}
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
          Tap the map to place a pin.
        </span>
      ) : draftLocationKnown && !addDialogOpen ? (
        <span className="text-muted-foreground text-xs">
          Draft pin set — Enter details or tap to move.
        </span>
      ) : null}
    </div>
  )
}
