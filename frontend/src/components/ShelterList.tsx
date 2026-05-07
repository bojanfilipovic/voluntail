import type { Shelter } from '@/api/shelters'
import { SpeciesFilterBar, type SpeciesFilterRow } from '@/components/SpeciesFilterBar'
import { Button } from '@/components/ui/button'
import { speciesLabel, type SpeciesFilterValue } from '@/domain/species'
import { cn } from '@/lib/utils'
import { ExternalLink } from 'lucide-react'

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
  onViewAnimals: (shelterId: string) => void
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
  onViewAnimals,
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
      ) : !shelters?.length ? (
        <p className="text-muted-foreground py-8 text-center text-sm">No shelters found.</p>
      ) : (
        <ul className="list-none space-y-3 p-0">
          {shelters.map((s) => (
            <li key={s.id}>
              <div
                role="button"
                tabIndex={0}
                className={cn(
                  'hover:bg-muted/80 w-full cursor-pointer rounded-lg border border-transparent p-2 text-start transition-colors',
                  s.id === selectedId &&
                    'border-primary/50 bg-primary/10 ring-primary/30 ring-1',
                )}
                onClick={() => onSelectShelter(s)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectShelter(s) } }}
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
                    <span className="mt-1.5 flex flex-wrap items-center gap-2">
                      {s.signupUrl ? (
                        <a
                          href={new URL(s.signupUrl).origin}
                          onClick={(e) => e.stopPropagation()}
                          rel="noreferrer noopener"
                          target="_blank"
                          aria-label="Website (opens in new tab)"
                          className="inline-flex h-8 items-center gap-1 rounded-md bg-emerald-600 px-3 text-xs font-medium text-white hover:bg-emerald-700"
                        >
                          Website
                          <ExternalLink className="size-3" aria-hidden />
                        </a>
                      ) : null}
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); onViewAnimals(s.id) }}
                        className="h-8 px-3 text-xs"
                      >
                        Animals
                      </Button>
                    </span>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
