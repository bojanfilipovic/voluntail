export type RegistryTag = 'DOA' | 'ROZ'

export type Shelter = {
  id: string
  name: string
  description: string
  latitude: number
  longitude: number
  registryTag: RegistryTag
  species: string[]
  signupUrl: string | null
}

const SHELTERS_URL = '/api/shelters'

export async function fetchShelters(): Promise<Shelter[]> {
  const res = await fetch(SHELTERS_URL)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    throw new Error('Invalid JSON from /api/shelters')
  }

  if (!Array.isArray(raw)) {
    throw new Error('Expected a JSON array from /api/shelters')
  }

  return raw as Shelter[]
}
