import { useQueryClient } from '@tanstack/react-query'
import { Heart } from 'lucide-react'
import { useState, useCallback, useEffect, useRef } from 'react'
import { heartAnimal, unheartAnimal } from '@/api/animals'
import { isHearted, addHeartedId, removeHeartedId, subscribeHeartsChanged } from '@/lib/heartStorage'
import { animalQueryKeys } from '@/lib/queryKeys'
import { cn } from '@/lib/utils'

type Props = {
  animalId: string
  initialCount: number
  className?: string
}

/**
 * `hearted` follows localStorage so list + detail modal never disagree (avoids double POST).
 * `addHeartedId` / `removeHeartedId` run only after heart/unheart POST succeeds.
 * Animals query is invalidated so list counts and header totals stay in sync.
 */
export function HeartButton({ animalId, initialCount, className }: Props) {
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
          void queryClient.invalidateQueries({ queryKey: animalQueryKeys.root })
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
        void queryClient.invalidateQueries({ queryKey: animalQueryKeys.root })
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
        hearted
          ? 'text-rose-600 bg-rose-50 border border-rose-200'
          : 'text-muted-foreground hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200',
        className,
      )}
    >
      <Heart
        className={cn('size-3.5', hearted && 'fill-rose-500 text-rose-500')}
        aria-hidden
      />
      {count > 0 ? <span>{count}</span> : null}
    </button>
  )
}
