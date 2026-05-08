import { Heart } from 'lucide-react'
import { useState, useCallback } from 'react'
import { heartAnimal } from '@/api/animals'
import { isHearted, addHeartedId, removeHeartedId } from '@/lib/heartStorage'
import { cn } from '@/lib/utils'

type Props = {
  animalId: string
  initialCount: number
  className?: string
}

export function HeartButton({ animalId, initialCount, className }: Props) {
  const [hearted, setHearted] = useState(() => isHearted(animalId))
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  const handleClick = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation()
      if (busy) return
      if (hearted) {
        removeHeartedId(animalId)
        setHearted(false)
        return
      }
      setBusy(true)
      setHearted(true)
      setCount((c) => c + 1)
      addHeartedId(animalId)
      try {
        const res = await heartAnimal(animalId)
        setCount(res.heartCount)
      } catch {
        // Optimistic update already applied; keep the local state
      } finally {
        setBusy(false)
      }
    },
    [animalId, hearted, busy],
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
