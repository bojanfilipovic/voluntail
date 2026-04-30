import { Button } from '@/components/ui/button'

/**
 * Public-only actions above the map. "Suggest Shelter" will launch a nomination flow later;
 * until then the control is inert but keeps layout stable for that work.
 */
export function MapPublicToolbar() {
  return (
    <div
      className="border-border bg-muted/40 flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
      aria-label="Public map actions"
    >
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled
        aria-describedby="map-suggest-shelter-hint"
      >
        Suggest Shelter
      </Button>
      <span id="map-suggest-shelter-hint" className="text-muted-foreground text-xs">
        Coming soon
      </span>
    </div>
  )
}
