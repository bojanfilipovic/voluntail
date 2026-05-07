import { Button } from '@/components/ui/button'
import { intentLabel } from '@/explore/labels'
import type { ExploreIntent } from '@/explore/types'
import { Settings } from 'lucide-react'

type Props = {
  title: string
  displayName?: string
  intent?: ExploreIntent
  onOpenSettings: () => void
}

export function ExploreToolbar({ title, displayName, intent, onOpenSettings }: Props) {
  return (
    <div className="border-border bg-background/95 flex items-center justify-between gap-2 border-b px-4 py-2">
      <div className="min-w-0 flex-1">
        <h2 className="min-w-0 truncate text-sm font-semibold tracking-tight">{title}</h2>
        {displayName ? (
          <p className="text-muted-foreground min-w-0 truncate text-xs">
            {displayName}{intent && intent !== 'undecided' ? ` \u00b7 ${intentLabel(intent)}` : ''}
          </p>
        ) : null}
      </div>
      <Button
        type="button"
        size="icon-sm"
        variant="secondary"
        onClick={onOpenSettings}
        className="transition active:scale-95 motion-reduce:active:scale-100"
        aria-label="Swipe deck settings"
      >
        <Settings className="size-4" />
      </Button>
    </div>
  )
}
