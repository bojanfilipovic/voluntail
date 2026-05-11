import { Link } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { useI18n } from '@/i18n/I18nContext'
import { MarketingLayout } from '@/marketing/MarketingLayout'

export function HoeHetWerktPage() {
  const { locale, t } = useI18n()

  return (
    <MarketingLayout>
      <SeoHelmet
        title={t('seo.howItWorks.title')}
        description={t('seo.howItWorks.description')}
        path="/hoe-het-werkt"
        locale={locale}
      />
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">{t('page.howItWorks.h1')}</h1>
        <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">{t('page.howItWorks.intro')}</p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">{t('page.howItWorks.directory.h2')}</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{t('page.howItWorks.directory.body')}</p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">{t('page.howItWorks.explore.h2')}</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{t('page.howItWorks.explore.body')}</p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">{t('page.howItWorks.feedback.h2')}</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{t('page.howItWorks.feedback.body')}</p>
        <p className="text-muted-foreground mt-8 text-[15px] leading-relaxed">
          <Link to="/" className="text-primary font-medium underline underline-offset-4">
            {t('page.howItWorks.footer.mapLink')}
          </Link>{' '}
          ·{' '}
          <Link
            to={{ pathname: '/', search: '?view=explore' }}
            className="text-primary font-medium underline underline-offset-4"
          >
            {t('page.howItWorks.footer.exploreLink')}
          </Link>
        </p>
      </article>
    </MarketingLayout>
  )
}
