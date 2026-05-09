import type { QueryClient } from '@tanstack/react-query'
import {
  createAnimal,
  deleteAnimal,
  updateAnimal,
  type Animal,
  type AnimalCreatePayload,
  type AnimalPatchPayload,
} from '@/api/animals'
import {
  useCmsCrudMutations,
  type CmsCrudMutationsResult,
} from '@/hooks/useCmsCrudMutations'
import { animalQueryKeys, directoryQueryKeys } from '@/lib/queryKeys'

export type AnimalMutationsApi = CmsCrudMutationsResult<
  Animal,
  AnimalCreatePayload,
  AnimalPatchPayload
>

async function invalidateAnimalLists(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: animalQueryKeys.root })
  await queryClient.invalidateQueries({ queryKey: directoryQueryKeys.stats })
}

export function useAnimalMutations(): AnimalMutationsApi {
  return useCmsCrudMutations({
    invalidate: invalidateAnimalLists,
    createFn: createAnimal,
    updateFn: updateAnimal,
    deleteFn: deleteAnimal,
  })
}
