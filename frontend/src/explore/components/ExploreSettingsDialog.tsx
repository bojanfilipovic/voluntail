import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ExploreFormFields } from '@/explore/components/ExploreFormFields'
import type { ExplorePersisted } from '@/explore/types'

type Props = {
  open: boolean
  onOpenChange: (o: boolean) => void
  session: ExplorePersisted
  setDisplayName: (s: string) => void
  patch: (fn: (s: ExplorePersisted) => ExplorePersisted) => void
  canReshuffle: boolean
  onRequestReshuffle: () => void
  onRequestStartOver: () => void
}

export function ExploreSettingsDialog({
  open,
  onOpenChange,
  session,
  setDisplayName,
  patch,
  canReshuffle,
  onRequestReshuffle,
  onRequestStartOver,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Swipe deck settings</DialogTitle>
        </DialogHeader>
        <ExploreFormFields
          idSuffix="settings"
          displayName={session.displayName}
          onDisplayNameChange={setDisplayName}
          intent={session.intent}
          onIntentChange={(intent) => patch((s) => ({ ...s, intent }))}
        />
        <div className="grid gap-2 border-t pt-4">
          <p className="text-muted-foreground text-xs">Data stays in this browser only. Nothing is sent to a server.</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Button
              type="button"
              variant="secondary"
              disabled={!canReshuffle}
              onClick={onRequestReshuffle}
              className="w-full transition active:scale-[0.99] enabled:opacity-100 disabled:opacity-40 sm:w-auto"
            >
              Reshuffle deck
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={onRequestStartOver}
              className="w-full text-destructive transition active:scale-[0.99] sm:w-auto"
            >
              Start over
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
