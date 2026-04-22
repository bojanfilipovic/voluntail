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
    <div className="flex h-full min-h-0 w-full max-w-md flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5">
        <div
          className={cn('relative mx-auto w-full', busy && 'pointer-events-none opacity-50')}
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
            <div className="bg-muted/60 relative flex h-[min(32vh,15rem)] w-full items-center justify-center p-2 sm:h-64">
              {current.imageUrl ? (
                <img
                  src={current.imageUrl}
                  alt=""
                  className="h-full w-full object-contain object-center"
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
      </div>
      <p id={`${baseId}-hint`} className="sr-only">
        Swipe the card, or use Not for me and Yes. A match adds the animal to your matches.
      </p>
      <div
        className="bg-background/95 border-border/80 flex shrink-0 w-full max-w-md justify-center gap-2 border-t p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.06)] sm:mt-0 sm:gap-3"
        role="group"
        aria-labelledby={`${baseId}-hint`}
      >
        <Button
          type="button"
          variant="outline"
          size="default"
          className="min-w-0 flex-1 border-rose-500/30 text-rose-700 sm:min-w-[6.5rem] sm:flex-initial"
          onClick={onPass}
          disabled={busy}
          aria-label="Not for me"
        >
          <ThumbsDown aria-hidden className="size-4" />
          Not for me
        </Button>
        <Button
          type="button"
          size="default"
          className="min-w-0 flex-1 bg-emerald-600 text-white hover:bg-emerald-700 sm:min-w-[6.5rem] sm:flex-initial"
          onClick={onLike}
          disabled={busy}
          aria-label="Yes, try for a match"
        >
          <ThumbsUp aria-hidden className="size-4" />
          Yes
        </Button>
      </div>
    </div>
  )
}
