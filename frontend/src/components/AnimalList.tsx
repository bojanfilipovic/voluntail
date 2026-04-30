import { Button } from '@/components/ui/button'
import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import { speciesLabel, type ShelterSpecies } from '@/domain/species'
import type { AnimalStatus } from '@/schemas/animals'
import { cn } from '@/lib/utils'

function statusLabel(s: AnimalStatus): string {
  switch (s) {
    case 'available':
      return 'Available'
    case 'reserved':
      return 'Reserved'
    case 'adopted':
      return 'Adopted'
    default:
      return s
  }
}

type Props = {
  animals: Animal[] | undefined
  shelters: Shelter[] | undefined
  error: Error | null
  isPending: boolean
  selectedId: string | null
  onSelectAnimal: (a: Animal) => void
  cityFilter: string | null
  onCityFilter: (city: string | null) => void
  shelterFilter: string | null
  onShelterFilter: (shelterId: string | null) => void
  speciesFilter: ShelterSpecies | null
  onSpeciesFilter: (species: ShelterSpecies | null) => void
  /** Distinct cities from shelter directory (stable sort); filter is applied server-side. */
  cityOptions: string[]
  speciesCounts: Record<ShelterSpecies, number>
}

export function AnimalList({
  animals,
  shelters,
  error,
  isPending,
  selectedId,
  onSelectAnimal,
  cityFilter,
  onCityFilter,
  shelterFilter,
  onShelterFilter,
  speciesFilter,
  onSpeciesFilter,
  cityOptions,
  speciesCounts,
}: Props) {
  const shelterNameById = new Map(
    (shelters ?? []).map((s) => [s.id, s.name] as const),
  )

  const speciesFilters = (
    Object.keys(speciesCounts) as ShelterSpecies[]
  ).map((species) => ({
    species,
    count: speciesCounts[species],
  }))

  return (
    <section className="text-start" aria-labelledby="animals-heading">
      <h2
        id="animals-heading"
        className="text-foreground mb-3 text-lg font-semibold tracking-tight"
      >
        Animals
      </h2>

      {error ? (
        <div
          className="border-destructive/40 bg-destructive/5 text-destructive mb-4 rounded-lg border px-3 py-2 text-sm leading-relaxed"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      <div className="mb-4 space-y-1.5">
        <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          City
        </label>
        <select
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full max-w-md rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          value={cityFilter ?? ''}
          onChange={(e) =>
            onCityFilter(e.target.value ? e.target.value : null)
          }
          aria-label="Filter by city"
        >
          <option value="">All cities</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4 space-y-1.5">
        <label className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Shelter
        </label>
        <select
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full max-w-md rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          value={shelterFilter ?? ''}
          onChange={(e) =>
            onShelterFilter(e.target.value ? e.target.value : null)
          }
          aria-label="Filter by shelter"
        >
          <option value="">All shelters</option>
          {(shelters ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {speciesFilters.some(({ count }) => count > 0) ? (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by species">
          {speciesFilters.map(({ species: sp, count }) => (
            <Button
              key={sp}
              type="button"
              size="sm"
              variant={speciesFilter === sp ? 'default' : 'outline'}
              className={cn(
                count === 0 &&
                  speciesFilter !== sp &&
                  'text-muted-foreground opacity-55 hover:opacity-80',
              )}
              aria-pressed={speciesFilter === sp}
              onClick={() => onSpeciesFilter(speciesFilter === sp ? null : sp)}
            >
              <span>{speciesLabel(sp)}</span>
              <span className="text-muted-foreground ml-1 tabular-nums">: {count}</span>
            </Button>
          ))}
        </div>
      ) : null}

      {error ? null : isPending ? (
        <p className="text-muted-foreground text-sm">Loading animals…</p>
      ) : (
        <ul className="list-none space-y-3 p-0">
          {(animals ?? []).map((a) => (
            <li key={a.id}>
              <button
                type="button"
                className={cn(
                  'hover:bg-muted/80 w-full rounded-lg border border-transparent p-2 text-start transition-colors',
                  a.id === selectedId &&
                    'border-primary/50 bg-primary/10 ring-primary/30 ring-1',
                )}
                onClick={() => onSelectAnimal(a)}
              >
                <span className="grid grid-cols-[4.5rem_1fr] items-start gap-3">
                  {a.imageUrl ? (
                    <span className="border-border bg-muted h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={a.imageUrl}
                        alt=""
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </span>
                  ) : (
                    <span
                      className="border-border h-[4.5rem] w-[4.5rem] shrink-0 rounded-md border bg-gradient-to-br from-muted to-muted/60"
                      aria-hidden
                    />
                  )}
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-foreground font-medium leading-snug">{a.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {speciesLabel(a.species)} · {statusLabel(a.status)} · {a.city}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {shelterNameById.get(a.shelterId) ?? 'Shelter'}
                    </span>
                    <span className="text-foreground/90 line-clamp-2 text-sm leading-snug">
                      {a.description}
                    </span>
                    {!a.published ? (
                      <span className="text-destructive text-xs font-medium">Unpublished</span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
