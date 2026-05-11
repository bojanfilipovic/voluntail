import { Navigate } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { useI18n } from '@/i18n/I18nContext'

/** Canonical URL `/explore` redirects into the existing Explore entry (`/?view=explore`). */
export function ExploreRedirect() {
  const { locale, t } = useI18n()

  return (
    <>
      <SeoHelmet
        title={t('seo.exploreRedirect.title')}
        description={t('seo.exploreRedirect.description')}
        path="/explore"
        locale={locale}
      />
      <Navigate to={{ pathname: '/', search: '?view=explore' }} replace />
    </>
  )
}
