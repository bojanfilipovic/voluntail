import { useDrag } from '@use-gesture/react'
import type { CSSProperties } from 'react'
import { useId, useState } from 'react'
import type { Animal } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { speciesLabel } from '@/domain/species'
import { cn } from '@/lib/utils'
import { ThumbsDown, ThumbsUp } from 'lucide-react'

const SWIPE_THRESHOLD = 100

type Props = {
  current: Animal
  onPass: () => void
  onLike: () => void
  busy?: boolean
}

export function ExploreSwipeStack({ current, onPass, onLike, busy = false }: Props) {
  const [dragX, setDragX] = useState(0)
  const baseId = useId()

  const bind = useDrag(
    ({ down, last, movement: [mx] }) => {
      if (busy) return
      if (down) {
        setDragX(mx)
        return
      }
      setDragX(0)
      if (last) {
        if (Math.abs(mx) < 6) return
        if (mx < -SWIPE_THRESHOLD) onPass()
        else if (mx > SWIPE_THRESHOLD) onLike()
      }
    },
    { filterTaps: true },
  )

  const likeOpacity = dragX > 0 ? Math.min(1, dragX / 120) : 0
  const passOpacity = dragX < 0 ? Math.min(1, -dragX / 120) : 0

  const transformStyle: CSSProperties = {
    transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
    touchAction: 'none',
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center">
      <div
        className={cn('relative w-full', busy && 'pointer-events-none opacity-50')}
        style={transformStyle}
        {...(busy ? {} : bind())}
      >
        <div
          className="pointer-events-none absolute top-2 left-2 z-20 rounded border-2 border-emerald-500 px-2 py-1 text-xs font-semibold text-emerald-600"
          style={{ opacity: likeOpacity }}
        >
          YES
        </div>
        <div
          className="pointer-events-none absolute top-2 right-2 z-20 rounded border-2 border-rose-500 px-2 py-1 text-xs font-semibold text-rose-600"
          style={{ opacity: passOpacity }}
        >
          PASS
        </div>
        <Card className="w-full overflow-hidden shadow-lg">
          <div className="bg-muted/60 relative flex max-h-80 min-h-60 w-full items-center justify-center p-2">
            {current.imageUrl ? (
              <img
                src={current.imageUrl}
                alt=""
                className="max-h-80 w-full object-contain object-center"
                draggable={false}
              />
            ) : (
              <span className="text-muted-foreground p-6 text-sm">No photo</span>
            )}
          </div>
          <CardContent className="pt-3">
            <p className="text-base font-semibold">{current.name}</p>
            <p className="text-muted-foreground text-sm">{speciesLabel(current.species)}</p>
          </CardContent>
        </Card>
      </div>
      <p id={`${baseId}-hint`} className="sr-only">
        Swipe the card, or use Not for me and Yes. Yes adds the animal to your shortlist.
      </p>
      <div
        className="mt-4 flex w-full max-w-md justify-center gap-3"
        role="group"
        aria-labelledby={`${baseId}-hint`}
      >
        <Button
          type="button"
          variant="outline"
          className="min-w-[7rem] border-rose-500/30 text-rose-700"
          onClick={onPass}
          disabled={busy}
          aria-label="Not for me"
        >
          <ThumbsDown aria-hidden className="size-4" />
          Not for me
        </Button>
        <Button
          type="button"
          className="min-w-[7rem] bg-emerald-600 text-white hover:bg-emerald-700"
          onClick={onLike}
          disabled={busy}
          aria-label="Yes, add to shortlist"
        >
          <ThumbsUp aria-hidden className="size-4" />
          Yes
        </Button>
      </div>
    </div>
  )
}
