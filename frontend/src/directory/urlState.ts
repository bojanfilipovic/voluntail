/**
 * Public URL state for the SPA: `?view=explore` toggles Explore; directory is the default.
 */

export type AppView = 'directory' | 'explore'

export function getAppViewFromSearchParams(search: string): AppView {
  return new URLSearchParams(search).get('view') === 'explore' ? 'explore' : 'directory'
}

export function getInitialAppView(): AppView {
  if (typeof window === 'undefined') return 'directory'
  return getAppViewFromSearchParams(window.location.search)
}

export function replaceAppViewInUrl(appView: AppView): void {
  const u = new URL(window.location.href)
  if (appView === 'explore') u.searchParams.set('view', 'explore')
  else u.searchParams.delete('view')
  window.history.replaceState({}, '', u.toString())
}
