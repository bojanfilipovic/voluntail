import type { Animal } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Heart } from 'lucide-react'

/** Pre–shuffle deck only; matches while swiping live in ExploreToolbar */
export function ExploreShortlistRow({
  animals,
  onPick,
}: {
  animals: Animal[]
  onPick: (a: Animal) => void
}) {
  if (animals.length === 0) return null
  return (
    <div
      className={cn(
        'border-border bg-muted/20 w-full shrink-0 rounded-lg border p-3',
        'animate-in fade-in slide-in-from-bottom-2 duration-300 motion-reduce:animate-none',
      )}
    >
      <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <Heart className="size-4" aria-hidden />
        Your matches ({animals.length})
      </p>
      <ul className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
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
