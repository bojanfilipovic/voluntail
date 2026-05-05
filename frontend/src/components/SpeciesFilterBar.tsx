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
    <div className="relative mb-4">
      <div
        className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
        role="group"
        aria-label="Filter by species"
      >
        <Button
          type="button"
          size="sm"
          className="shrink-0"
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
                'shrink-0',
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
      <div
        className="pointer-events-none absolute top-0 right-0 h-full w-8 sm:hidden"
        style={{ background: 'linear-gradient(to left, var(--background), transparent)' }}
        aria-hidden
      />
    </div>
  )
}
