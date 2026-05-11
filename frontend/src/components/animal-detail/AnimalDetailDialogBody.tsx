import { AnimalImageGallery } from '@/components/AnimalImageGallery'
import { DialogFooterStack } from '@/components/DialogFooterStack'
import { HeartButton } from '@/components/HeartButton'
import { ShareFeedbackRow } from '@/components/ShareFeedbackRow'
import { ShelterDetailsPanel } from '@/components/animal-detail/ShelterDetailsPanel'
import type { AnimalDetailDialogBodyProps } from '@/components/animal-detail/animalDetailDialog.types'
import { useSmUp } from '@/components/animal-detail/useSmUp'
import {
  DialogClose,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { effectiveAnimalImageUrls } from '@/domain/animalGallery'
import { parseAnimalAge } from '@/domain/animalAge'
import { speciesLabel } from '@/domain/species'
import { animalStatusLabel } from '@/i18n/animalStatusLabel'
import { useI18n } from '@/i18n/I18nContext'
import { cn } from '@/lib/utils'
import { ChevronDown, ExternalLink, Share2, XIcon } from 'lucide-react'
import { useCallback, useState } from 'react'

export function AnimalDetailDialogBody({
  animal,
  shelter,
  onEdit,
  cmsConfigured,
  onPublishToggle,
  onDelete,
  publishBusy,
  deleteBusy,
  onShareFeedback,
  onShelterClick,
}: AnimalDetailDialogBodyProps) {
  const { t } = useI18n()
  const showCms = cmsConfigured
  const isSmUp = useSmUp()
  const [shelterDetailsOpen, setShelterDetailsOpen] = useState(false)
  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleShare = useCallback(async () => {
    const url = new URL(window.location.origin)
    url.searchParams.set('animal', animal.id)
    const shareUrl = url.toString()
    if (navigator.share) {
      try {
        await navigator.share({
          title: animal.name,
          text: t('animalDetail.shareMessage', { name: animal.name }),
          url: shareUrl,
        })
      } catch {
        /* user cancelled */
      }
    } else {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [animal, t])

  const showShelterPanel = Boolean(shelter && shelterDetailsOpen)
  const shelterPanelInScroll = isSmUp && showShelterPanel
  /** Mobile: shelter panel lives in the main scroll region when Details is expanded (not footer) so the dialog keeps one scroll surface. */
  const shelterPanelMobileInBody = !isSmUp && mobileDetailsOpen && showShelterPanel
  const descriptionTrimmed = animal.description.trim()
  const mobileHasExpandable = Boolean(descriptionTrimmed || shelter || animal.externalUrl)
  /** Published animal with nothing to put in the mobile strip when collapsed → skip vertical padding above footer. */
  const mobileBodyEmpty = Boolean(animal.published && !mobileDetailsOpen && !mobileHasExpandable)

  return (
    <>
      <AnimalImageGallery
        variant="card"
        density="compact"
        urls={effectiveAnimalImageUrls(animal)}
        className="shrink-0 overflow-hidden rounded-t-xl"
      />
      <DialogHeader className="border-b shrink-0 px-3 pt-4 pb-2 sm:px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <DialogTitle>{animal.name}</DialogTitle>
              <HeartButton animalId={animal.id} initialCount={animal.heartCount} />
            </div>
            <p className="text-muted-foreground text-sm">
              {speciesLabel(animal.species)} · {animalStatusLabel(animal.status, t)} · {animal.city}
              {parseAnimalAge(animal.description) ? ` · ${parseAnimalAge(animal.description)}` : ''}
            </p>
          </div>
          <div className="-mr-1 flex shrink-0 items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-muted-foreground hover:text-foreground sm:hidden"
              onClick={handleShare}
              aria-label={
                copied ? t('animalDetail.linkCopied') : t('animalDetail.shareAnimalAria')
              }
              title={copied ? t('animalDetail.linkCopied') : t('animalDetail.share')}
            >
              <Share2 className="size-4" aria-hidden />
            </Button>
            <DialogClose
              render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="text-muted-foreground hover:text-foreground shrink-0"
                  aria-label={t('animalDetail.closeAria')}
                />
              }
            >
              <XIcon className="size-4" aria-hidden />
            </DialogClose>
          </div>
        </div>
      </DialogHeader>
      {/*
        Mobile: outer column scrolls body + footer together so a tall footer (CMS + feedback)
        cannot collapse the body to zero height. Desktop: body scrolls, footer stays pinned.
      */}
      <div
        className={cn(
          'flex min-h-0 flex-1 flex-col',
          'max-sm:overflow-y-auto max-sm:overscroll-contain max-sm:[-webkit-overflow-scrolling:touch] max-sm:touch-pan-y',
          'sm:overflow-hidden',
        )}
      >
        <div
          className={cn(
            'space-y-3 px-3 text-sm leading-relaxed max-sm:text-[15px] max-sm:leading-relaxed sm:px-4',
            'max-sm:shrink-0',
            mobileBodyEmpty ? 'max-sm:py-0' : 'max-sm:py-3',
            'sm:min-h-0 sm:flex-1 sm:overflow-y-auto sm:overscroll-contain sm:py-3 sm:[-webkit-overflow-scrolling:touch] sm:touch-pan-y',
          )}
        >
          <p className="text-foreground/95 hidden whitespace-pre-wrap break-words sm:block">
            {animal.description}
          </p>
          {!animal.published ? (
            <p className="text-destructive text-sm font-medium">
              {t('animalDetail.unpublishedBanner')}
            </p>
          ) : null}

          {/* Mobile: lightweight teaser — readable preview + fade (no heavy blur). */}
          {!mobileDetailsOpen && mobileHasExpandable ? (
            <button
              type="button"
              className={cn(
                'sm:hidden w-full rounded-lg px-2 py-2 text-start',
                'bg-muted/15 ring-border/30 hover:bg-muted/25 active:bg-muted/35 ring-1 ring-inset',
                'transition-colors',
                'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none',
              )}
              aria-expanded={false}
              aria-controls="animal-dialog-mobile-expanded"
              aria-label={t('animalDetail.showFullAria')}
              onClick={() => setMobileDetailsOpen(true)}
            >
              {descriptionTrimmed ? (
                <div className="relative">
                  <p className="text-foreground/90 line-clamp-3 whitespace-pre-wrap break-words text-[14px] leading-snug">
                    {animal.description}
                  </p>
                  <div
                    className="pointer-events-none absolute inset-x-0 bottom-0 top-[42%] bg-gradient-to-b from-transparent to-popover"
                    aria-hidden
                  />
                </div>
              ) : (
                <p className="text-foreground/90 text-sm leading-snug">
                  {t('animalDetail.mobileTeaserFallback')}
                </p>
              )}
              <span className="text-muted-foreground mt-1.5 inline-flex items-center gap-1 text-[11px] font-medium">
                {t('animalDetail.readMore')}
                <ChevronDown className="size-3 opacity-70" aria-hidden />
              </span>
            </button>
          ) : null}

          {mobileDetailsOpen ? (
            <div id="animal-dialog-mobile-expanded" className="space-y-3 sm:hidden">
              {descriptionTrimmed ? (
                <p className="text-foreground/95 whitespace-pre-wrap break-words">{animal.description}</p>
              ) : null}
              {shelter ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  aria-expanded={shelterDetailsOpen}
                  aria-controls="animal-dialog-shelter-details"
                  onClick={() => setShelterDetailsOpen((open) => !open)}
                >
                  {shelterDetailsOpen
                    ? t('animalDetail.hideShelterDetails')
                    : t('animalDetail.shelterDetails')}
                </Button>
              ) : null}
              {animal.externalUrl ? (
                <a
                  href={animal.externalUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                  className={cn(
                    buttonVariants({ variant: 'default', size: 'sm' }),
                    'bg-emerald-600 text-white hover:bg-emerald-700',
                    'inline-flex w-full items-center justify-center gap-2',
                  )}
                >
                  <ExternalLink className="size-4 shrink-0" aria-hidden />
                  {t('animalDetail.moreInfo')}
                </a>
              ) : null}
              {shelterPanelMobileInBody && shelter ? (
                <ShelterDetailsPanel shelter={shelter} onShelterClick={onShelterClick} />
              ) : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground h-9 w-full"
                onClick={() => setMobileDetailsOpen(false)}
              >
                {t('animalDetail.readLess')}
              </Button>
            </div>
          ) : null}
          {shelterPanelInScroll && shelter ? (
            <ShelterDetailsPanel shelter={shelter} onShelterClick={onShelterClick} />
          ) : null}
        </div>

        <DialogFooterStack
          className={cn(
            'shrink-0 px-3 sm:px-4',
            'max-sm:gap-2 max-sm:py-2 max-sm:pb-3',
            mobileBodyEmpty && 'max-sm:border-t-0 max-sm:pt-1',
          )}
        >
          <div
            className="hidden flex-wrap items-center gap-2 sm:flex"
            role="group"
            aria-label={t('animalDetail.footerActionsAria')}
          >
            {animal.externalUrl ? (
              <a
                href={animal.externalUrl}
                rel="noreferrer noopener"
                target="_blank"
                className={cn(
                  buttonVariants({ variant: 'default', size: 'sm' }),
                  'bg-emerald-600 text-white hover:bg-emerald-700',
                  'inline-flex',
                )}
              >
                {t('animalDetail.moreInfo')}
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
                {shelterDetailsOpen
                  ? t('animalDetail.hideShelterDetails')
                  : t('animalDetail.shelterDetails')}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              onClick={handleShare}
              aria-label={
                copied ? t('animalDetail.linkCopied') : t('animalDetail.shareAnimalAria')
              }
              title={copied ? t('animalDetail.linkCopied') : t('animalDetail.share')}
            >
              <Share2 className="size-3.5" aria-hidden />
            </Button>
          </div>

          <ShareFeedbackRow
            className="max-sm:border-border/40 max-sm:pt-2"
            onClick={onShareFeedback}
          />
          {showCms ? (
            <div
              className={cn(
                'border-border/50 flex w-full min-w-0 flex-wrap items-center justify-between gap-2 border-t pt-3',
                'max-sm:pt-2 max-sm:gap-1.5',
              )}
              role="group"
              aria-label={t('animalDetail.cmsAria')}
            >
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
                  {t('animalDetail.edit')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={onPublishToggle}
                  disabled={publishBusy}
                >
                  {publishBusy
                    ? t('animalDetail.updating')
                    : animal.published
                      ? t('animalDetail.unpublish')
                      : t('animalDetail.publish')}
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
                {deleteBusy ? t('animalDetail.removing') : t('animalDetail.delete')}
              </Button>
            </div>
          ) : null}
        </DialogFooterStack>
      </div>
    </>
  )
}
