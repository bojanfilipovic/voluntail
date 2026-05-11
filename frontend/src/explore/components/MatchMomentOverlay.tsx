import type { Animal } from '@/api/animals'
import { AnimalImageGallery } from '@/components/AnimalImageGallery'
import { effectiveAnimalImageUrls } from '@/domain/animalGallery'
import { Button } from '@/components/ui/button'
import { useId } from 'react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/I18nContext'
import type { MessageKey } from '@/i18n/nl'

const MATCH_LINE_KEYS = [
  'explore.match.line0',
  'explore.match.line1',
  'explore.match.line2',
  'explore.match.line3',
  'explore.match.line4',
  'explore.match.line5',
] as const satisfies readonly MessageKey[]

function lineForMatch(animalId: string, t: (k: MessageKey) => string): string {
  let h = 0
  for (let i = 0; i < animalId.length; i++) {
    h = (h * 33 + animalId.charCodeAt(i)) >>> 0
  }
  return t(MATCH_LINE_KEYS[h % MATCH_LINE_KEYS.length]!)
}

type Props = {
  animal: Animal
  onOpen: (animal: Animal) => void
  onKeepSwiping: () => void
  rare?: boolean
}

export function MatchMomentOverlay({ animal, onOpen, onKeepSwiping, rare = false }: Props) {
  const { t } = useI18n()
  const titleId = useId()
  const line = lineForMatch(animal.id, t)

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
        <div className="relative">
          <AnimalImageGallery
            variant="overlay"
            urls={effectiveAnimalImageUrls(animal)}
            className="bg-muted/60"
          />
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
              {rare ? t('explore.match.rare') : t('explore.match.normal')}
            </span>
          </p>
          <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{line}</p>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Button
              type="button"
              className="bg-emerald-600 text-white transition active:scale-[0.98] motion-reduce:active:scale-100 hover:bg-emerald-700"
              onClick={() => onOpen(animal)}
            >
              {t('explore.match.openAnimal', { name: animal.name })}
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="transition active:scale-[0.98] motion-reduce:active:scale-100"
              onClick={onKeepSwiping}
            >
              {t('explore.match.keepSwiping')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
