/** Shared TanStack Query options for slow-changing directory/catalog reads. */
export const catalogQueryOptions = {
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const
