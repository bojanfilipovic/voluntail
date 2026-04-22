import { useQuery } from '@tanstack/react-query'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Animal } from '@/api/animals'
import { fetchAnimalsPublic } from '@/api/animals'
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
import { shuffleIdsInPlace } from '@/explore/shuffleIds'
import { useExploreSessionState } from '@/explore/useExploreSessionState'
import type { ExploreSpeciesMode } from '@/explore/types'
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

  const handleSpeciesModeChange = (speciesMode: ExploreSpeciesMode) => {
    patch((s) => ({ ...s, speciesMode }))
    if (session.deckEntered) setShuffleKey((k) => k + 1)
  }

  const [matchAnimal, setMatchAnimal] = useState<Animal | null>(null)
  const [lowKeySaveName, setLowKeySaveName] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [localDataConfirm, setLocalDataConfirm] = useState<null | 'clearPassed' | 'clearMatches'>(null)
  /** Bumps to rebuild a freshly shuffled deck: Start swiping, reset, or species while in the deck. */
  const [shuffleKey, setShuffleKey] = useState(0)
  const [deckOrder, setDeckOrder] = useState<string[]>([])
  const [singleSkipNudge, setSingleSkipNudge] = useState(false)

  useEffect(() => {
    if (!lowKeySaveName) return
    const t = window.setTimeout(() => setLowKeySaveName(null), 2800)
    return () => window.clearTimeout(t)
  }, [lowKeySaveName])

  useEffect(() => {
    if (!singleSkipNudge) return
    const t = window.setTimeout(() => setSingleSkipNudge(false), 3200)
    return () => window.clearTimeout(t)
  }, [singleSkipNudge])

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
    queryKey: animalQueryKeys.explore(listQuery),
    queryFn: () => fetchAnimalsPublic(listQuery),
  })

  const publishedAnimals = useMemo(() => (animals ?? []).filter((a) => a.published), [animals])

  const effectivePassed = useMemo(() => {
    if (!session) return [] as const
    if (session.rememberNo) return session.passedIds
    return [...sessionPassed] as const
  }, [session, sessionPassed])

  const latestDeckInputsRef = useRef({ session, effectivePassed, publishedAnimals })
  useLayoutEffect(() => {
    latestDeckInputsRef.current = { session, effectivePassed, publishedAnimals }
  }, [session, effectivePassed, publishedAnimals])

  useLayoutEffect(() => {
    if (!session.deckEntered || animalsLoading) return
    const { session: s, effectivePassed: passed, publishedAnimals: pub } = latestDeckInputsRef.current
    const base = buildDeck(pub, {
      shortlistIds: s.shortlistIds,
      passedIds: passed,
      sessionYesNotMatchIds: s.yesNotMatchIds,
      speciesMode: s.speciesMode,
    })
    const next = shuffleIdsInPlace(base.map((a) => a.id))
    queueMicrotask(() => {
      setDeckOrder(next)
    })
  }, [shuffleKey, session.deckEntered, animalsLoading])

  const byId = useMemo(() => {
    const m = new Map<string, Animal>()
    for (const a of animals ?? []) m.set(a.id, a)
    return m
  }, [animals])

  const topId = (session.deckEntered ? deckOrder : [])[0] ?? null
  const current = topId ? (byId.get(topId) ?? null) : null
  const resolvingStaleTop = useMemo(() => {
    if (!session.deckEntered || animalsLoading || topId == null) return false
    if (byId.size === 0) return false
    return !byId.has(topId)
  }, [session.deckEntered, animalsLoading, topId, byId])

  const shortlistAnimals = useMemo(() => {
    if (!session) return []
    return session.shortlistIds
      .map((id) => byId.get(id))
      .filter((a): a is Animal => a !== undefined)
  }, [byId, session])

  const hasRejections = useMemo(
    () => (session.rememberNo ? session.passedIds.length > 0 : sessionPassed.size > 0),
    [session.rememberNo, session.passedIds, sessionPassed],
  )
  const hasMatches = session.shortlistIds.length > 0

  useEffect(() => {
    if (topId && !animalsLoading && byId.size > 0 && !byId.has(topId)) {
      queueMicrotask(() => {
        setDeckOrder((d) => d.slice(1))
      })
    }
  }, [topId, byId, animalsLoading])

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
    setShuffleKey((k) => k + 1)
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
      patch((s) => ({
        ...s,
        yesNotMatchIds: s.yesNotMatchIds.includes(a.id)
          ? s.yesNotMatchIds
          : [...s.yesNotMatchIds, a.id],
      }))
      setLowKeySaveName(a.name)
    }
    setDeckOrder((d) => d.slice(1))
  }

  /** Clear only “not for me” / passed state (not matches, not “yes, no match” stash). */
  const clearPassedOnly = () => {
    patch((s) => ({ ...s, passedIds: [] }))
    setSessionPassed(new Set())
  }

  const applyClearPassed = () => {
    clearPassedOnly()
    setMatchAnimal(null)
    setLowKeySaveName(null)
    if (session.deckEntered) setShuffleKey((k) => k + 1)
    setLocalDataConfirm(null)
  }

  const applyClearMatches = () => {
    patch((s) => ({ ...s, shortlistIds: [] }))
    if (session.deckEntered) setShuffleKey((k) => k + 1)
    setLocalDataConfirm(null)
  }

  const requestClearPassed = () => {
    if (!hasRejections) return
    setLocalDataConfirm('clearPassed')
  }

  const requestClearMatches = () => {
    if (!hasMatches) return
    setLocalDataConfirm('clearMatches')
  }

  const skipTop = () => {
    if (deckOrder.length <= 1) {
      setSingleSkipNudge(true)
      return
    }
    setDeckOrder((d) => (d.length <= 1 ? d : [...d.slice(1), d[0]!]))
  }

  const onPassSwipe = () => {
    if (!current) return
    passCurrent(current.id)
    setDeckOrder((d) => d.slice(1))
  }

  const onLikeSwipe = () => {
    if (current) likeCurrent(current)
  }

  const animalsErrorNorm = toQueryError(animalsError)

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
          onSpeciesModeChange={handleSpeciesModeChange}
          patch={patch}
          onRememberNoChange={handleRememberNoChange}
          hasRejections={hasRejections}
          hasMatches={hasMatches}
          onRequestClearPassed={requestClearPassed}
          onRequestClearMatches={requestClearMatches}
        />
        <LocalDataConfirmDialog
          kind={localDataConfirm}
          onOpenChange={(o) => {
            if (!o) setLocalDataConfirm(null)
          }}
          onConfirmClearPassed={applyClearPassed}
          onConfirmClearMatches={applyClearMatches}
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
                Set your preferences, then get a <span className="font-medium text-foreground"> shuffled</span> deck
                of real animals from the public directory. A
                <span className="font-medium text-foreground"> match </span>
                (roughly {Math.round(MATCH_MOMENT_PROBABILITY * 10)} in 10 of your yeses) adds to
                <span className="font-medium text-foreground"> your matches</span> and can show the full
                celebration. Other yeses are for fun. In <span className="font-medium">settings</span>, you
                can clear passed animals, clear saved matches, or both — separately.
              </p>
              <ExploreFormFields
                idSuffix="pre"
                displayName={session.displayName}
                onDisplayNameChange={setDisplayName}
                intent={session.intent}
                onIntentChange={(intent) => patch((s) => ({ ...s, intent }))}
                speciesMode={session.speciesMode}
                onSpeciesModeChange={handleSpeciesModeChange}
                rememberNo={session.rememberNo}
                onRememberNoChange={handleRememberNoChange}
              />
              <Button
                type="button"
                className="w-full transition active:scale-[0.99] motion-reduce:active:scale-100"
                size="lg"
                onClick={startDeck}
              >
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
              if (resolvingStaleTop) {
                return (
                  <div className="text-muted-foreground flex items-center justify-center py-8 text-sm">
                    Updating…
                  </div>
                )
              }
              if (deckOrder.length === 0 || !current) {
                return (
                  <div className="text-center">
                    <p className="text-foreground text-base font-medium">You&apos;re caught up (for now).</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Try a different filter in settings, or clear only the animals you passed (in settings
                      or below) to get a shuffled run again. Your “yes, no match” and saved matches stay
                      unless you clear those in settings.
                    </p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <Button
                        type="button"
                        disabled={!hasRejections}
                        title={hasRejections ? undefined : 'No passed animals to clear'}
                        onClick={requestClearPassed}
                        className="transition active:scale-[0.99] enabled:opacity-100 disabled:opacity-40 motion-reduce:active:scale-100"
                      >
                        Clear passed
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
                    onPass={onPassSwipe}
                    onLike={onLikeSwipe}
                    onSkip={skipTop}
                    singleCardSkipNudge={singleSkipNudge}
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
          className="border-border bg-card text-foreground pointer-events-none fixed right-4 bottom-20 left-4 z-40 max-w-md animate-in slide-in-from-bottom-3 duration-200 zoom-in-95 motion-reduce:animate-none rounded-lg border p-3 text-sm shadow-md sm:bottom-32 sm:left-auto"
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
        onSpeciesModeChange={handleSpeciesModeChange}
        patch={patch}
        onRememberNoChange={handleRememberNoChange}
        hasRejections={hasRejections}
        hasMatches={hasMatches}
        onRequestClearPassed={requestClearPassed}
        onRequestClearMatches={requestClearMatches}
      />

      <LocalDataConfirmDialog
        kind={localDataConfirm}
        onOpenChange={(o) => {
          if (!o) setLocalDataConfirm(null)
        }}
        onConfirmClearPassed={applyClearPassed}
        onConfirmClearMatches={applyClearMatches}
      />
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
        className="transition active:scale-95 motion-reduce:active:scale-100"
        aria-label="Explore settings"
      >
        <Settings className="size-4" />
      </Button>
    </div>
  )
}

