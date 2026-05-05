import { useState } from 'react'
import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import { SpeciesFilterBar, type SpeciesFilterRow } from '@/components/SpeciesFilterBar'
import { parseAnimalAge } from '@/domain/animalAge'
import { speciesLabel, type SpeciesFilterValue } from '@/domain/species'
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
  speciesFilter: SpeciesFilterValue | null
  onSpeciesFilter: (species: SpeciesFilterValue | null) => void
  /** Distinct cities from shelter directory (stable sort); filter is applied server-side. */
  cityOptions: string[]
  speciesFilters: SpeciesFilterRow[]
  totalAnimalCount: number | undefined
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
  speciesFilters,
  totalAnimalCount,
}: Props) {
  const shelterNameById = new Map(
    (shelters ?? []).map((s) => [s.id, s.name] as const),
  )

  return (
    <section className="text-start" aria-label="Animal list">
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
        totalCount={totalAnimalCount}
      />

      <SecondaryFilters
        cityFilter={cityFilter}
        onCityFilter={onCityFilter}
        shelterFilter={shelterFilter}
        onShelterFilter={onShelterFilter}
        cityOptions={cityOptions}
        shelters={shelters}
      />

      {error ? null : isPending ? (
        <p className="text-muted-foreground text-sm">Loading animals…</p>
      ) : !animals?.length ? (
        <p className="text-muted-foreground py-8 text-center text-sm">No animals found.</p>
      ) : (
        <ul className="list-none space-y-3 p-0">
          {animals.map((a) => (
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
                      {speciesLabel(a.species)} · {statusLabel(a.status)} · {a.city}{parseAnimalAge(a.description) ? ` · ${parseAnimalAge(a.description)}` : ''}
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

/* ─── Collapsible secondary filters ─── */

function SecondaryFilters({
  cityFilter,
  onCityFilter,
  shelterFilter,
  onShelterFilter,
  cityOptions,
  shelters,
}: {
  cityFilter: string | null
  onCityFilter: (city: string | null) => void
  shelterFilter: string | null
  onShelterFilter: (shelterId: string | null) => void
  cityOptions: string[]
  shelters: Shelter[] | undefined
}) {
  const [open, setOpen] = useState(false)
  const activeCount = (cityFilter ? 1 : 0) + (shelterFilter ? 1 : 0)

  return (
    <div className="mb-4">
      <button
        type="button"
        className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs font-medium transition-colors"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <svg
          className={cn('size-3.5 transition-transform', open && 'rotate-90')}
          viewBox="0 0 16 16"
          fill="currentColor"
          aria-hidden
        >
          <path d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 0 1-1.06-1.06L9.44 8 6.22 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
        More filters
        {activeCount > 0 ? (
          <span className="bg-primary text-primary-foreground inline-flex size-4 items-center justify-center rounded-full text-[10px] font-semibold">
            {activeCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <select
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={cityFilter ?? ''}
            onChange={(e) => onCityFilter(e.target.value || null)}
            aria-label="Filter by city"
          >
            <option value="">All cities</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <select
            className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            value={shelterFilter ?? ''}
            onChange={(e) => onShelterFilter(e.target.value || null)}
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
      ) : null}
    </div>
  )
}
