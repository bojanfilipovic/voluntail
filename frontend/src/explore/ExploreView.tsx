import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Animal } from '@/api/animals'
import { fetchAnimals } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toQueryError } from '@/lib/queryError'
import { animalQueryKeys } from '@/lib/queryKeys'
import { buildDeck } from '@/explore/buildDeck'
import { ExploreFormFields } from '@/explore/components/ExploreFormFields'
import { ExploreSwipeStack } from '@/explore/components/ExploreSwipeStack'
import { MatchMomentOverlay } from '@/explore/components/MatchMomentOverlay'
import { MATCH_MOMENT_PROBABILITY, rollMatchMoment } from '@/explore/matchMomentConfig'
import { useExploreSessionState } from '@/explore/useExploreSessionState'
import { cn } from '@/lib/utils'
import { Heart, Settings } from 'lucide-react'

type Props = {
  onBack: () => void
  onOpenAnimal: (animal: Animal) => void
}

function ExploreShortlistRow({
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
            <Button type="button" size="sm" variant="secondary" onClick={() => onPick(a)}>
              {a.name}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ExploreView({ onBack, onOpenAnimal }: Props) {
  const { session, patch, sessionPassed, setSessionPassed, setRememberNo, setDisplayName } =
    useExploreSessionState()

  const handleRememberNoChange = useCallback(
    (v: boolean) => {
      if (v) {
        if (session && !session.rememberNo) {
          patch((s) => ({
            ...s,
            rememberNo: true,
            passedIds: [...new Set([...s.passedIds, ...sessionPassed])],
          }))
        }
        return
      }
      setRememberNo(false)
    },
    [session, sessionPassed, patch, setRememberNo],
  )

  const [matchAnimal, setMatchAnimal] = useState<Animal | null>(null)
  /** “Yes” without a match roll — out of deck for this visit only. */
  const [yesNotMatchSession, setYesNotMatchSession] = useState<Set<string>>(() => new Set())
  const [lowKeySaveName, setLowKeySaveName] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

  useEffect(() => {
    if (!lowKeySaveName) return
    const t = window.setTimeout(() => setLowKeySaveName(null), 2800)
    return () => window.clearTimeout(t)
  }, [lowKeySaveName])

  const listQuery = useMemo(
    () => ({
      city: null as string | null,
      shelterId: null as string | null,
      species:
        !session || session.speciesMode === 'all' ? null : (session.speciesMode as string | null),
    }),
    [session],
  )

  const {
    data: animals,
    isPending: animalsLoading,
    error: animalsError,
  } = useQuery({
    queryKey: animalQueryKeys.list(listQuery),
    queryFn: () => fetchAnimals(listQuery),
  })

  const effectivePassed = useMemo(() => {
    if (!session) return [] as const
    if (session.rememberNo) return session.passedIds
    return [...sessionPassed] as const
  }, [session, sessionPassed])

  const candidates = useMemo(
    () =>
      buildDeck(animals ?? [], {
        shortlistIds: session?.shortlistIds ?? [],
        passedIds: effectivePassed,
        sessionYesNotMatchIds: [...yesNotMatchSession],
        speciesMode: session?.speciesMode ?? 'all',
      }),
    [animals, session, effectivePassed, yesNotMatchSession],
  )

  const current = candidates[0] ?? null
  const animalsErrorNorm = toQueryError(animalsError)

  const byId = useMemo(() => {
    const m = new Map<string, Animal>()
    for (const a of animals ?? []) m.set(a.id, a)
    return m
  }, [animals])

  const shortlistAnimals = useMemo(() => {
    if (!session) return []
    return session.shortlistIds
      .map((id) => byId.get(id))
      .filter((a): a is Animal => a !== undefined)
  }, [byId, session])


  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && matchAnimal) {
        e.preventDefault()
        setMatchAnimal(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [matchAnimal])

  const startDeck = () => {
    patch((s) => ({ ...s, deckEntered: true }))
  }

  const passCurrent = (id: string) => {
    if (session.rememberNo) {
      patch((s) => ({
        ...s,
        passedIds: s.passedIds.includes(id) ? s.passedIds : [...s.passedIds, id],
      }))
    } else {
      setSessionPassed((prev) => new Set(prev).add(id))
    }
  }

  const likeCurrent = (a: Animal) => {
    if (rollMatchMoment()) {
      patch((s) => ({
        ...s,
        shortlistIds: s.shortlistIds.includes(a.id) ? s.shortlistIds : [...s.shortlistIds, a.id],
      }))
      setMatchAnimal(a)
    } else {
      setYesNotMatchSession((prev) => new Set(prev).add(a.id))
      setLowKeySaveName(a.name)
    }
  }

  const doReset = () => {
    patch((s) => ({ ...s, shortlistIds: [], passedIds: [] }))
    setSessionPassed(new Set())
    setYesNotMatchSession(new Set())
    setMatchAnimal(null)
    setLowKeySaveName(null)
    setResetOpen(false)
  }

  if (animalsErrorNorm) {
    return (
      <div className="flex min-h-0 flex-1 flex-col gap-4 p-4">
        <ExploreToolbar onOpenSettings={() => setSettingsOpen(true)} title="Explore" />
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-destructive">Couldn’t load animals. {animalsErrorNorm.message}</p>
            <Button type="button" className="mt-3" onClick={onBack}>
              Back to directory
            </Button>
          </CardContent>
        </Card>
        <SettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          session={session}
          setDisplayName={setDisplayName}
          patch={patch}
          onRememberNoChange={handleRememberNoChange}
        />
      </div>
    )
  }

  const showSwipeLayout =
    session.deckEntered && !animalsLoading && Boolean(current)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ExploreToolbar onOpenSettings={() => setSettingsOpen(true)} title="Explore" />

      <div
        className={cn(
          'min-h-0 min-w-0 flex-1',
          showSwipeLayout ? 'flex flex-col overflow-hidden' : 'overflow-y-auto p-4',
        )}
      >
        <div
          className={cn(
            'mx-auto w-full max-w-md',
            showSwipeLayout
              ? 'flex min-h-0 min-w-0 flex-1 flex-col gap-2 px-4 py-2'
              : 'flex flex-col gap-6',
          )}
        >
          <ExploreShortlistRow
            animals={shortlistAnimals}
            onPick={onOpenAnimal}
            compact={showSwipeLayout}
          />

          {!session.deckEntered ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Set your preferences, then swipe through real animals from the public directory. A
                <span className="font-medium text-foreground"> match </span>
                (roughly {Math.round(MATCH_MOMENT_PROBABILITY * 10)} in 10 of your yeses) adds to
                <span className="font-medium text-foreground"> your matches</span> and can show the full
                celebration. Other yeses are just for fun and don&apos;t add to your list. Matches stay
                in this browser until you reset.
              </p>
              <ExploreFormFields
                idSuffix="pre"
                displayName={session.displayName}
                onDisplayNameChange={setDisplayName}
                intent={session.intent}
                onIntentChange={(intent) => patch((s) => ({ ...s, intent }))}
                speciesMode={session.speciesMode}
                onSpeciesModeChange={(speciesMode) => patch((s) => ({ ...s, speciesMode }))}
                rememberNo={session.rememberNo}
                onRememberNoChange={handleRememberNoChange}
              />
              <Button type="button" className="w-full" size="lg" onClick={startDeck}>
                Start swiping
              </Button>
            </div>
          ) : (
            (() => {
              if (animalsLoading) {
                return (
                  <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
                    <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading animals…
                  </div>
                )
              }
              if (!current) {
                return (
                  <div className="text-center">
                    <p className="text-foreground text-base font-medium">You&apos;re caught up (for now).</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Try changing filters in settings, or start over to clear your matches and pass history.
                    </p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <Button type="button" onClick={() => setResetOpen(true)}>
                        Reset
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => setSettingsOpen(true)}>
                        Open settings
                      </Button>
                    </div>
                  </div>
                )
              }
              return (
                <div className="min-h-0 w-full min-w-0 flex-1">
                  <ExploreSwipeStack
                    current={current}
                    onPass={() => {
                      if (current) passCurrent(current.id)
                    }}
                    onLike={() => {
                      if (current) likeCurrent(current)
                    }}
                    busy={Boolean(matchAnimal)}
                  />
                </div>
              )
            })()
          )}
        </div>
      </div>

      {lowKeySaveName ? (
        <div
          className="border-border bg-card text-foreground pointer-events-none fixed right-4 bottom-20 left-4 z-40 max-w-md rounded-lg border p-3 text-sm shadow-md sm:bottom-24 sm:left-auto"
          role="status"
        >
          <p className="text-center">
            <span className="font-medium">{lowKeySaveName}</span> — no match this time. Keep swiping.
          </p>
        </div>
      ) : null}

      {matchAnimal ? (
        <MatchMomentOverlay
          animal={matchAnimal}
          displayName={session.displayName}
          onOpen={(a) => {
            onOpenAnimal(a)
            setMatchAnimal(null)
          }}
          onKeepSwiping={() => setMatchAnimal(null)}
        />
      ) : null}

      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        session={session}
        setDisplayName={setDisplayName}
        patch={patch}
        onRememberNoChange={handleRememberNoChange}
      />

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Start over?</DialogTitle>
            <p className="text-muted-foreground text-sm">
              This clears your saved matches and your pass history for the current settings. Your
              display name and filters stay as they are.
            </p>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={doReset}>
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

type ToolbarProps = {
  title: string
  onOpenSettings: () => void
}

function ExploreToolbar({ title, onOpenSettings }: ToolbarProps) {
  return (
    <div className="border-border bg-background/95 flex items-center justify-between gap-2 border-b px-4 py-2">
      <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight">{title}</h2>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        onClick={onOpenSettings}
        aria-label="Explore settings"
      >
        <Settings className="size-4" />
      </Button>
    </div>
  )
}

type SProps = {
  open: boolean
  onOpenChange: (o: boolean) => void
  session: import('@/explore/types').ExplorePersisted
  setDisplayName: (s: string) => void
  patch: (fn: (s: import('@/explore/types').ExplorePersisted) => import('@/explore/types').ExplorePersisted) => void
  onRememberNoChange: (v: boolean) => void
}

function SettingsDialog({ open, onOpenChange, session, setDisplayName, patch, onRememberNoChange }: SProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Explore settings</DialogTitle>
        </DialogHeader>
        <ExploreFormFields
          idSuffix="settings"
          displayName={session.displayName}
          onDisplayNameChange={setDisplayName}
          intent={session.intent}
          onIntentChange={(intent) => patch((s) => ({ ...s, intent }))}
          speciesMode={session.speciesMode}
          onSpeciesModeChange={(speciesMode) => patch((s) => ({ ...s, speciesMode }))}
          rememberNo={session.rememberNo}
          onRememberNoChange={onRememberNoChange}
        />
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
