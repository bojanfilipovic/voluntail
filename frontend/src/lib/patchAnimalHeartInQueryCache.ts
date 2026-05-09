import type { QueryClient, InfiniteData } from '@tanstack/react-query'
import type { Animal } from '@/api/animals'
import type { PagedAnimalsResponse } from '@/schemas/animals'
import type { DirectoryStatsResponse } from '@/schemas/directoryStats'
import { directoryQueryKeys } from '@/lib/queryKeys'

function patchUnknownAnimalData(
  old: unknown,
  animalId: string,
  heartCount: number,
): unknown {
  if (old === undefined || old === null) return old
  if (Array.isArray(old)) {
    return (old as Animal[]).map((a) =>
      a.id === animalId ? { ...a, heartCount } : a,
    )
  }
  if (typeof old === 'object' && 'pages' in (old as object)) {
    const inf = old as InfiniteData<PagedAnimalsResponse>
    return {
      ...inf,
      pages: inf.pages.map((p) => ({
        ...p,
        items: p.items.map((a) =>
          a.id === animalId ? { ...a, heartCount } : a,
        ),
      })),
    }
  }
  return old
}

/**
 * Updates cached `heartCount` for one animal across infinite list, explore-deck, and all-pages
 * queries. Does not touch facets.
 */
export function patchAnimalHeartCountInQueryCache(
  queryClient: QueryClient,
  animalId: string,
  heartCount: number,
): void {
  queryClient.setQueriesData(
    {
      predicate: (q) => {
        const k = q.queryKey
        return Array.isArray(k) && k[0] === 'animals' && k[1] !== 'facets'
      },
    },
    (old) => patchUnknownAnimalData(old, animalId, heartCount),
  )
}

export function bumpDirectoryHeartSum(
  queryClient: QueryClient,
  delta: number,
): void {
  queryClient.setQueryData<DirectoryStatsResponse>(
    directoryQueryKeys.stats,
    (prev) => {
      if (!prev) return prev
      return {
        ...prev,
        heartCountSum: Math.max(0, prev.heartCountSum + delta),
      }
    },
  )
}
