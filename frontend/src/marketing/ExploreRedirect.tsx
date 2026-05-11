import { Navigate } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'

const TITLE = 'Explore — swipe door beschikbare dieren — Voluntail'
const DESCRIPTION =
  'Anoniem door gepubliceerde dieren swipen op Voluntail. Shortlist in je browser; adoptie en vervolgstappen via het asiel.'

/** Canonical URL `/explore` redirects into the existing Explore entry (`/?view=explore`). */
export function ExploreRedirect() {
  return (
    <>
      <SeoHelmet title={TITLE} description={DESCRIPTION} path="/explore" />
      <Navigate to={{ pathname: '/', search: '?view=explore' }} replace />
    </>
  )
}
