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
import { rollMatchMoment } from '@/explore/matchMomentConfig'
import { shuffleIdsInPlace } from '@/explore/shuffleIds'
import { useExploreSessionState } from '@/explore/useExploreSessionState'
import type { ExploreSpeciesMode } from '@/explore/types'
import { cn } from '@/lib/utils'
import { intentLabel } from '@/explore/labels'
import { Heart, Settings } from 'lucide-react'

type Props = {
  onBack: () => void
  onOpenAnimal: (animal: Animal) => void
}

const SWIPE_VIEW_TITLE = 'Swipe deck'

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
  const [localDataConfirm, setLocalDataConfirm] = useState<null | 'reshuffle' | 'startOver'>(null)
  /** Bumps to rebuild a freshly shuffled deck: Start swiping, reset, or species while in the deck. */
  const [shuffleKey, setShuffleKey] = useState(0)
  const [deckOrder, setDeckOrder] = useState<string[]>([])
  const [singleSkipNudge, setSingleSkipNudge] = useState(false)

  useEffect(() => {
    if (!lowKeySaveName) return
    const t = window.setTimeout(() => setLowKeySaveName(null), 3500)
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
  const hasNoMatchStash = session.yesNotMatchIds.length > 0
  const canReshuffle = hasRejections || hasNoMatchStash

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

  /** Reshuffle: clear passed + no-match stash, keep matches, rebuild deck. */
  const applyReshuffle = () => {
    patch((s) => ({ ...s, passedIds: [], yesNotMatchIds: [] }))
    setSessionPassed(new Set())
    setMatchAnimal(null)
    setLowKeySaveName(null)
    if (session.deckEntered) setShuffleKey((k) => k + 1)
    setLocalDataConfirm(null)
  }

  /** Start over: clear everything, rebuild deck. */
  const applyStartOver = () => {
    patch((s) => ({ ...s, passedIds: [], yesNotMatchIds: [], shortlistIds: [] }))
    setSessionPassed(new Set())
    setMatchAnimal(null)
    setLowKeySaveName(null)
    if (session.deckEntered) setShuffleKey((k) => k + 1)
    setLocalDataConfirm(null)
  }

  const requestReshuffle = () => setLocalDataConfirm('reshuffle')
  const requestStartOver = () => setLocalDataConfirm('startOver')

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
        <ExploreToolbar onOpenSettings={() => setSettingsOpen(true)} title={SWIPE_VIEW_TITLE} />
        <Card>
          <CardContent className="p-4 text-sm">
            <p className="text-foreground">
              We can’t load the animal list right now. Please try again later or go back to the
              directory.
            </p>
            {import.meta.env.DEV ? (
              <p className="text-muted-foreground mt-2 text-xs" role="status">
                {animalsErrorNorm.message}
              </p>
            ) : null}
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
          canReshuffle={canReshuffle}
          onRequestReshuffle={requestReshuffle}
          onRequestStartOver={requestStartOver}
        />
        <LocalDataConfirmDialog
          kind={localDataConfirm}
          onOpenChange={(o) => {
            if (!o) setLocalDataConfirm(null)
          }}
          onConfirmReshuffle={applyReshuffle}
          onConfirmStartOver={applyStartOver}
        />
      </div>
    )
  }

  const showSwipeLayout =
    session.deckEntered && !animalsLoading && Boolean(current)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <ExploreToolbar
        onOpenSettings={() => setSettingsOpen(true)}
        title={SWIPE_VIEW_TITLE}
        displayName={session.deckEntered ? session.displayName : undefined}
        intent={session.deckEntered ? session.intent : undefined}
      />

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
                Pick what fits you below, then tap <span className="font-medium text-foreground">Shuffle deck</span>{' '}
                to browse animals from the directory. Your session stays on this device; open the gear when you
                want to change filters or tidy your lists.
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
                Shuffle deck
              </Button>
            </div>
          ) : (
            (() => {
              if (animalsLoading) {
                return (
                  <div className="text-muted-foreground flex items-center justify-center gap-2 py-12 text-sm">
                    <span className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Loading deck…
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
                      Reshuffle to see all animals again, or start over to reset your matches too.
                    </p>
                    <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center sm:flex-wrap">
                      <Button
                        type="button"
                        disabled={!canReshuffle}
                        onClick={requestReshuffle}
                        className="transition active:scale-[0.99] enabled:opacity-100 disabled:opacity-40 motion-reduce:active:scale-100"
                      >
                        Reshuffle deck
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
                    remaining={deckOrder.length}
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
          className="pointer-events-none fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 motion-reduce:animate-none rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm shadow-lg dark:border-amber-800 dark:bg-amber-950 sm:bottom-36"
          role="status"
        >
          <p className="text-center text-amber-900 dark:text-amber-100">
            <span className="text-base">&#128064;</span>{' '}
            <span className="font-semibold">{lowKeySaveName}</span> — no match this time. Keep swiping!
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
        canReshuffle={canReshuffle}
        onRequestReshuffle={requestReshuffle}
        onRequestStartOver={requestStartOver}
      />

      <LocalDataConfirmDialog
        kind={localDataConfirm}
        onOpenChange={(o) => {
          if (!o) setLocalDataConfirm(null)
        }}
        onConfirmReshuffle={applyReshuffle}
        onConfirmStartOver={applyStartOver}
      />
    </div>
  )
}

type ToolbarProps = {
  title: string
  displayName?: string
  intent?: import('@/explore/types').ExploreIntent
  onOpenSettings: () => void
}

function ExploreToolbar({ title, displayName, intent, onOpenSettings }: ToolbarProps) {
  return (
    <div className="border-border bg-background/95 flex items-center justify-between gap-2 border-b px-4 py-2">
      <div className="min-w-0 flex-1">
        <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight">{title}</h2>
        {displayName ? (
          <p className="text-muted-foreground min-w-0 truncate text-xs">
            {displayName}{intent && intent !== 'undecided' ? ` \u00b7 ${intentLabel(intent)}` : ''}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        onClick={onOpenSettings}
        className="transition active:scale-95 motion-reduce:active:scale-100"
        aria-label="Swipe deck settings"
      >
        <Settings className="size-4" />
      </Button>
    </div>
  )
}

type LocalDataConfirmProps = {
  kind: null | 'reshuffle' | 'startOver'
  onOpenChange: (open: boolean) => void
  onConfirmReshuffle: () => void
  onConfirmStartOver: () => void
}

function LocalDataConfirmDialog({
  kind,
  onOpenChange,
  onConfirmReshuffle,
  onConfirmStartOver,
}: LocalDataConfirmProps) {
  return (
    <Dialog open={kind !== null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        {kind === 'reshuffle' ? (
          <>
            <DialogHeader>
              <DialogTitle>Reshuffle deck?</DialogTitle>
              <p className="text-muted-foreground text-sm">
                All animals come back into the deck — passed ones and &ldquo;no match&rdquo; ones.
                Your saved matches stay.
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={onConfirmReshuffle}>
                Reshuffle
              </Button>
            </DialogFooter>
          </>
        ) : null}
        {kind === 'startOver' ? (
          <>
            <DialogHeader>
              <DialogTitle>Start over?</DialogTitle>
              <p className="text-muted-foreground text-sm">
                This resets everything — your matches, passed animals, and deck.
                Your display name and filters stay the same.
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={onConfirmStartOver}>
                Start over
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
  canReshuffle: boolean
  onRequestReshuffle: () => void
  onRequestStartOver: () => void
}

function SettingsDialog({
  open,
  onOpenChange,
  session,
  setDisplayName,
  onSpeciesModeChange,
  patch,
  onRememberNoChange,
  canReshuffle,
  onRequestReshuffle,
  onRequestStartOver,
}: SProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Swipe deck settings</DialogTitle>
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
          <p className="text-muted-foreground text-xs">Data stays in this browser only. Nothing is sent to a server.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="secondary"
              disabled={!canReshuffle}
              onClick={onRequestReshuffle}
              className="w-full transition active:scale-[0.99] enabled:opacity-100 disabled:opacity-40 sm:w-auto"
            >
              Reshuffle deck
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onRequestStartOver}
              className="w-full text-destructive transition active:scale-[0.99] sm:w-auto"
            >
              Start over
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
