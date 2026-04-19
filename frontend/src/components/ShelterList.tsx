import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Shelter } from '@/api/shelters'

type Props = {
  shelters: Shelter[] | undefined
  error: Error | null
  isPending: boolean
  selectedId: string | null
  onSelectShelter: (s: Shelter) => void
  speciesFilter: string | null
  onSpeciesFilter: (species: string | null) => void
  speciesOptions: string[]
}

function speciesLine(s: Shelter): string {
  return s.species.length ? s.species.join(' · ') : '—'
}

export function ShelterList({
  shelters,
  error,
  isPending,
  selectedId,
  onSelectShelter,
  speciesFilter,
  onSpeciesFilter,
  speciesOptions,
}: Props) {
  return (
    <section className="text-start" aria-labelledby="shelters-heading">
      <h2 id="shelters-heading" className="text-foreground mb-1 text-lg font-semibold tracking-tight">
        Shelters
      </h2>
      <p className="text-muted-foreground mb-3 text-sm leading-relaxed">
        Tap a pin or a row to open details and outbound links. Requires the Ktor API (e.g.{' '}
        <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">localhost:8080</code>)
        proxied by Vite.
      </p>

      {speciesOptions.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by species">
          <Button
            type="button"
            size="sm"
            variant={speciesFilter === null ? 'default' : 'outline'}
            onClick={() => onSpeciesFilter(null)}
          >
            All
          </Button>
          {speciesOptions.map((sp) => (
            <Button
              key={sp}
              type="button"
              size="sm"
              variant={speciesFilter === sp ? 'default' : 'outline'}
              onClick={() => onSpeciesFilter(speciesFilter === sp ? null : sp)}
            >
              {sp}
            </Button>
          ))}
        </div>
      ) : null}

      {error ? (
        <p className="text-destructive text-sm" role="alert">
          {error.message}
        </p>
      ) : isPending ? (
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
                    <span className="text-muted-foreground text-xs">{speciesLine(s)}</span>
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
