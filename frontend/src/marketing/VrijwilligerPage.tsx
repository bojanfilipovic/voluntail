import { Link } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { useI18n } from '@/i18n/I18nContext'
import { MarketingLayout } from '@/marketing/MarketingLayout'

export function VrijwilligerPage() {
  const { locale, t } = useI18n()

  return (
    <MarketingLayout>
      <SeoHelmet
        title={t('seo.volunteer.title')}
        description={t('seo.volunteer.description')}
        path="/vrijwilliger"
        locale={locale}
      />
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">{t('page.volunteer.h1')}</h1>
        <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">{t('page.volunteer.intro')}</p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">{t('page.volunteer.not.h2')}</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">{t('page.volunteer.not.body')}</p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">{t('page.volunteer.start.h2')}</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          {t('page.volunteer.start.before')}
          <Link to="/" className="text-primary font-medium underline underline-offset-4">
            {t('page.volunteer.start.mapLink')}
          </Link>
          {t('page.volunteer.start.after')}
        </p>
      </article>
    </MarketingLayout>
  )
}
