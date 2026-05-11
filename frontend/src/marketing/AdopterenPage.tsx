import { Link } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { useI18n } from '@/i18n/I18nContext'
import { MarketingLayout } from '@/marketing/MarketingLayout'

export function AdopterenPage() {
  const { locale, t } = useI18n()

  return (
    <MarketingLayout>
      <SeoHelmet
        title={t('seo.adopteren.title')}
        description={t('seo.adopteren.description')}
        path="/adopteren"
        locale={locale}
      />
      <article className="prose prose-neutral dark:prose-invert max-w-none">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">{t('page.adopteren.h1')}</h1>
        <p className="text-muted-foreground mt-4 text-[15px] leading-relaxed">{t('page.adopteren.intro')}</p>
        <h2 className="text-foreground mt-10 text-xl font-semibold">{t('page.adopteren.help.h2')}</h2>
        <ul className="text-muted-foreground mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed">
          <li>{t('page.adopteren.help.li1')}</li>
          <li>{t('page.adopteren.help.li2')}</li>
          <li>{t('page.adopteren.help.li3')}</li>
        </ul>
        <h2 className="text-foreground mt-10 text-xl font-semibold">{t('page.adopteren.next.h2')}</h2>
        <p className="text-muted-foreground mt-3 text-[15px] leading-relaxed">
          {t('page.adopteren.next.before')}
          <Link to="/" className="text-primary font-medium underline underline-offset-4">
            {t('page.adopteren.next.mapLink')}
          </Link>
          {t('page.adopteren.next.between')}
          <Link
            to={{ pathname: '/', search: '?view=explore' }}
            className="text-primary font-medium underline underline-offset-4"
          >
            {t('page.adopteren.next.exploreLink')}
          </Link>
          {t('page.adopteren.next.after')}
        </p>
      </article>
    </MarketingLayout>
  )
}
