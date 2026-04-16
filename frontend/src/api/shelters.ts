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
  return res.json() as Promise<Shelter[]>
}
