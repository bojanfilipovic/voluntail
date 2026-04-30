import { Button } from '@/components/ui/button'

type Props = {
  cmsBusy: boolean
  canAddAnimal: boolean
  onAddAnimal: () => void
}

/** Curator-only strip below the directory list; same visibility rules as map CMS toolbar. */
export function AnimalCmsToolbar({ cmsBusy, canAddAnimal, onAddAnimal }: Props) {
  return (
    <div
      className="border-border bg-muted/40 flex flex-shrink-0 flex-wrap items-center gap-2 border-t px-3 py-2"
      role="toolbar"
      aria-label="Animal CMS"
    >
      <Button
        type="button"
        size="sm"
        variant="default"
        disabled={cmsBusy || !canAddAnimal}
        onClick={onAddAnimal}
      >
        Add animal
      </Button>
    </div>
  )
}
