import { useQuery } from '@tanstack/react-query'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Animal } from '@/api/animals'
import { fetchAllAnimalsPublicForExplore } from '@/api/animals'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toQueryError } from '@/lib/queryError'
import { animalQueryKeys } from '@/lib/queryKeys'
import { buildDeck } from '@/explore/buildDeck'
import { ExploreFormFields } from '@/explore/components/ExploreFormFields'
import { ExploreLocalDataConfirmDialog } from '@/explore/components/ExploreLocalDataConfirmDialog'
import { ExploreSettingsDialog } from '@/explore/components/ExploreSettingsDialog'
import { ExploreShortlistRow } from '@/explore/components/ExploreShortlistRow'
import { ExploreSwipeStack } from '@/explore/components/ExploreSwipeStack'
import { ExploreToolbar } from '@/explore/components/ExploreToolbar'
import { MatchMomentOverlay } from '@/explore/components/MatchMomentOverlay'
import { rollMatchMoment, rollRareMatch } from '@/explore/matchMomentConfig'
import { makeShuffleSeed } from '@/explore/exploreSession'
import { useExploreSessionState } from '@/explore/useExploreSessionState'
import { cn } from '@/lib/utils'

type Props = {
  onBack: () => void
  onOpenAnimal: (animal: Animal) => void
}

const SWIPE_VIEW_TITLE = 'Swipe deck'

export function ExploreView({ onBack, onOpenAnimal }: Props) {
  const { session, patch, sessionPassed, setSessionPassed, setDisplayName } =
    useExploreSessionState()


  const [matchAnimal, setMatchAnimal] = useState<Animal | null>(null)
  const [isRareMatch, setIsRareMatch] = useState(false)
  const [lowKeySaveName, setLowKeySaveName] = useState<string | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [localDataConfirm, setLocalDataConfirm] = useState<null | 'reshuffle' | 'startOver'>(null)
  /** Bumps to rebuild a freshly shuffled deck: Start swiping, reset, or species while in the deck. */
  const [shuffleKey, setShuffleKey] = useState(0)
  const [deckOrder, setDeckOrder] = useState<string[]>([])
  const [singleSkipNudge, setSingleSkipNudge] = useState(false)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!lowKeySaveName) return
    const t = window.setTimeout(() => setLowKeySaveName(null), 2500)
    return () => window.clearTimeout(t)
  }, [lowKeySaveName])

  useEffect(() => {
    if (!singleSkipNudge) return
    const t = window.setTimeout(() => setSingleSkipNudge(false), 3200)
    return () => window.clearTimeout(t)
  }, [singleSkipNudge])

  const listQuery = useMemo(
    () => ({ city: null as string | null, shelterId: null as string | null, species: null }),
    [],
  )

  const {
    data: animals,
    isPending: animalsLoading,
    error: animalsError,
  } = useQuery({
    queryKey: animalQueryKeys.explore(listQuery, session.deckShuffleSeed),
    queryFn: () => fetchAllAnimalsPublicForExplore(listQuery, session.deckShuffleSeed),
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
    })
    const next = base.map((a) => a.id)
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
    patch((s) => ({
      ...s,
      deckEntered: true,
      deckShuffleSeed: makeShuffleSeed(),
    }))
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
      setStreak((s) => s + 1)
      setIsRareMatch(rollRareMatch())
      setMatchAnimal(a)
    } else {
      patch((s) => ({
        ...s,
        yesNotMatchIds: s.yesNotMatchIds.includes(a.id)
          ? s.yesNotMatchIds
          : [...s.yesNotMatchIds, a.id],
      }))
      setStreak(0)
      setLowKeySaveName(a.name)
    }
    setDeckOrder((d) => d.slice(1))
  }

  /** Reshuffle: clear passed + no-match stash, keep matches, rebuild deck. */
  const applyReshuffle = () => {
    patch((s) => ({
      ...s,
      passedIds: [],
      yesNotMatchIds: [],
      deckShuffleSeed: makeShuffleSeed(),
    }))
    setSessionPassed(new Set())
    setMatchAnimal(null)
    setLowKeySaveName(null)
    if (session.deckEntered) setShuffleKey((k) => k + 1)
    setLocalDataConfirm(null)
  }

  /** Start over: clear everything, rebuild deck. */
  const applyStartOver = () => {
    patch((s) => ({
      ...s,
      passedIds: [],
      yesNotMatchIds: [],
      shortlistIds: [],
      deckShuffleSeed: makeShuffleSeed(),
    }))
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
    setStreak(0)
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
        <ExploreSettingsDialog
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          session={session}
          setDisplayName={setDisplayName}
          patch={patch}
          canReshuffle={canReshuffle}
          onRequestReshuffle={requestReshuffle}
          onRequestStartOver={requestStartOver}
        />
        <ExploreLocalDataConfirmDialog
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
        deckMatches={session.deckEntered ? shortlistAnimals : undefined}
        onPickDeckMatch={session.deckEntered ? onOpenAnimal : undefined}
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
          {!session.deckEntered ? (
            <ExploreShortlistRow animals={shortlistAnimals} onPick={onOpenAnimal} />
          ) : null}

          {!session.deckEntered ? (
            <div className="space-y-4">
              <ExploreFormFields
                idSuffix="pre"
                displayName={session.displayName}
                onDisplayNameChange={setDisplayName}
                intent={session.intent}
                onIntentChange={(intent) => patch((s) => ({ ...s, intent }))}
                nameOnly
              />
              <Button
                type="button"
                className="w-full animate-pulse [animation-iteration-count:3] motion-reduce:animate-none transition active:scale-[0.99] motion-reduce:active:scale-100"
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
                    streak={streak}
                  />
                </div>
              )
            })()
          )}
        </div>
      </div>

      {lowKeySaveName ? (
        <div
          className="fixed inset-x-4 bottom-24 z-40 mx-auto max-w-md cursor-pointer animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 motion-reduce:animate-none rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm shadow-lg dark:border-amber-800 dark:bg-amber-950 sm:bottom-36"
          role="status"
          onClick={() => setLowKeySaveName(null)}
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
          rare={isRareMatch}
          onOpen={(a) => {
            onOpenAnimal(a)
            setMatchAnimal(null)
            setIsRareMatch(false)
          }}
          onKeepSwiping={() => { setMatchAnimal(null); setIsRareMatch(false) }}
        />
      ) : null}

      <ExploreSettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        session={session}
        setDisplayName={setDisplayName}
        patch={patch}
        canReshuffle={canReshuffle}
        onRequestReshuffle={requestReshuffle}
        onRequestStartOver={requestStartOver}
      />

      <ExploreLocalDataConfirmDialog
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
