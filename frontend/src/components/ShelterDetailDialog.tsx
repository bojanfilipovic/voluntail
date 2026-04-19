import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Shelter } from '@/api/shelters'

type Props = {
  shelter: Shelter | null
  onClose: () => void
  onRemove: () => void
  onEdit: () => void
  removeDisabled?: boolean
  editDisabled?: boolean
}

export function ShelterDetailDialog({
  shelter,
  onClose,
  onRemove,
  onEdit,
  removeDisabled = false,
  editDisabled = false,
}: Props) {
  return (
    <Dialog open={Boolean(shelter)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        {shelter ? (
          <>
            <div className="relative aspect-video max-h-56 bg-muted">
              {shelter.imageUrl ? (
                <img
                  src={shelter.imageUrl}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="size-full bg-gradient-to-br from-muted to-muted/60" aria-hidden />
              )}
            </div>
            <DialogHeader className="border-b px-4 pt-4 pb-2">
              <DialogTitle id="shelter-dialog-title">{shelter.name}</DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {shelter.species.length ? shelter.species.join(', ') : '—'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3 px-4 py-3 text-sm leading-relaxed">
              <p className="text-muted-foreground">
                Shelters rely on volunteers, adopters, and fosters—use the shelter&apos;s own
                pages for final steps.
              </p>
              <p>{shelter.description}</p>
              <p className="text-muted-foreground text-xs leading-snug">
                Tip: always double-check volunteer and donation info on the shelter&apos;s
                official website before you commit.
              </p>
            </div>
            <DialogFooter className="flex-col gap-2 border-t bg-muted/40 px-4 py-3 sm:flex-row sm:flex-wrap sm:justify-start">
              {shelter.signupUrl ? (
                <a
                  href={shelter.signupUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                >
                  Volunteer / signup
                </a>
              ) : null}
              {shelter.donationUrl ? (
                <a
                  href={shelter.donationUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
                >
                  Donate
                </a>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={editDisabled}
                onClick={onEdit}
              >
                Edit details
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="sm:ml-auto"
                disabled={removeDisabled}
                onClick={onRemove}
              >
                Remove pin
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
