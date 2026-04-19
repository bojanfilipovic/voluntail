import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  createShelter,
  deleteShelter,
  updateShelter,
  type Shelter,
  type ShelterCreatePayload,
  type ShelterPatchPayload,
} from '@/api/shelters'
import { toQueryError } from '@/lib/queryError'
import { shelterQueryKeys } from '@/lib/queryKeys'

export interface ShelterMutationsApi {
  cmsError: string | null
  setCmsError: Dispatch<SetStateAction<string | null>>
  createMutation: UseMutationResult<Shelter, unknown, ShelterCreatePayload>
  updateMutation: UseMutationResult<
    Shelter,
    unknown,
    { id: string; body: ShelterPatchPayload }
  >
  deleteMutation: UseMutationResult<void, unknown, string>
  cmsBusy: boolean
}

async function invalidateSheltersList(queryClient: QueryClient): Promise<void> {
  await queryClient.invalidateQueries({ queryKey: shelterQueryKeys.all })
}

function cmsMutationMessage(error: unknown, fallback: string): string {
  return toQueryError(error)?.message ?? fallback
}

export function useShelterMutations(): ShelterMutationsApi {
  const queryClient = useQueryClient()
  const [cmsError, setCmsError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createShelter,
    onSuccess: async () => {
      setCmsError(null)
      await invalidateSheltersList(queryClient)
    },
    onError: () => {
      /* Create failures use inline error in AddShelterDialog (avoid duplicate banner). */
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: ShelterPatchPayload
    }) => updateShelter(id, body),
    onSuccess: async () => {
      setCmsError(null)
      await invalidateSheltersList(queryClient)
    },
    onError: () => {
      /* Update failures use inline error in EditShelterDialog. */
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShelter,
    onSuccess: async () => {
      setCmsError(null)
      await invalidateSheltersList(queryClient)
    },
    onError: (e: unknown) => {
      setCmsError(cmsMutationMessage(e, 'Delete failed'))
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
