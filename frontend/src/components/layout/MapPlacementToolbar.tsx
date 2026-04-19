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
      className="border-border bg-muted/40 flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
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
        <span className="text-muted-foreground min-w-[12rem] flex-1 text-xs">
          Click the map to place a pin.
        </span>
      ) : draftLocationKnown && !addDialogOpen ? (
        <span className="text-muted-foreground min-w-[12rem] flex-1 text-xs">
          Draft pin set — Enter details or click the map to move it.
        </span>
      ) : null}
    </div>
  )
}
