import { Link, useLocation } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { buttonVariants } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  const location = useLocation()
  const { locale, t } = useI18n()

  return (
    <div className="bg-background text-foreground flex min-h-0 flex-1 flex-col overflow-y-auto">
      <SeoHelmet
        title={t('notFound.metaTitle')}
        description={t('notFound.metaDescription')}
        path={location.pathname}
        locale={locale}
        index={false}
        canonical={false}
      />
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold">{t('notFound.h1')}</h1>
        <p className="text-muted-foreground text-sm">{t('notFound.body')}</p>
        <Link
          to="/"
          className={cn(
            buttonVariants(),
            'bg-emerald-600 text-white hover:bg-emerald-700',
          )}
        >
          {t('notFound.cta')}
        </Link>
      </div>
    </div>
  )
}
