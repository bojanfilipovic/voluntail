import { useCallback, useState } from 'react'
import {
  getInitialAppView,
  replaceAppViewInUrl,
  type AppView,
} from '@/directory/urlState'
import { EXPLORE_STORAGE_KEY } from '@/explore/types'

export function useAppViewNavigation() {
  const [appView, setAppView] = useState<AppView>(getInitialAppView)
  const [exploreHasMatches, setExploreHasMatches] = useState(() => {
    try {
      const raw = localStorage.getItem(EXPLORE_STORAGE_KEY)
      if (!raw) return false
      const o = JSON.parse(raw) as { shortlistIds?: unknown }
      return Array.isArray(o.shortlistIds) && o.shortlistIds.length > 0
    } catch {
      return false
    }
  })

  const navigateView = useCallback((next: AppView) => {
    setAppView(next)
    replaceAppViewInUrl(next)
    try {
      const raw = localStorage.getItem(EXPLORE_STORAGE_KEY)
      if (raw) {
        const o = JSON.parse(raw) as { shortlistIds?: unknown }
        setExploreHasMatches(Array.isArray(o.shortlistIds) && o.shortlistIds.length > 0)
      }
    } catch {
      /* ignore */
    }
  }, [])

  return { appView, exploreHasMatches, navigateView }
}
