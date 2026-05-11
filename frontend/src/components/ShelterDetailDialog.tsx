import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { DialogFooterStack } from '@/components/DialogFooterStack'
import { ShareFeedbackRow } from '@/components/ShareFeedbackRow'
import { useI18n } from '@/i18n/I18nContext'
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
  onShareFeedback: () => void
  cmsConfigured?: boolean
}

export function ShelterDetailDialog({
  shelter,
  onClose,
  onRemove,
  onEdit,
  removeDisabled = false,
  editDisabled = false,
  onShareFeedback,
  cmsConfigured = false,
}: Props) {
  const { t } = useI18n()
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
                      aria-label={t('shelterDetail.closeAria')}
                    />
                  }
                >
                  <XIcon className="size-4" aria-hidden />
                </DialogClose>
              </div>
            </DialogHeader>
            <div className="space-y-3 px-4 py-3 text-sm leading-relaxed">
              <p>{shelter.description}</p>
            </div>
            <DialogFooterStack>
              <div
                className="flex min-w-0 flex-nowrap items-center gap-2 overflow-x-auto"
                role="group"
                aria-label={t('shelterDetail.actionsAria')}
              >
                {shelter.signupUrl ? (
                  <a
                    href={shelter.signupUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                    className={cn(
                      'shrink-0',
                      buttonVariants({ variant: 'default', size: 'sm' }),
                    )}
                  >
                    {t('outbound.volunteer')}
                  </a>
                ) : null}
                {shelter.donationUrl ? (
                  <a
                    href={shelter.donationUrl}
                    rel="noreferrer noopener"
                    target="_blank"
                    className={cn(
                      'shrink-0',
                      buttonVariants({ variant: 'outline', size: 'sm' }),
                    )}
                  >
                    {t('outbound.donate')}
                  </a>
                ) : null}
              </div>
              <ShareFeedbackRow onClick={onShareFeedback} />
              {cmsConfigured ? (
                <div
                  className="border-border/50 flex w-full min-w-0 flex-nowrap items-center justify-between gap-2 border-t pt-3"
                  role="group"
                  aria-label={t('shelterDetail.cmsAria')}
                >
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    disabled={editDisabled}
                    onClick={onEdit}
                  >
                    {t('shelterDetail.editDetails')}
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="shrink-0"
                    disabled={removeDisabled}
                    onClick={onRemove}
                  >
                    {t('shelterDetail.removePin')}
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
