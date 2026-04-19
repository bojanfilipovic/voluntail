/** Closed vocabulary aligned with backend [io.shelters.ShelterSpecies]. */
export const SPECIES_VALUES = [
  'dog',
  'cat',
  'rabbit',
  'reptile',
  'rodent',
  'amphibian',
  'wildlife',
] as const

export type ShelterSpecies = (typeof SPECIES_VALUES)[number]

export function speciesLabel(sp: ShelterSpecies): string {
  const labels: Record<ShelterSpecies, string> = {
    dog: 'Dog',
    cat: 'Cat',
    rabbit: 'Rabbit',
    reptile: 'Reptile',
    rodent: 'Rodent',
    amphibian: 'Amphibian',
    wildlife: 'Wildlife',
  }
  return labels[sp]
}

/** Stable order for API payloads (canonical vocabulary order). */
export function sortShelterSpecies(list: ShelterSpecies[]): ShelterSpecies[] {
  const order = new Map(SPECIES_VALUES.map((s, i) => [s, i]))
  return [...list].sort((a, b) => order.get(a)! - order.get(b)!)
}
