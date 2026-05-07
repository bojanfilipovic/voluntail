import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import {
  useCallback,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react'
import { toQueryError } from '@/lib/queryError'

export interface CmsCrudMutationsResult<TEntity, TCreate, TPatch> {
  cmsError: string | null
  setCmsError: Dispatch<SetStateAction<string | null>>
  createMutation: UseMutationResult<TEntity, unknown, TCreate>
  updateMutation: UseMutationResult<
    TEntity,
    unknown,
    { id: string; body: TPatch }
  >
  deleteMutation: UseMutationResult<void, unknown, string>
  cmsBusy: boolean
}

/**
 * Shared CMS create/update/delete + cache invalidation pattern for shelter-like entities.
 */
export function useCmsCrudMutations<
  TEntity,
  TCreate,
  TPatch,
>(args: {
  invalidate: (qc: QueryClient) => Promise<void>
  createFn: (body: TCreate) => Promise<TEntity>
  updateFn: (id: string, body: TPatch) => Promise<TEntity>
  deleteFn: (id: string) => Promise<void>
}): CmsCrudMutationsResult<TEntity, TCreate, TPatch> {
  const { invalidate, createFn, updateFn, deleteFn } = args
  const queryClient = useQueryClient()
  const [cmsError, setCmsError] = useState<string | null>(null)

  const afterSuccess = useCallback(async () => {
    setCmsError(null)
    await invalidate(queryClient)
  }, [invalidate, queryClient])

  const createMutation = useMutation({
    mutationFn: createFn,
    onSuccess: afterSuccess,
    onError: () => {
      /* Create failures use inline errors in dialogs where applicable. */
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string
      body: TPatch
    }) => updateFn(id, body),
    onSuccess: afterSuccess,
    onError: () => {
      /* Update failures use inline errors in edit dialogs where applicable. */
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteFn,
    onSuccess: afterSuccess,
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
