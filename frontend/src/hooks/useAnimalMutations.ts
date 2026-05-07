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
import { animalQueryKeys } from '@/lib/queryKeys'

export type AnimalMutationsApi = CmsCrudMutationsResult<
  Animal,
  AnimalCreatePayload,
  AnimalPatchPayload
>

async function invalidateAnimalLists(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: animalQueryKeys.root })
}

export function useAnimalMutations(): AnimalMutationsApi {
  return useCmsCrudMutations({
    invalidate: invalidateAnimalLists,
    createFn: createAnimal,
    updateFn: updateAnimal,
    deleteFn: deleteAnimal,
  })
}
