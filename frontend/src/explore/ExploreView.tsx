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
import { useExploreSessionState } from '@/explore/useExploreSessionState'
import { Heart, Settings } from 'lucide-react'

type Props = {
  onBack: () => void
  onOpenAnimal: (animal: Animal) => void
}

function ExploreShortlistRow({
  animals,
  onPick,
}: {
  animals: Animal[]
  onPick: (a: Animal) => void
}) {
  if (animals.length === 0) return null
  return (
    <div className="border-border bg-muted/20 w-full rounded-lg border p-3">
      <p className="text-muted-foreground flex items-center gap-2 text-xs font-medium">
        <Heart className="size-4" aria-hidden />
        Your picks
      </p>
      <ul className="mt-2 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
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
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [resetOpen, setResetOpen] = useState(false)

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
        speciesMode: session?.speciesMode ?? 'all',
      }),
    [animals, session, effectivePassed],
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
    patch((s) => ({ ...s, shortlistIds: s.shortlistIds.includes(a.id) ? s.shortlistIds : [...s.shortlistIds, a.id] }))
    setMatchAnimal(a)
  }

  const doReset = () => {
    patch((s) => ({ ...s, shortlistIds: [], passedIds: [] }))
    setSessionPassed(new Set())
    setMatchAnimal(null)
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

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ExploreToolbar onOpenSettings={() => setSettingsOpen(true)} title="Explore" />

      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mx-auto flex w-full max-w-md flex-col gap-6">
          <ExploreShortlistRow animals={shortlistAnimals} onPick={onOpenAnimal} />

          {!session.deckEntered ? (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Set your preferences, then swipe through real animals from the public directory. Matches are
                for fun here — your shortlist stays in this browser until you clear it.
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
                      Try changing filters in settings, or start over to clear your shortlist and pass history.
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
              )
            })()
          )}
        </div>
      </div>

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
              This clears your shortlist and your pass history for the current settings. Your display name
              and filters stay as they are.
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
