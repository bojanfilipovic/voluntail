import { Button } from '@/components/ui/button'
import { speciesLabel, type ShelterSpecies, type SpeciesFilterValue } from '@/domain/species'
import { cn } from '@/lib/utils'

export type SpeciesFilterRow =
  | { kind: 'single'; species: ShelterSpecies; count: number }
  | { kind: 'group'; key: 'others'; label: string; count: number }

type Props = {
  filters: SpeciesFilterRow[]
  selected: SpeciesFilterValue | null
  onSelect: (value: SpeciesFilterValue | null) => void
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
      {filters.map((row) => {
        const key = row.kind === 'single' ? row.species : row.key
        const label = row.kind === 'single' ? speciesLabel(row.species) : row.label
        const value: SpeciesFilterValue = row.kind === 'single' ? row.species : 'others'
        const isSelected = selected === value
        return (
          <Button
            key={key}
            type="button"
            size="sm"
            variant={isSelected ? 'default' : 'outline'}
            className={cn(
              row.count === 0 &&
                !isSelected &&
                'text-muted-foreground opacity-55 hover:opacity-80',
            )}
            aria-pressed={isSelected}
            onClick={() => onSelect(isSelected ? null : value)}
          >
            <span>{label}</span>
            <span className="text-muted-foreground ml-1 tabular-nums">: {row.count}</span>
          </Button>
        )
      })}
    </div>
  )
}
