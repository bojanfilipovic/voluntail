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

  const wrap =
    variant === 'card'
      ? 'relative flex h-[min(32vh,15rem)] w-full items-center justify-center p-2 sm:h-64'
      : variant === 'overlay'
        ? 'relative flex h-44 w-full items-center justify-center p-2 sm:h-52'
        : 'relative flex min-h-[11rem] max-h-56 items-center justify-center px-6 py-7 sm:px-10'

  if (n === 0) {
    return (
      <div className={cn(wrap, 'bg-muted', className)}>
        <span className="text-muted-foreground p-6 text-sm">No photo</span>
      </div>
    )
  }

  return (
    <div className={cn(wrap, 'bg-muted', className)}>
      <img
        src={current}
        alt=""
        className={
          variant === 'dialog'
            ? 'max-h-[12.5rem] w-full object-contain object-center'
            : 'h-full w-full object-contain object-center'
        }
        draggable={false}
        loading="lazy"
      />
      {n > 1 ? (
        <>
          <button
            type="button"
            className="bg-background/90 text-foreground ring-border hover:bg-background absolute left-2 z-10 inline-flex size-9 items-center justify-center rounded-full shadow-sm ring-1"
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
            className="bg-background/90 text-foreground ring-border hover:bg-background absolute right-2 z-10 inline-flex size-9 items-center justify-center rounded-full shadow-sm ring-1"
            aria-label="Next photo"
            onClick={(e) => {
              e.stopPropagation()
              go(1)
            }}
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
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
        </>
      ) : null}
    </div>
  )
}

export function AnimalImageGallery(props: Props) {
  const urlsKey = props.urls.join('\0')
  return <AnimalImageGalleryInner key={urlsKey} {...props} />
}
