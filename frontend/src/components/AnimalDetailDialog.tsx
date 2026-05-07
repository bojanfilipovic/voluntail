import type { Animal } from '@/api/animals'
import { AnimalImageGallery } from '@/components/AnimalImageGallery'
import { effectiveAnimalImageUrls } from '@/domain/animalGallery'
import type { Shelter } from '@/api/shelters'
import { Button, buttonVariants } from '@/components/ui/button'
import { DialogFooterStack } from '@/components/DialogFooterStack'
import { HeartButton } from '@/components/HeartButton'
import { ShareFeedbackRow } from '@/components/ShareFeedbackRow'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { parseAnimalAge } from '@/domain/animalAge'
import { speciesLabel } from '@/domain/species'
import { cn } from '@/lib/utils'
import { Share2, XIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

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
  /** When non-null, the dialog is open; parent should derive this from a single source (e.g. detail flag ∧ selected row). */
  animal: Animal | null
  shelter: Shelter | null
  onClose: () => void
  onEdit: () => void
  cmsConfigured: boolean
  onPublishToggle: () => void
  onDelete: () => void
  publishBusy: boolean
  deleteBusy: boolean
  onShareFeedback: () => void
  onShelterClick: () => void
}

export function AnimalDetailDialog({
  animal,
  shelter,
  onClose,
  onEdit,
  cmsConfigured,
  onPublishToggle,
  onDelete,
  publishBusy,
  deleteBusy,
  onShareFeedback,
  onShelterClick,
}: Props) {
  const showCms = cmsConfigured
  const [shelterDetailsOpen, setShelterDetailsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    if (!animal) return
    const url = new URL(window.location.origin)
    url.searchParams.set('animal', animal.id)
    const shareUrl = url.toString()
    if (navigator.share) {
      try {
        await navigator.share({ title: animal.name, text: `Help ${animal.name} find a home!`, url: shareUrl })
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [animal])

  return (
    <Dialog open={Boolean(animal)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg"
        showCloseButton={false}
      >
        {animal ? (
          <>
            <AnimalImageGallery
              variant="dialog"
              urls={effectiveAnimalImageUrls(animal)}
              className="max-h-56"
            />
            <DialogHeader className="border-b px-4 pt-4 pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle>{animal.name}</DialogTitle>
                    <HeartButton animalId={animal.id} initialCount={animal.heartCount} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {speciesLabel(animal.species)} · {statusLabel(animal.status)} · {animal.city}
                    {parseAnimalAge(animal.description) ? ` · ${parseAnimalAge(animal.description)}` : ''}
                  </p>
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
              {!animal.published ? (
                <p className="text-destructive text-sm font-medium">
                  Unpublished — only visible with CMS key in the API.
                </p>
              ) : null}
            </div>
            {shelter && shelterDetailsOpen ? (
              <div
                className="border-border bg-muted/30 mx-4 mb-3 space-y-3 rounded-lg border p-3 text-sm"
                id="animal-dialog-shelter-details"
              >
                <button
                  type="button"
                  className="text-primary text-sm font-medium underline-offset-4 hover:underline"
                  onClick={onShelterClick}
                >
                  {shelter.name}
                </button>
                <p className="text-muted-foreground text-sm">
                  {shelter.city}
                  {shelter.species.length
                    ? ` · ${shelter.species.map(speciesLabel).join(', ')}`
                    : ''}
                </p>
                <p className="text-foreground/95 leading-relaxed">{shelter.description}</p>
                <div className="flex flex-wrap gap-2">
                  {shelter.signupUrl ? (
                    <a
                      href={shelter.signupUrl}
                      rel="noreferrer noopener"
                      target="_blank"
                      className={cn(buttonVariants({ variant: 'default', size: 'sm' }))}
                    >
                      Volunteer
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
                </div>
              </div>
            ) : null}
            <DialogFooterStack>
              <div
                className="flex min-w-0 flex-wrap items-center gap-2"
                role="group"
                aria-label="Animal actions"
              >
                {animal.externalUrl ? (
                  <a
                    href={animal.externalUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                    className={cn(
                      buttonVariants({ variant: 'default', size: 'sm' }),
                      'bg-emerald-600 text-white hover:bg-emerald-700',
                    )}
                  >
                    More info
                  </a>
                ) : null}
                {shelter ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    aria-expanded={shelterDetailsOpen}
                    aria-controls="animal-dialog-shelter-details"
                    onClick={() => setShelterDetailsOpen((open) => !open)}
                  >
                    {shelterDetailsOpen ? 'Hide shelter details' : 'Shelter details'}
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  onClick={handleShare}
                  aria-label={copied ? 'Link copied!' : 'Share animal link'}
                  title={copied ? 'Link copied!' : 'Share'}
                >
                  <Share2 className="size-3.5" aria-hidden />
                </Button>
              </div>
              <ShareFeedbackRow onClick={onShareFeedback} />
              {showCms ? (
                <div
                  className="border-border/50 flex w-full min-w-0 flex-wrap items-center justify-between gap-2 border-t pt-3"
                  role="group"
                  aria-label="Curation"
                >
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
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
                    className="shrink-0"
                    onClick={onDelete}
                    disabled={deleteBusy}
                  >
                    {deleteBusy ? 'Removing…' : 'Delete'}
                  </Button>
                </div>
              ) : null}
            </DialogFooterStack>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
