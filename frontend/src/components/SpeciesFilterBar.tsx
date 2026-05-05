import { Button } from '@/components/ui/button'
import { speciesLabel, type ShelterSpecies } from '@/domain/species'
import { cn } from '@/lib/utils'

export type SpeciesFilterRow = { species: ShelterSpecies; count: number }

type Props = {
  filters: SpeciesFilterRow[]
  selected: ShelterSpecies | null
  onSelect: (species: ShelterSpecies | null) => void
  totalCount?: number
}

export function SpeciesFilterBar({ filters, selected, onSelect, totalCount }: Props) {
  if (!filters.some(({ count }) => count > 0)) return null

  return (
    <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by species">
      <Button
        type="button"
        size="sm"
        variant={selected === null ? 'default' : 'outline'}
        onClick={() => onSelect(null)}
        aria-pressed={selected === null}
      >
        All
        {totalCount !== undefined ? (
          <span className="text-muted-foreground ml-1 tabular-nums">: {totalCount}</span>
        ) : null}
      </Button>
      {filters.map(({ species: sp, count }) => (
        <Button
          key={sp}
          type="button"
          size="sm"
          variant={selected === sp ? 'default' : 'outline'}
          className={cn(
            count === 0 &&
              selected !== sp &&
              'text-muted-foreground opacity-55 hover:opacity-80',
          )}
          aria-pressed={selected === sp}
          onClick={() => onSelect(selected === sp ? null : sp)}
        >
          <span>{speciesLabel(sp)}</span>
          <span className="text-muted-foreground ml-1 tabular-nums">: {count}</span>
        </Button>
      ))}
    </div>
  )
}
