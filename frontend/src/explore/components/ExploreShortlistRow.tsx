import type { Animal } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'

export function ExploreShortlistRow({
  animals,
  onPick,
  compact = false,
}: {
  animals: Animal[]
  onPick: (a: Animal) => void
  /** Cap height so the swipe actions stay on screen on small viewports. */
  compact?: boolean
}) {
  if (animals.length === 0) return null
  return (
    <div
      className={cn(
        'border-border bg-muted/20 w-full shrink-0 rounded-lg border p-3',
        'animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none',
        compact && 'max-h-[30vh] min-h-0 sm:max-h-40',
      )}
    >
      <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <Heart className="size-4" aria-hidden />
        Your matches ({animals.length})
      </p>
      <ul
        className={cn(
          'mt-2 flex flex-wrap gap-2',
          compact ? 'max-h-24 overflow-y-auto sm:max-h-28' : 'max-h-32 overflow-y-auto',
        )}
      >
        {animals.map((a) => (
          <li key={a.id}>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="transition active:scale-95 motion-reduce:active:scale-100"
              onClick={() => onPick(a)}
            >
              {a.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
