import type { ShelterSpecies } from '@/domain/species'
import {
  parseJsonResponse,
  rejectWithResponseBody,
} from '@/lib/http'
import {
  shelterSchema,
  sheltersListSchema,
  type Shelter,
  type ShelterPatchPayload,
} from '@/schemas/shelters'

export type { Shelter }
export type { ShelterPatchPayload }

export type ShelterCreatePayload = {
  name: string
  description: string
  latitude: number
  longitude: number
  species: ShelterSpecies[]
  signupUrl?: string | null
  imageUrl?: string | null
  donationUrl?: string | null
}

const SHELTERS_URL = '/api/shelters'
const INVALID_JSON_SHELTERS = 'Invalid JSON from /api/shelters'

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
  const raw = await parseJsonResponse(res, INVALID_JSON_SHELTERS)
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
    await rejectWithResponseBody(res, `HTTP ${res.status}`)
  }
  const raw = await parseJsonResponse(res, INVALID_JSON_SHELTERS)
  return shelterSchema.parse(raw)
}

export async function deleteShelter(id: string): Promise<void> {
  const res = await fetch(`${SHELTERS_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...cmsHeaders() },
  })
  if (res.status === 204) return
  if (!res.ok) {
    await rejectWithResponseBody(res, `HTTP ${res.status}`)
  }
}

export async function updateShelter(
  id: string,
  body: ShelterPatchPayload,
): Promise<Shelter> {
  const res = await fetch(`${SHELTERS_URL}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...cmsHeaders(),
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    await rejectWithResponseBody(res, `HTTP ${res.status}`)
  }
  const raw = await parseJsonResponse(res, INVALID_JSON_SHELTERS)
  return shelterSchema.parse(raw)
}
