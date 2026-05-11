import { AnimalDetailDialogBody } from '@/components/animal-detail/AnimalDetailDialogBody'
import type { AnimalDetailDialogProps } from '@/components/animal-detail/animalDetailDialog.types'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export type { AnimalDetailDialogProps }

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
}: AnimalDetailDialogProps) {
  return (
    <Dialog open={Boolean(animal)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        className={cn(
          'flex max-h-[min(92dvh,calc(100dvh-2rem))] max-w-lg flex-col overflow-hidden gap-0 p-0 sm:max-w-lg',
        )}
        showCloseButton={false}
      >
        {animal ? (
          <AnimalDetailDialogBody
            key={animal.id}
            animal={animal}
            shelter={shelter}
            onEdit={onEdit}
            cmsConfigured={cmsConfigured}
            onPublishToggle={onPublishToggle}
            onDelete={onDelete}
            publishBusy={publishBusy}
            deleteBusy={deleteBusy}
            onShareFeedback={onShareFeedback}
            onShelterClick={onShelterClick}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
