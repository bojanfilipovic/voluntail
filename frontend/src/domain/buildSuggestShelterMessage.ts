export type SuggestShelterSpeciesTag = 'dog' | 'cat' | 'rabbit' | 'reptile' | 'other'

export type BuildSuggestShelterMessageInput = {
  name: string
  description: string
  city: string
  signupUrl: string
  imageUrl: string
  donationUrl: string
  species: Partial<Record<SuggestShelterSpeciesTag, boolean>>
  otherSpeciesDetail: string
  comment: string
  latitude: number
  longitude: number
}

const LABELS: Record<SuggestShelterSpeciesTag, string> = {
  dog: 'Dog',
  cat: 'Cat',
  rabbit: 'Rabbit',
  reptile: 'Reptile',
  other: 'Other',
}

/** Builds the inbox body for POST /api/suggestions (plain text, structured sections). */
export function buildSuggestShelterMessage(input: BuildSuggestShelterMessageInput): string {
  const lines: string[] = ['[Suggest shelter]', `Name: ${input.name.trim()}`]

  const desc = input.description.trim()
  if (desc) lines.push(`Description: ${desc}`)

  const city = input.city.trim()
  if (city) lines.push(`City: ${city}`)

  const picked = (Object.keys(LABELS) as SuggestShelterSpeciesTag[]).filter(
    (k) => input.species[k],
  )
  if (picked.length > 0) {
    const parts = picked.map((k) =>
      k === 'other' && input.otherSpeciesDetail.trim()
        ? `Other (${input.otherSpeciesDetail.trim()})`
        : LABELS[k],
    )
    lines.push(`Species: ${parts.join(', ')}`)
  }

  const su = input.signupUrl.trim()
  if (su) lines.push(`Signup URL: ${su}`)
  const iu = input.imageUrl.trim()
  if (iu) lines.push(`Image URL: ${iu}`)
  const du = input.donationUrl.trim()
  if (du) lines.push(`Donation URL: ${du}`)

  const comment = input.comment.trim()
  if (comment) lines.push(`Comment: ${comment}`)

  lines.push(`Coordinates: ${input.latitude}, ${input.longitude}`)

  return lines.join('\n')
}
