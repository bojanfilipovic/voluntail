export type CommunityStats = {
  shelters?: number
  animals?: number
  hearts?: number
}

export function CommunityStatsStrip({ stats }: { stats?: CommunityStats }) {
  if (stats == null || stats.shelters === undefined) return null
  const parts: string[] = []
  parts.push(`${stats.shelters} shelters`)
  parts.push(`${stats.animals ?? 0} animals`)
  parts.push(`${(stats.hearts ?? 0).toLocaleString()} hearts given`)
  return (
    <p className="text-muted-foreground/70 text-xs">{parts.join(' · ')}</p>
  )
}
