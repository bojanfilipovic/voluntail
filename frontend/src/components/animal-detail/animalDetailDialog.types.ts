import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'

export type AnimalDetailDialogProps = {
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

export type AnimalDetailDialogBodyProps = Omit<
  AnimalDetailDialogProps,
  'animal' | 'onClose'
> & { animal: Animal }
