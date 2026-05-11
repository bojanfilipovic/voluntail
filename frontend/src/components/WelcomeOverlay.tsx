import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { CommunityStatsStrip } from '@/components/layout/CommunityStatsStrip'
import type { CommunityStats } from '@/components/layout/CommunityStatsStrip'
import { Button } from '@/components/ui/button'
import { Compass, MapPin, MessageSquare } from 'lucide-react'
import { useI18n } from '@/i18n/I18nContext'

const STORAGE_KEY = 'voluntail.welcomed.v1'

function hasBeenWelcomed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markWelcomed() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch { /* noop */ }
}

type Props = {
  stats?: CommunityStats
}

export function WelcomeOverlay({ stats }: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(() => !hasBeenWelcomed())

  if (!open) return null

  const handleDismiss = () => {
    markWelcomed()
    setOpen(false)
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) handleDismiss() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{t('welcome.title')}</DialogTitle>
          <DialogDescription>{t('welcome.description')}</DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-2 text-sm">
          <li className="flex items-start gap-3">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{t('welcome.li1')}</span>
          </li>
          <li className="flex items-start gap-3">
            <Compass className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
            <span>
              {t('welcome.li2')}
            </span>
          </li>
          <li className="flex items-start gap-3">
            <MessageSquare className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{t('welcome.li3')}</span>
          </li>
        </ul>
        {stats != null && stats.shelters !== undefined ? (
          <div className="border-border/60 border-t pt-3">
            <CommunityStatsStrip stats={stats} />
          </div>
        ) : null}
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button onClick={handleDismiss}>
            {t('welcome.go')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
