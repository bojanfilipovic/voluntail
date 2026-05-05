import type { Shelter } from '@/api/shelters'
import { SpeciesFilterBar, type SpeciesFilterRow } from '@/components/SpeciesFilterBar'
import { speciesLabel, type SpeciesFilterValue } from '@/domain/species'
import { cn } from '@/lib/utils'

type Props = {
  shelters: Shelter[] | undefined
  error: Error | null
  isPending: boolean
  totalShelterCount: number | undefined
  selectedId: string | null
  onSelectShelter: (s: Shelter) => void
  speciesFilter: SpeciesFilterValue | null
  onSpeciesFilter: (species: SpeciesFilterValue | null) => void
  speciesFilters: SpeciesFilterRow[]
}

function speciesLine(s: Shelter): string {
  return s.species.length ? s.species.map(speciesLabel).join(' · ') : '—'
}

export function ShelterList({
  shelters,
  error,
  isPending,
  totalShelterCount,
  selectedId,
  onSelectShelter,
  speciesFilter,
  onSpeciesFilter,
  speciesFilters,
}: Props) {
  return (
    <section className="text-start" aria-label="Shelter list">
      {error ? (
        <div
          className="border-destructive/40 bg-destructive/5 text-destructive mb-4 rounded-lg border px-3 py-2 text-sm leading-relaxed"
          role="alert"
        >
          {error.message}
        </div>
      ) : null}

      <SpeciesFilterBar
        filters={speciesFilters}
        selected={speciesFilter}
        onSelect={onSpeciesFilter}
        totalCount={totalShelterCount}
      />

      {error ? null : isPending ? (
        <p className="text-muted-foreground text-sm">Loading shelters…</p>
      ) : (
        <ul className="list-none space-y-3 p-0">
          {(shelters ?? []).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={cn(
                  'hover:bg-muted/80 w-full rounded-lg border border-transparent p-2 text-start transition-colors',
                  s.id === selectedId &&
                    'border-primary/50 bg-primary/10 ring-primary/30 ring-1',
                )}
                onClick={() => onSelectShelter(s)}
              >
                <span className="grid grid-cols-[4.5rem_1fr] items-start gap-3">
                  {s.imageUrl ? (
                    <span className="border-border bg-muted h-[4.5rem] w-[4.5rem] shrink-0 overflow-hidden rounded-md border">
                      <img
                        src={s.imageUrl}
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
                    <span className="text-foreground font-medium leading-snug">{s.name}</span>
                    <span className="text-muted-foreground text-xs">
                      {s.city} · {speciesLine(s)}
                    </span>
                    <span className="text-foreground/90 line-clamp-3 text-sm leading-snug">
                      {s.description}
                    </span>
                    {s.signupUrl ? (
                      <span className="mt-1">
                        <a
                          href={s.signupUrl}
                          onClick={(e) => e.stopPropagation()}
                          rel="noreferrer noopener"
                          target="_blank"
                          className="text-primary text-xs underline-offset-4 hover:underline"
                        >
                          Signup link
                        </a>
                      </span>
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
