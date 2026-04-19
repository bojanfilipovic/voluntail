import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Shelter } from '@/api/shelters'
import { speciesLabel } from '@/domain/species'
import { XIcon } from 'lucide-react'

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
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {shelter ? (
          <>
            <div
              className={cn(
                'relative flex min-h-[11rem] max-h-56 items-center justify-center bg-muted',
                'px-6 py-7 sm:px-10',
              )}
            >
              {shelter.imageUrl ? (
                <img
                  src={shelter.imageUrl}
                  alt=""
                  className="max-h-[12.5rem] w-full object-contain object-center"
                  loading="lazy"
                />
              ) : (
                <div className="min-h-32 w-full bg-gradient-to-br from-muted to-muted/60" aria-hidden />
              )}
            </div>
            <DialogHeader className="border-b px-4 pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  <DialogTitle id="shelter-dialog-title">{shelter.name}</DialogTitle>
                  <DialogDescription className="text-muted-foreground text-sm">
                    {shelter.city}
                    {shelter.species.length
                      ? ` · ${shelter.species.map(speciesLabel).join(', ')}`
                      : ''}
                  </DialogDescription>
                </div>
                <DialogClose
                  render={
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className="text-muted-foreground hover:text-foreground -mr-1 shrink-0"
                      aria-label="Close"
                    />
                  }
                >
                  <XIcon className="size-4" aria-hidden />
                </DialogClose>
              </div>
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
