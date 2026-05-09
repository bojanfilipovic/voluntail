/** TanStack Query keys — single source so invalidations stay aligned with queries. */

export const shelterQueryKeys = {
  /** Invalidates all shelter-backed queries (map markers, etc.). */
  root: ['shelters'] as const,
  mapMarkers: ['shelters', 'map-markers'] as const,
}

export type AnimalListQuery = {
  city: string | null
  shelterId: string | null
  species: string | null
}

export const animalQueryKeys = {
  /** Prefix for all animal list queries — use for invalidations after CMS mutations. */
  root: ['animals'] as const,
  allPages: (filters: AnimalListQuery, cms: boolean) =>
    [...animalQueryKeys.root, 'all-pages', filters, cms] as const,
  listInfinite: (filters: AnimalListQuery) =>
    [...animalQueryKeys.root, 'list-infinite', filters] as const,
  facets: (filters: Pick<AnimalListQuery, 'city' | 'shelterId'>) =>
    [...animalQueryKeys.root, 'facets', filters] as const,
  /** Explore: public paged fetch with shuffle seed (full merge in queryFn). */
  explore: (filters: AnimalListQuery, shuffleSeed: string) =>
    [...animalQueryKeys.root, 'explore', filters, shuffleSeed] as const,
}

export const directoryQueryKeys = {
  stats: ['directory-stats'] as const,
}
