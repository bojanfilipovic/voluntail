import { useI18n } from '@/i18n/I18nContext'

export function MapLoadingFallback() {
  const { t } = useI18n()
  return (
    <div className="bg-muted/40 relative flex min-h-[220px] flex-1 flex-col items-center justify-center gap-3 overflow-hidden px-4 py-8">
      {/* Pulsing skeleton blocks to suggest map tiles */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px opacity-30">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="bg-muted animate-pulse rounded-sm"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        <span
          className="inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent text-muted-foreground"
          aria-hidden
        />
        <span className="text-muted-foreground text-sm font-medium">{t('loading.map')}</span>
      </div>
    </div>
  )
}
