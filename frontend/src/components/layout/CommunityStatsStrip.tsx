import { useI18n } from '@/i18n/I18nContext'

export type CommunityStats = {
  shelters?: number
  animals?: number
  hearts?: number
}

export function CommunityStatsStrip({ stats }: { stats?: CommunityStats }) {
  const { t } = useI18n()
  if (stats == null || stats.shelters === undefined) return null
  const parts: string[] = []
  parts.push(`${stats.shelters} ${t('stats.shelters')}`)
  parts.push(`${stats.animals ?? 0} ${t('stats.animals')}`)
  parts.push(`${(stats.hearts ?? 0).toLocaleString()} ${t('stats.hearts')}`)
  return (
    <p className="text-muted-foreground/70 text-xs">{parts.join(' · ')}</p>
  )
}
