/** TanStack Query keys — single source so invalidations stay aligned with queries. */

export const shelterQueryKeys = {
  all: ['shelters'] as const,
}

export type AnimalListQuery = {
  city: string | null
  shelterId: string | null
  species: string | null
}

export const animalQueryKeys = {
  /** Prefix for all animal list queries — use for invalidations after CMS mutations. */
  root: ['animals'] as const,
  list: (filters: AnimalListQuery) => [...animalQueryKeys.root, filters] as const,
  /** No CMS: public directory only. Used by Explore so drafts are never mixed into swipes. */
  explore: (filters: AnimalListQuery) =>
    [...animalQueryKeys.root, 'public', filters] as const,
}
