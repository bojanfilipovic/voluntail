import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

type Props = {
  kind: null | 'reshuffle' | 'startOver'
  onOpenChange: (open: boolean) => void
  onConfirmReshuffle: () => void
  onConfirmStartOver: () => void
}

export function ExploreLocalDataConfirmDialog({
  kind,
  onOpenChange,
  onConfirmReshuffle,
  onConfirmStartOver,
}: Props) {
  return (
    <Dialog open={kind !== null} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md" aria-describedby={undefined}>
        {kind === 'reshuffle' ? (
          <>
            <DialogHeader>
              <DialogTitle>Reshuffle deck?</DialogTitle>
              <p className="text-muted-foreground text-sm">
                All animals come back into the deck — passed ones and &ldquo;no match&rdquo; ones.
                Your saved matches stay.
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={onConfirmReshuffle}>
                Reshuffle
              </Button>
            </DialogFooter>
          </>
        ) : null}
        {kind === 'startOver' ? (
          <>
            <DialogHeader>
              <DialogTitle>Start over?</DialogTitle>
              <p className="text-muted-foreground text-sm">
                This resets everything — your matches, passed animals, and deck.
                Your display name and filters stay the same.
              </p>
            </DialogHeader>
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="button" variant="destructive" onClick={onConfirmStartOver}>
                Start over
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
