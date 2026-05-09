import type { ShelterSpecies } from '@/domain/species'
import { buildCmsHeaders } from '@/lib/cmsHeaders'
import { fetchExpectEmpty, fetchJsonZod, jsonHeaders } from '@/lib/apiRequest'
import {
  shelterSchema,
  sheltersListSchema,
  pagedSheltersResponseSchema,
  type Shelter,
  type ShelterPatchPayload,
} from '@/schemas/shelters'

export type { Shelter }
export type { ShelterPatchPayload } from '@/schemas/shelters'

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
const MAP_MARKERS_URL = '/api/shelters/map-markers'
const INVALID_JSON_SHELTERS = 'Invalid JSON from /api/shelters'

export const SHELTER_PAGE_SIZE = 50

export async function fetchShelterMapMarkers(): Promise<Shelter[]> {
  return fetchJsonZod(
    MAP_MARKERS_URL,
    undefined,
    INVALID_JSON_SHELTERS,
    sheltersListSchema,
    'publicRead',
  )
}

function buildSheltersPageUrl(limit: number, offset: number): string {
  const p = new URLSearchParams()
  p.set('limit', String(limit))
  p.set('offset', String(offset))
  return `${SHELTERS_URL}?${p.toString()}`
}

export async function fetchSheltersPage(
  limit: number = SHELTER_PAGE_SIZE,
  offset: number = 0,
) {
  return fetchJsonZod(
    buildSheltersPageUrl(limit, offset),
    undefined,
    INVALID_JSON_SHELTERS,
    pagedSheltersResponseSchema,
    'publicRead',
  )
}

const MAX_SHELTER_PAGES = 200

/** Load every shelter page (CMS list reconciliation if needed). */
export async function fetchAllShelterPages(): Promise<Shelter[]> {
  const limit = SHELTER_PAGE_SIZE
  let offset = 0
  const out: Shelter[] = []
  for (let i = 0; i < MAX_SHELTER_PAGES; i++) {
    const page = await fetchSheltersPage(limit, offset)
    out.push(...page.items)
    if (page.total === 0 || out.length >= page.total || page.items.length === 0) break
    offset += page.items.length
  }
  return out
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
