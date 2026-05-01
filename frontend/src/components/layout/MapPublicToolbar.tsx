import { Button } from '@/components/ui/button'

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
      className="border-border bg-muted/40 flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
      role="toolbar"
      aria-label="Public map actions"
    >
      <Button
        type="button"
        size="sm"
        variant={placementMode ? 'secondary' : 'outline'}
        onClick={onStartAddPin}
      >
        Suggest Shelter
      </Button>
      {suggestFlowActive ? (
        <>
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
            <span className="text-muted-foreground min-w-[12rem] flex-1 text-xs">
              Click the map to place a pin.
            </span>
          ) : draftLocationKnown && !suggestDialogOpen ? (
            <span className="text-muted-foreground min-w-[12rem] flex-1 text-xs">
              Draft pin set — Enter details or click the map to move it.
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  )
}
