import { useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { heartAnimal, unheartAnimal } from '@/api/animals'
import { bumpDirectoryHeartSum, patchAnimalHeartCountInQueryCache } from '@/lib/patchAnimalHeartInQueryCache'
import { isHearted, addHeartedId, removeHeartedId, subscribeHeartsChanged } from '@/lib/heartStorage'
import { cn } from '@/lib/utils'

type Props = {
  animalId: string
  initialCount: number
  className?: string
  /** Narrow vertical layout for list rail (icon above count). */
  compact?: boolean
}

/**
 * `hearted` follows localStorage so list + detail modal never disagree (avoids double POST).
 * `addHeartedId` / `removeHeartedId` run only after heart/unheart POST succeeds.
 * Cached animal lists are patched in-place (no broad invalidation); directory heart sum is adjusted.
 */
export function HeartButton({ animalId, initialCount, className, compact = false }: Props) {
  const queryClient = useQueryClient()
  const [, storageTick] = useState(0)
  useEffect(() => subscribeHeartsChanged(() => storageTick((n) => n + 1)), [])

  const hearted = isHearted(animalId)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)
  const likeInFlightRef = useRef(false)

  useEffect(() => {
    setCount(initialCount)
  }, [initialCount])

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (busy || likeInFlightRef.current) return

      if (hearted) {
        likeInFlightRef.current = true
        setBusy(true)
        try {
          const res = await unheartAnimal(animalId)
          removeHeartedId(animalId)
          setCount(res.heartCount)
          patchAnimalHeartCountInQueryCache(queryClient, animalId, res.heartCount)
          bumpDirectoryHeartSum(queryClient, -1)
        } catch {
          /* keep favorite + count unchanged */
        } finally {
          likeInFlightRef.current = false
          setBusy(false)
        }
        return
      }

      likeInFlightRef.current = true
      setBusy(true)
      try {
        const res = await heartAnimal(animalId)
        addHeartedId(animalId)
        setCount(res.heartCount)
        patchAnimalHeartCountInQueryCache(queryClient, animalId, res.heartCount)
        bumpDirectoryHeartSum(queryClient, 1)
      } catch {
        // No local favorite added; count unchanged from server perspective
      } finally {
        likeInFlightRef.current = false
        setBusy(false)
      }
    },
    [animalId, hearted, busy, queryClient],
  )

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={busy}
      aria-label={hearted ? 'Remove from favorites' : `Like this animal (${count})`}
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium transition-colors',
        compact &&
          'max-sm:inline-flex max-sm:h-8 max-sm:min-h-8 max-sm:flex-row max-sm:items-center max-sm:justify-center max-sm:gap-1 max-sm:rounded-full max-sm:px-2 max-sm:py-0 max-sm:text-[11px] max-sm:leading-none',
        hearted
          ? 'text-rose-600 bg-rose-50 border border-rose-200'
          : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200',
        className,
      )}
    >
      <Heart
        className={cn('size-3.5', compact && 'max-sm:size-4', hearted && 'fill-rose-500 text-rose-500')}
        aria-hidden
      />
      {count > 0 ? <span>{count}</span> : null}
    </button>
  )
}
