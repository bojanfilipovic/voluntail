import type { QueryClient } from '@tanstack/react-query'
import {
  createShelter,
  deleteShelter,
  updateShelter,
  type Shelter,
  type ShelterCreatePayload,
  type ShelterPatchPayload,
} from '@/api/shelters'
import {
  useCmsCrudMutations,
  type CmsCrudMutationsResult,
} from '@/hooks/useCmsCrudMutations'
import { directoryQueryKeys, shelterQueryKeys } from '@/lib/queryKeys'

export type ShelterMutationsApi = CmsCrudMutationsResult<
  Shelter,
  ShelterCreatePayload,
  ShelterPatchPayload
>

async function invalidateSheltersList(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: shelterQueryKeys.root })
  await queryClient.invalidateQueries({ queryKey: directoryQueryKeys.stats })
}

export function useShelterMutations(): ShelterMutationsApi {
  return useCmsCrudMutations({
    invalidate: invalidateSheltersList,
    createFn: createShelter,
    updateFn: updateShelter,
    deleteFn: deleteShelter,
  })
}
