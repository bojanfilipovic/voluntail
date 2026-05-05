/** Closed vocabulary aligned with backend [io.shelters.ShelterSpecies]. */
export const SPECIES_VALUES = [
  'dog',
  'cat',
  'rabbit',
  'reptile',
  'rodent',
  'amphibian',
  'wildlife',
  'arachnid',
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
    arachnid: 'Arachnid',
  }
  return labels[sp]
}

/** Primary species shown as individual filter buttons. */
export const PRIMARY_SPECIES: ShelterSpecies[] = ['dog', 'cat', 'rabbit', 'reptile']

/** Species grouped under "Others" in filter UI. */
export const OTHER_SPECIES: ShelterSpecies[] = ['rodent', 'amphibian', 'wildlife', 'arachnid']

/** Filter value: individual species OR the "others" group. */
export type SpeciesFilterValue = ShelterSpecies | 'others'

export function isOtherSpecies(sp: ShelterSpecies): boolean {
  return (OTHER_SPECIES as readonly string[]).includes(sp)
}

/** Stable order for API payloads (canonical vocabulary order). */
export function sortShelterSpecies(list: ShelterSpecies[]): ShelterSpecies[] {
  const order = new Map(SPECIES_VALUES.map((s, i) => [s, i]))
  return [...list].sort((a, b) => order.get(a)! - order.get(b)!)
}
