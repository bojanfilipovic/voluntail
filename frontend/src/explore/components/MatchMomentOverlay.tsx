import type { Animal } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { useId } from 'react'

const MESSAGES = [
  "The vibe check passed. (It's mostly you.)",
  'A solid yes — your shortlist is getting more interesting by the second.',
  'We’re not an algorithm, but if we were, this would be a “chef’s kiss”.',
  "Plot twist: you have excellent taste. Who knew?",
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
  displayName: string
  onOpen: (animal: Animal) => void
  onKeepSwiping: () => void
}

export function MatchMomentOverlay({ animal, displayName, onOpen, onKeepSwiping }: Props) {
  const titleId = useId()
  const line = lineForMatch(animal.id)

  return (
    <div
      className="bg-background/85 supports-backdrop-filter:backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal
      aria-labelledby={titleId}
    >
      <div className="ring-border/60 bg-card max-w-md rounded-2xl p-6 text-center shadow-xl ring-1 animate-in zoom-in-95">
        <p id={titleId} className="text-lg font-semibold">
          That’s a match moment!
        </p>
        <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{line}</p>
        <p className="mt-4 text-base">
          {animal.name} is on your list, {displayName}.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button type="button" className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={() => onOpen(animal)}>
            Open {animal.name}
          </Button>
          <Button type="button" variant="secondary" onClick={onKeepSwiping}>
            Keep swiping
          </Button>
        </div>
      </div>
    </div>
  )
}
