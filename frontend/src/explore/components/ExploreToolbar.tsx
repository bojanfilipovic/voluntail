import { useState } from 'react'
import type { Animal } from '@/api/animals'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { EXPLORE_INTENT_MESSAGE_KEYS } from '@/explore/labels'
import type { ExploreIntent } from '@/explore/types'
import { useI18n } from '@/i18n/I18nContext'
import { Heart, Settings } from 'lucide-react'

type Props = {
  title: string
  displayName?: string
  intent?: ExploreIntent
  onOpenSettings: () => void
  /** Session matches while swiping — compact heart + count beside settings */
  deckMatches?: Animal[]
  onPickDeckMatch?: (a: Animal) => void
}

export function ExploreToolbar({
  title,
  displayName,
  intent,
  onOpenSettings,
  deckMatches,
  onPickDeckMatch,
}: Props) {
  const { t } = useI18n()
  const [matchesOpen, setMatchesOpen] = useState(false)
  const matchRows = deckMatches ?? []
  const pick = onPickDeckMatch
  const showMatches = matchRows.length > 0 && pick
  const n = matchRows.length

  return (
    <div className="border-border bg-background/95 flex items-center justify-between gap-2 border-b px-4 py-2">
      <div className="min-w-0 flex-1">
        <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight">{title}</h2>
        {displayName ? (
          <p className="text-muted-foreground min-w-0 truncate text-xs">
            {displayName}{intent && intent !== 'undecided' ? ` \u00b7 ${t(EXPLORE_INTENT_MESSAGE_KEYS[intent])}` : ''}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        {showMatches ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 gap-1 px-2"
              onClick={() => setMatchesOpen(true)}
              aria-label={t('explore.toolbar.matchesAria', { count: n })}
            >
              <Heart className="size-4 shrink-0" aria-hidden />
              <span className="text-xs font-semibold tabular-nums">{n}</span>
            </Button>
            <Dialog open={matchesOpen} onOpenChange={setMatchesOpen}>
              <DialogContent className="flex max-h-[min(85dvh,calc(100dvh-3rem))] flex-col gap-0 overflow-hidden p-4 pt-5 sm:max-w-sm">
                <DialogHeader className="shrink-0 pr-8">
                  <DialogTitle>{t('explore.toolbar.matchesTitle')}</DialogTitle>
                  <DialogDescription>{t('explore.toolbar.matchesHint')}</DialogDescription>
                </DialogHeader>
                <ul className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
                  {matchRows.map((a) => (
                    <li key={a.id}>
                      <Button
                        type="button"
                        variant="secondary"
                        className="h-auto w-full justify-start py-2 text-left font-normal"
                        onClick={() => {
                          pick(a)
                          setMatchesOpen(false)
                        }}
                      >
                        {a.name}
                      </Button>
                    </li>
                  ))}
                </ul>
              </DialogContent>
            </Dialog>
          </>
        ) : null}
        <Button
          type="button"
          size="icon-sm"
          variant="secondary"
          onClick={onOpenSettings}
          className="transition active:scale-95 motion-reduce:active:scale-100"
          aria-label={t('explore.toolbar.settingsAria')}
        >
          <Settings className="size-4" />
        </Button>
      </div>
    </div>
  )
}
