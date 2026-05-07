import type { ShelterSpecies } from '@/domain/species'
import { buildCmsHeaders } from '@/lib/cmsHeaders'
import { fetchExpectEmpty, fetchJsonZod, jsonHeaders } from '@/lib/apiRequest'
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
  city: string
  signupUrl?: string | null
  imageUrl?: string | null
  donationUrl?: string | null
}

const SHELTERS_URL = '/api/shelters'
const INVALID_JSON_SHELTERS = 'Invalid JSON from /api/shelters'

export async function fetchShelters(): Promise<Shelter[]> {
  return fetchJsonZod(
    SHELTERS_URL,
    undefined,
    INVALID_JSON_SHELTERS,
    sheltersListSchema,
    'publicRead',
  )
}

export async function createShelter(body: ShelterCreatePayload): Promise<Shelter> {
  return fetchJsonZod(
    SHELTERS_URL,
    {
      method: 'POST',
      headers: jsonHeaders(buildCmsHeaders()),
      body: JSON.stringify(body),
    },
    INVALID_JSON_SHELTERS,
    shelterSchema,
  )
}

export async function deleteShelter(id: string): Promise<void> {
  return fetchExpectEmpty(`${SHELTERS_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: buildCmsHeaders(),
  })
}

export async function updateShelter(
  id: string,
  body: ShelterPatchPayload,
): Promise<Shelter> {
  return fetchJsonZod(
    `${SHELTERS_URL}/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: jsonHeaders(buildCmsHeaders()),
      body: JSON.stringify(body),
    },
    INVALID_JSON_SHELTERS,
    shelterSchema,
  )
}
