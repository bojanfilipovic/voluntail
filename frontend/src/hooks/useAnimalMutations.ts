import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  createAnimal,
  deleteAnimal,
  updateAnimal,
  type Animal,
  type AnimalCreatePayload,
  type AnimalPatchPayload,
} from '@/api/animals'
import { toQueryError } from '@/lib/queryError'
export interface AnimalMutationsApi {
  cmsError: string | null
  setCmsError: Dispatch<SetStateAction<string | null>>
  createMutation: UseMutationResult<Animal, unknown, AnimalCreatePayload>
  updateMutation: UseMutationResult<
    Animal,
    unknown,
    { id: string; body: AnimalPatchPayload }
  >
  deleteMutation: UseMutationResult<void, unknown, string>
  cmsBusy: boolean
}

async function invalidateAnimalLists(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: ['animals'] })
}

export function useAnimalMutations(): AnimalMutationsApi {
  const queryClient = useQueryClient()
  const [cmsError, setCmsError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createAnimal,
    onSuccess: async () => {
      setCmsError(null)
      await invalidateAnimalLists(queryClient)
    },
    onError: () => {},
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: AnimalPatchPayload
    }) => updateAnimal(id, body),
    onSuccess: async () => {
      setCmsError(null)
      await invalidateAnimalLists(queryClient)
    },
    onError: () => {},
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAnimal,
    onSuccess: async () => {
      setCmsError(null)
      await invalidateAnimalLists(queryClient)
    },
    onError: (e: unknown) => {
      setCmsError(toQueryError(e)?.message ?? 'Delete failed')
    },
  })

  return {
    cmsError,
    setCmsError,
    createMutation,
    updateMutation,
    deleteMutation,
    cmsBusy:
      createMutation.isPending ||
      updateMutation.isPending ||
      deleteMutation.isPending,
  }
}
