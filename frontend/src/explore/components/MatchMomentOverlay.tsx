import type { Animal } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { useId } from 'react'
import { cn } from '@/lib/utils'

const MESSAGES = [
  "The vibe check passed. (It's mostly you.)",
  'A solid match \u2014 your list of wins just got more interesting.',
  'We\u2019re not an algorithm, but if we were, this would be a \u201Cchef\u2019s kiss\u201D.',
  'Plot twist: you have excellent taste. Who knew?',
  'This one was meant to be. Probably. We\u2019re not scientists.',
  'Look at you, collecting cuties like they\u2019re trading cards.',
] as const

function lineForMatch(animalId: string): (typeof MESSAGES)[number] {
  let h = 0
  for (let i = 0; i < animalId.length; i++) {
    h = (h * 33 + animalId.charCodeAt(i)) >>> 0
  }
  return MESSAGES[h % MESSAGES.length]!
}

type Props = {
  animal: Animal
  onOpen: (animal: Animal) => void
  onKeepSwiping: () => void
  rare?: boolean
}

export function MatchMomentOverlay({ animal, onOpen, onKeepSwiping, rare = false }: Props) {
  const titleId = useId()
  const line = lineForMatch(animal.id)

  return (
    <div
      className="bg-background/80 supports-backdrop-filter:backdrop-blur-md fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
    >
      <div
        className={cn(
          'bg-card max-w-md overflow-hidden rounded-2xl text-center shadow-2xl ring-2',
          rare ? 'ring-yellow-400/80 animate-rare-glow' : 'ring-emerald-300/60',
          'animate-in zoom-in-90 slide-in-from-bottom-4 duration-300 motion-reduce:animate-none',
        )}
      >
        <div className="bg-muted/60 relative flex h-44 w-full items-center justify-center p-2 sm:h-52">
          {animal.imageUrl ? (
            <img
              src={animal.imageUrl}
              alt=""
              className="max-h-full w-full object-contain object-center"
            />
          ) : (
            <span className="text-muted-foreground p-6 text-sm">No photo</span>
          )}
          {/* Confetti-like sparkles */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            <span className="absolute top-3 left-4 animate-bounce text-lg delay-100">&#10024;</span>
            <span className="absolute top-6 right-6 animate-bounce text-xl delay-200">&#127881;</span>
            <span className="absolute bottom-4 left-8 animate-bounce text-base delay-300">&#128150;</span>
            <span className="absolute right-4 bottom-6 animate-bounce text-lg">&#10024;</span>
          </div>
        </div>
        <div className="p-6">
          <p id={titleId} className="animate-in fade-in zoom-in-50 text-xl font-bold tracking-tight duration-500 motion-reduce:animate-none">
            <span className={cn(
              'bg-clip-text text-transparent',
              rare
                ? 'bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500',
            )}>
              {rare ? 'Rare match!' : "It\u2019s a match!"}
            </span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{line}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              className="bg-emerald-600 text-white transition active:scale-[0.98] motion-reduce:active:scale-100 hover:bg-emerald-700"
              onClick={() => onOpen(animal)}
            >
              Open {animal.name}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="transition active:scale-[0.98] motion-reduce:active:scale-100"
              onClick={onKeepSwiping}
            >
              Keep swiping
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
