import {
  shelterSchema,
  sheltersListSchema,
  type Shelter,
} from '../schemas/shelters'

export type { Shelter }

export type ShelterCreatePayload = {
  name: string
  description: string
  latitude: number
  longitude: number
  species: string[]
  signupUrl?: string | null
  imageUrl?: string | null
  donationUrl?: string | null
}

const SHELTERS_URL = '/api/shelters'

const CMS_HEADER = 'X-CMS-Key'

function cmsHeaders(): HeadersInit {
  const key = import.meta.env.VITE_CMS_API_KEY?.trim()
  if (!key) return {}
  return { [CMS_HEADER]: key }
}

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

  return sheltersListSchema.parse(raw)
}

export async function createShelter(body: ShelterCreatePayload): Promise<Shelter> {
  const res = await fetch(SHELTERS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...cmsHeaders(),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `HTTP ${res.status}`)
  }
  const raw: unknown = await res.json()
  return shelterSchema.parse(raw)
}

export async function deleteShelter(id: string): Promise<void> {
  const res = await fetch(`${SHELTERS_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...cmsHeaders() },
  })
  if (res.status === 204) return
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `HTTP ${res.status}`)
  }
}
