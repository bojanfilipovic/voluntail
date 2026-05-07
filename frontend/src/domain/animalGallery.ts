import type { Animal } from '@/api/animals'

/** Ordered gallery URLs merged from API (`imageUrls` + legacy `imageUrl`). */
export function effectiveAnimalImageUrls(animal: Animal): string[] {
  if (animal.imageUrls?.length) return animal.imageUrls
  if (animal.imageUrl) return [animal.imageUrl]
  return []
}
