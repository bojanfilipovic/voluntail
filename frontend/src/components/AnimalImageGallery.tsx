import { cn } from '@/lib/utils'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useState } from 'react'

type Props = {
  urls: string[]
  /** Layout preset for container height */
  variant?: 'dialog' | 'card' | 'overlay'
  className?: string
}

/** Remount when URLs change so slide index resets without an effect. */
function AnimalImageGalleryInner({ urls, variant = 'dialog', className }: Props) {
  const [index, setIndex] = useState(0)
  const n = urls.length
  const safeIdx = n === 0 ? 0 : Math.min(index, n - 1)
  const current = urls[safeIdx]

  const go = useCallback(
    (delta: number) => {
      if (n <= 1) return
      setIndex((i) => (i + delta + n) % n)
    },
    [n],
  )

  const showThumbStrip = n > 1 && variant !== 'overlay'
  const showDotStrip = n > 1 && variant === 'overlay'
  const framedHero = variant === 'dialog' || variant === 'card'

  /** Main photo region — `card` uses cover in a fixed frame; `dialog` uses contain; overlay is compact. */
  const stageOnly =
    variant === 'card'
      ? 'relative flex w-full items-center justify-center bg-transparent px-0 pt-0 pb-1 sm:pb-1.5'
      : variant === 'overlay'
        ? 'relative flex h-48 w-full items-center justify-center bg-muted p-2 sm:h-56'
        : cn(
            'relative flex w-full items-center justify-center bg-muted px-3 pt-4 pb-2 sm:px-5 sm:pt-5 sm:pb-3',
            showThumbStrip
              ? 'min-h-[17rem] h-[min(46vh,26rem)] sm:min-h-[19rem] sm:h-[min(50vh,30rem)]'
              : 'min-h-[16rem] h-[min(52vh,28rem)] sm:min-h-[18rem] sm:h-[min(56vh,34rem)]',
          )

  const emptyWrap =
    variant === 'card'
      ? 'relative flex h-[min(52vh,26rem)] w-full items-center justify-center rounded-xl bg-muted/80 ring-1 ring-border/40 sm:h-[min(54vh,28rem)]'
      : variant === 'overlay'
        ? 'relative flex h-48 w-full items-center justify-center bg-muted p-2 sm:h-56'
        : 'relative flex min-h-[14rem] h-[min(48vh,26rem)] w-full items-center justify-center bg-muted px-6 py-8 sm:min-h-[16rem] sm:h-[min(52vh,30rem)] sm:px-10'

  if (n === 0) {
    return (
      <div className={cn(emptyWrap, className)}>
        <span className="text-muted-foreground p-6 text-sm">No photo</span>
      </div>
    )
  }

  const heroMaxClass = showThumbStrip
    ? 'max-h-[min(40vh,22rem)] w-full sm:max-h-[min(44vh,28rem)]'
    : 'max-h-[min(48vh,28rem)] w-full sm:max-h-[min(52vh,34rem)]'

  const dialogImgClass = cn('block object-contain object-center', heroMaxClass)
  const cardImgClass =
    'pointer-events-none absolute inset-0 block h-full w-full object-cover object-center'

  function imgClassPlain(v: typeof variant): string {
    if (v === 'overlay') return 'max-h-full w-full object-contain object-center'
    return 'h-full w-full object-contain object-center'
  }

  const navBtnClass =
    'bg-background/95 text-foreground ring-border hover:bg-background z-10 inline-flex size-9 items-center justify-center rounded-full shadow-md ring-1'

  const stageInner = (
    <div className={cn(stageOnly, !showThumbStrip && variant === 'dialog' && 'bg-muted')}>
      {framedHero ? (
        variant === 'card' ? (
          <div
            className={cn(
              'relative mx-auto h-[min(52vh,26rem)] w-full max-w-md overflow-hidden rounded-xl bg-muted/40 shadow-sm ring-1 ring-border/60 sm:h-[min(54vh,28rem)] sm:max-w-lg',
            )}
          >
            <img src={current} alt="" className={cardImgClass} draggable={false} loading="lazy" />
            {n > 1 ? (
              <>
                <button
                  type="button"
                  className={cn(navBtnClass, 'absolute top-1/2 left-2 -translate-y-1/2 sm:left-3')}
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(-1)
                  }}
                >
                  <ChevronLeft className="size-5" aria-hidden />
                </button>
                <button
                  type="button"
                  className={cn(navBtnClass, 'absolute top-1/2 right-2 -translate-y-1/2 sm:right-3')}
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation()
                    go(1)
                  }}
                >
                  <ChevronRight className="size-5" aria-hidden />
                </button>
              </>
            ) : null}
          </div>
        ) : (
          <div className="relative mx-auto w-full max-w-lg overflow-hidden rounded-xl bg-muted/60 shadow-sm ring-1 ring-border/60 sm:max-w-xl">
            <img src={current} alt="" className={dialogImgClass} draggable={false} loading="lazy" />
          </div>
        )
      ) : (
        <img src={current} alt="" className={imgClassPlain(variant)} draggable={false} loading="lazy" />
      )}
      {n > 1 && variant !== 'card' ? (
        <>
          <button
            type="button"
            className={cn(navBtnClass, 'absolute top-1/2 left-2 -translate-y-1/2 sm:left-3')}
            aria-label="Previous photo"
            onClick={(e) => {
              e.stopPropagation()
              go(-1)
            }}
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            className={cn(navBtnClass, 'absolute top-1/2 right-2 -translate-y-1/2 sm:right-3')}
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          {showDotStrip ? (
            <div className="pointer-events-none absolute bottom-2 left-1/2 z-10 flex -translate-x-1/2 gap-1">
              {urls.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'size-1.5 rounded-full bg-foreground/25',
                    i === safeIdx && 'bg-foreground/70',
                  )}
                />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  )

  if (!showThumbStrip) {
    return <div className={cn(className)}>{stageInner}</div>
  }

  return (
    <div
      className={cn(
        'flex w-full flex-col',
        variant === 'card' ? 'bg-card' : 'bg-muted',
        className,
      )}
    >
      {stageInner}
      <div
        className={cn(
          'border-border flex max-w-full shrink-0 justify-center gap-2 overflow-x-auto border-t px-3 py-2.5',
          variant === 'card' ? 'border-border/60 bg-muted/25' : 'bg-background/40',
        )}
        role="tablist"
        aria-label="Photo thumbnails"
      >
        <span className="sr-only">Multiple photos — tap a thumbnail or use arrows above.</span>
        {urls.map((u, i) => (
          <button
            key={`${i}-${u.slice(-32)}`}
            type="button"
            role="tab"
            aria-selected={i === safeIdx}
            className={cn(
              'border-border shrink-0 overflow-hidden rounded-lg border-2 shadow-sm transition-[opacity,border-color]',
              variant === 'card' ? 'size-12 sm:size-11' : 'size-11',
              i === safeIdx ? 'border-primary ring-primary/30 ring-offset-background ring-2 ring-offset-1' : 'opacity-80 hover:opacity-100',
            )}
            aria-label={`Photo ${i + 1} of ${n}`}
            onClick={(e) => {
              e.stopPropagation()
              setIndex(i)
            }}
          >
            <img src={u} alt="" className="size-full object-cover" loading="lazy" />
          </button>
        ))}
      </div>
    </div>
  )
}

export function AnimalImageGallery(props: Props) {
  const urlsKey = props.urls.join('\0')
  return <AnimalImageGalleryInner key={urlsKey} {...props} />
}
