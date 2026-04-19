import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  createShelter,
  deleteShelter,
  updateShelter,
  type Shelter,
  type ShelterCreatePayload,
  type ShelterPatchPayload,
} from '../api/shelters'
import { toQueryError } from '../lib/queryError'

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

export function useShelterMutations(): ShelterMutationsApi {
  const queryClient = useQueryClient()
  const [cmsError, setCmsError] = useState<string | null>(null)

  const createMutation = useMutation({
    mutationFn: createShelter,
    onSuccess: async () => {
      setCmsError(null)
      await queryClient.invalidateQueries({ queryKey: ['shelters'] })
    },
    onError: (e: unknown) => {
      setCmsError(toQueryError(e)?.message ?? 'Create failed')
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
      await queryClient.invalidateQueries({ queryKey: ['shelters'] })
    },
    onError: (e: unknown) => {
      setCmsError(toQueryError(e)?.message ?? 'Update failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShelter,
    onSuccess: async () => {
      setCmsError(null)
      await queryClient.invalidateQueries({ queryKey: ['shelters'] })
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
