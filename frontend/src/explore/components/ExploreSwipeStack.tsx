import { useDrag } from '@use-gesture/react'
import type { CSSProperties } from 'react'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { Animal } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { parseAnimalAge } from '@/domain/animalAge'
import { speciesLabel } from '@/domain/species'
import { cn } from '@/lib/utils'
import { Heart, SkipForward, X } from 'lucide-react'

const SWIPE_THRESHOLD = 100
const EXIT_DURATION = 280

type ExitDir = 'left' | 'right' | null

type Props = {
  current: Animal
  onPass: () => void
  onLike: () => void
  onSkip: () => void
  singleCardSkipNudge: boolean
  remaining?: number
  busy?: boolean
  /** Show rare golden glow on this card (rare match outcome). */
  rareCard?: boolean
  /** Current streak count for consecutive matches. */
  streak?: number
}

export function ExploreSwipeStack({
  current,
  onPass,
  onLike,
  onSkip,
  singleCardSkipNudge,
  remaining,
  busy = false,
  rareCard = false,
  streak = 0,
}: Props) {
  const [dragX, setDragX] = useState(0)
  const [exitDir, setExitDir] = useState<ExitDir>(null)
  const [ringPulse, setRingPulse] = useState(false)
  const baseId = useId()
  const [showHint, setShowHint] = useState(true)
  const exitTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [prevId, setPrevId] = useState(current.id)

  // Reset exit state when card changes (React-approved derived state pattern)
  if (prevId !== current.id) {
    setPrevId(current.id)
    setExitDir(null)
    setDragX(0)
    setRingPulse(false)
  }

  useEffect(() => {
    const t = window.setTimeout(() => setShowHint(false), 700)
    return () => window.clearTimeout(t)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (exitTimeout.current) clearTimeout(exitTimeout.current)
    }
  }, [])

  const triggerExit = useCallback((dir: 'left' | 'right', action: () => void) => {
    setExitDir(dir)
    exitTimeout.current = setTimeout(() => {
      action()
    }, EXIT_DURATION)
  }, [])

  const bind = useDrag(
    ({ down, last, movement: [mx] }) => {
      if (busy || exitDir) return
      if (down) {
        setDragX(mx)
        return
      }
      setDragX(0)
      if (last) {
        if (Math.abs(mx) < 6) return
        if (mx < -SWIPE_THRESHOLD) triggerExit('left', onPass)
        else if (mx > SWIPE_THRESHOLD) { setRingPulse(true); triggerExit('right', onLike) }
      }
    },
    { filterTaps: true },
  )

  const handlePass = () => {
    if (exitDir) return
    triggerExit('left', onPass)
  }
  const handleLike = () => {
    if (exitDir) return
    setRingPulse(true)
    triggerExit('right', onLike)
  }

  const likeOpacity = dragX > 0 ? Math.min(1, dragX / 120) : 0
  const passOpacity = dragX < 0 ? Math.min(1, -dragX / 120) : 0

  const exitTranslate = exitDir === 'left' ? '-120%' : exitDir === 'right' ? '120%' : '0'
  const exitRotate = exitDir === 'left' ? '-15deg' : exitDir === 'right' ? '15deg' : '0deg'

  const transformStyle: CSSProperties = exitDir
    ? {
        transform: `translateX(${exitTranslate}) rotate(${exitRotate})`,
        opacity: 0,
        transition: `transform ${EXIT_DURATION}ms ease-out, opacity ${EXIT_DURATION}ms ease-out`,
        touchAction: 'none',
      }
    : {
        transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
        touchAction: 'none',
      }

  return (
    <div className="flex h-full min-h-0 w-full max-w-md flex-1 flex-col">
      {streak >= 2 && (
        <p className="text-center text-xs font-semibold text-amber-600 dark:text-amber-400" role="status">
          {streak} matches in a row!
        </p>
      )}
      {singleCardSkipNudge ? (
        <p className="text-muted-foreground text-center text-xs" role="status">
          Only this animal left. Still unsure? You can pass or try for a match.
        </p>
      ) : remaining != null && remaining > 0 && remaining < 5 ? (
        <p className="text-muted-foreground text-center text-xs">
          Just a few left to discover
        </p>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden pr-0.5">
        <div
          key={current.id}
          className={cn(
            'relative mx-auto w-full animate-card-flip-in motion-reduce:animate-none',
            !exitDir && 'transition-transform duration-200 ease-out motion-reduce:transition-none',
            (busy || !!exitDir) && 'pointer-events-none',
            busy && 'opacity-50',
            showHint && !exitDir && 'animate-swipe-hint motion-reduce:animate-none',
            ringPulse && 'animate-ring-pulse motion-reduce:animate-none',
          )}
          style={transformStyle}
          {...(busy || exitDir ? {} : bind())}
        >
          {/* Floating heart on right-drag */}
          {dragX > 30 && !exitDir && (
            <span
              className="pointer-events-none absolute top-1/3 left-1/2 z-30 -translate-x-1/2 text-2xl motion-reduce:hidden"
              style={{ opacity: Math.min(1, (dragX - 30) / 90), transform: `translateX(-50%) translateY(${-dragX * 0.15}px)` }}
              aria-hidden
            >
              &#128149;
            </span>
          )}
          <div
            className={cn(
              'pointer-events-none absolute top-2 left-2 z-20 rounded border-2 border-emerald-500 px-2 py-1 text-xs font-semibold text-emerald-600 transition-opacity motion-reduce:transition-none',
              exitDir === 'right' && 'opacity-100',
            )}
            style={{ opacity: exitDir === 'right' ? 1 : likeOpacity }}
          >
            YES
          </div>
          <div
            className={cn(
              'pointer-events-none absolute top-2 right-2 z-20 rounded border-2 border-rose-500 px-2 py-1 text-xs font-semibold text-rose-600 transition-opacity motion-reduce:transition-none',
              exitDir === 'left' && 'opacity-100',
            )}
            style={{ opacity: exitDir === 'left' ? 1 : passOpacity }}
          >
            PASS
          </div>
          <Card
            className={cn(
              "w-full overflow-hidden shadow-lg transition-shadow duration-200",
              "motion-reduce:transition-none",
              exitDir === 'right' && 'ring-2 ring-emerald-400',
              exitDir === 'left' && 'ring-2 ring-rose-400',
              rareCard && !exitDir && 'ring-2 ring-yellow-400 animate-rare-glow motion-reduce:animate-none',
            )}
          >
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
            <CardContent className="pt-3 pb-3">
              <p className="text-base font-semibold">{current.name}</p>
              <p className="text-muted-foreground text-sm">
                {speciesLabel(current.species)}{current.city ? ` \u00b7 ${current.city}` : ''}{parseAnimalAge(current.description) ? ` \u00b7 ${parseAnimalAge(current.description)}` : ''}
              </p>
              {current.description ? (
                <p className="text-muted-foreground mt-1 line-clamp-2 text-xs leading-snug">
                  {current.description}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
      <p id={`${baseId}-hint`} className="sr-only">
        Swipe the card, or use Not for me, Skip, or Yes. A rolled match adds the animal to your matches
        list. Skip shows this card again after you see other animals in this round.
      </p>
      <div
        className="bg-background/95 border-border/80 flex shrink-0 w-full max-w-md flex-col gap-2 border-t p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_-4px_rgba(0,0,0,0.06)] sm:mt-0"
        role="group"
        aria-labelledby={`${baseId}-hint`}
      >
        <div className="flex w-full justify-center gap-1.5 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="min-w-0 flex-1 h-12 sm:h-10 rounded-full border-rose-200 bg-rose-50 text-rose-600 shadow-sm transition active:scale-[0.93] hover:bg-rose-100 motion-reduce:transition-none sm:min-w-[4.5rem] sm:flex-initial dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
            onClick={handlePass}
            disabled={busy || !!exitDir}
            aria-label="Not for me"
          >
            <X aria-hidden className="size-5" strokeWidth={2.5} />
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="default"
            className="min-w-0 flex-1 h-10 sm:h-9 rounded-full text-foreground transition active:scale-[0.95] motion-reduce:transition-none sm:min-w-[3.5rem] sm:flex-initial"
            onClick={onSkip}
            disabled={busy || !!exitDir}
            aria-label="Decide later; this animal is shown again after the others in this round"
          >
            <SkipForward aria-hidden className="size-4" />
          </Button>
          <Button
            type="button"
            size="default"
            className="min-w-0 flex-1 h-12 sm:h-10 rounded-full border-emerald-200 bg-emerald-50 text-emerald-600 shadow-sm transition active:scale-[0.93] hover:bg-emerald-100 motion-reduce:transition-none sm:min-w-[4.5rem] sm:flex-initial dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
            onClick={handleLike}
            disabled={busy || !!exitDir}
            aria-label="Yes, try for a match"
          >
            <Heart aria-hidden className="size-5" fill="currentColor" />
          </Button>
        </div>
        <p className="text-muted-foreground text-center text-[0.7rem] leading-tight sm:text-xs">
          Skip = see again later. Not a no.
        </p>
      </div>
    </div>
  )
}
