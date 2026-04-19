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
  list: (filters: AnimalListQuery) => ['animals', filters] as const,
}
