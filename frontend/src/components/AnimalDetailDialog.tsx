import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { speciesLabel } from '@/domain/species'
import { cn } from '@/lib/utils'
import { XIcon } from 'lucide-react'

function statusLabel(s: Animal['status']): string {
  switch (s) {
    case 'available':
      return 'Available'
    case 'reserved':
      return 'Reserved'
    case 'adopted':
      return 'Adopted'
    default:
      return s
  }
}

type Props = {
  animal: Animal | null
  shelter: Shelter | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  cmsConfigured: boolean
  onPublishToggle: () => void
  onDelete: () => void
  publishBusy: boolean
  deleteBusy: boolean
}

export function AnimalDetailDialog({
  animal,
  shelter,
  open,
  onClose,
  onEdit,
  cmsConfigured,
  onPublishToggle,
  onDelete,
  publishBusy,
  deleteBusy,
}: Props) {
  const showCms = cmsConfigured

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {animal ? (
          <>
            <div
              className={cn(
                'relative flex min-h-[11rem] max-h-56 items-center justify-center bg-muted',
                'px-6 py-7 sm:px-10',
              )}
            >
              {animal.imageUrl ? (
                <img
                  src={animal.imageUrl}
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
                <div className="min-w-0 flex-1 space-y-1">
                  <DialogTitle>{animal.name}</DialogTitle>
                  <p className="text-muted-foreground text-sm">
                    {speciesLabel(animal.species)} · {statusLabel(animal.status)} · {animal.city}
                  </p>
                  {shelter ? (
                    <p className="text-foreground text-sm font-medium">{shelter.name}</p>
                  ) : null}
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
            <div className="max-h-[min(50vh,22rem)] space-y-3 overflow-y-auto px-4 py-3 text-sm leading-relaxed">
              <p className="text-foreground/95 whitespace-pre-wrap">{animal.description}</p>
              {animal.externalUrl ? (
                <p>
                  <a
                    href={animal.externalUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    External profile / more info
                  </a>
                </p>
              ) : null}
              {!animal.published ? (
                <p className="text-destructive text-sm font-medium">
                  Unpublished — only visible with CMS key in the API.
                </p>
              ) : null}
            </div>
            {showCms ? (
              <DialogFooter className="flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
                    Edit
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={onPublishToggle}
                    disabled={publishBusy}
                  >
                    {publishBusy
                      ? 'Updating…'
                      : animal.published
                        ? 'Unpublish'
                        : 'Publish'}
                  </Button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={onDelete}
                  disabled={deleteBusy}
                >
                  {deleteBusy ? 'Removing…' : 'Delete'}
                </Button>
              </DialogFooter>
            ) : null}
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
