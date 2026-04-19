import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { useState, type Dispatch, type SetStateAction } from 'react'
import {
  createShelter,
  deleteShelter,
  type Shelter,
  type ShelterCreatePayload,
} from '../api/shelters'
import { toQueryError } from '../lib/queryError'

export interface ShelterMutationsApi {
  cmsError: string | null
  setCmsError: Dispatch<SetStateAction<string | null>>
  createMutation: UseMutationResult<Shelter, unknown, ShelterCreatePayload>
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
    deleteMutation,
    cmsBusy: createMutation.isPending || deleteMutation.isPending,
  }
}
