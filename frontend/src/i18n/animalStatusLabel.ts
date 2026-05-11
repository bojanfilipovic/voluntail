import type { MessageKey } from '@/i18n/nl'
import type { TranslateFn } from '@/i18n/locale'
import type { AnimalStatus } from '@/schemas/animals'

const ANIMAL_STATUS_MESSAGE_KEY: Partial<Record<AnimalStatus, MessageKey>> = {
  available: 'animalList.status.available',
  reserved: 'animalList.status.reserved',
  adopted: 'animalList.status.adopted',
}

/** Localized label for directory/animal API statuses (falls back to raw status if unknown). */
export function animalStatusLabel(status: AnimalStatus, t: TranslateFn): string {
  const key = ANIMAL_STATUS_MESSAGE_KEY[status]
  return key ? t(key) : status
}