type LocalDataConfirmProps = {
  kind: null | 'clearPassed' | 'clearMatches'
  onOpenChange: (open: boolean) => void
  onConfirmClearPassed: () => void
  onConfirmClearMatches: () => void
}

function LocalDataConfirmDialog({
  kind,
  onOpenChange,
  onConfirmClearPassed,
  onConfirmClearMatches,
}: LocalDataConfirmProps) {
  return (
    <Dialog open={kind !== null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        {kind === 'clearPassed' ? (
          <>
            <DialogHeader>
              <DialogTitle>Clear passed animals?</DialogTitle>
              <p className="text-muted-foreground text-sm">
                This only forgets animals you marked <span className="font-medium text-foreground">not for me</span>
                . It does <span className="font-medium text-foreground">not</span> remove your saved matches
                or your &ldquo;yes, no match this time&rdquo; list. Display name and filters stay the same.
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={onConfirmClearPassed}>
                Clear passed
              </Button>
            </DialogFooter>
          </>
        ) : null}
        {kind === 'clearMatches' ? (
          <>
            <DialogHeader>
              <DialogTitle>Clear saved matches?</DialogTitle>
              <p className="text-muted-foreground text-sm">
                This removes every animal from your saved matches list in this browser. It does not change
                passed animals or your &ldquo;yes, no match this time&rdquo; list.
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={onConfirmClearMatches}>
                Clear matches
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

type SProps = {
  open: boolean
  onOpenChange: (o: boolean) => void
  session: import('@/explore/types').ExplorePersisted
  setDisplayName: (s: string) => void
  onSpeciesModeChange: (m: import('@/explore/types').ExploreSpeciesMode) => void
  patch: (fn: (s: import('@/explore/types').ExplorePersisted) => import('@/explore/types').ExplorePersisted) => void
  onRememberNoChange: (v: boolean) => void
  hasRejections: boolean
  hasMatches: boolean
  onRequestClearPassed: () => void
  onRequestClearMatches: () => void
}

function SettingsDialog({
  open,
  onOpenChange,
  session,
  setDisplayName,
  onSpeciesModeChange,
  patch,
  onRememberNoChange,
  hasRejections,
  hasMatches,
  onRequestClearPassed,
  onRequestClearMatches,
}: SProps) {
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
          onSpeciesModeChange={onSpeciesModeChange}
          rememberNo={session.rememberNo}
          onRememberNoChange={onRememberNoChange}
        />
        <div className="grid gap-2 border-t pt-4">
          <p className="text-sm font-medium">Local data in this browser</p>
          <p className="text-muted-foreground text-xs">Reset each list separately. Nothing is sent to a server.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="secondary"
              disabled={!hasRejections}
              title={hasRejections ? undefined : 'No passed animals to clear'}
              onClick={onRequestClearPassed}
              className="w-full transition active:scale-[0.99] enabled:opacity-100 disabled:opacity-40 sm:w-auto"
            >
              Clear passed (not for me)
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={!hasMatches}
              title={hasMatches ? undefined : 'No saved matches to clear'}
              onClick={onRequestClearMatches}
              className="w-full transition active:scale-[0.99] enabled:opacity-100 disabled:opacity-40 sm:w-auto"
            >
              Clear saved matches
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
