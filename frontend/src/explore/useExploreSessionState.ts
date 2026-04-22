import { useCallback, useState } from 'react'
import { clearStoredPassedIds, loadExploreSession, saveExploreSession } from '@/explore/exploreSession'
import { pickFunnyDisplayName } from '@/explore/funnyDisplayNames'
import type { ExplorePersisted } from '@/explore/types'

export function useExploreSessionState() {
  const [session, setSession] = useState<ExplorePersisted>(loadExploreSession)
  const [sessionPassed, setSessionPassed] = useState<Set<string>>(() => new Set())

  const patch = useCallback((fn: (s: ExplorePersisted) => ExplorePersisted) => {
    setSession((prev) => {
      const next = fn(prev)
      saveExploreSession(next)
      return next
    })
  }, [])

  const setRememberNo = useCallback(
    (on: boolean) => {
      patch((s) => {
        if (s.rememberNo && !on) {
          return clearStoredPassedIds({ ...s, rememberNo: false })
        }
        return { ...s, rememberNo: on }
      })
    },
    [patch],
  )

  const setDisplayName = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      patch((s) => ({
        ...s,
        displayName: trimmed || pickFunnyDisplayName(),
      }))
    },
    [patch],
  )

  return {
    session,
    sessionPassed,
    setSessionPassed,
    patch,
    setRememberNo,
    setDisplayName,
  }
}
