import {
  animalHeartResponseSchema,
  animalSchema,
  animalsListSchema,
  type Animal,
  type AnimalPatchPayload,
} from '@/schemas/animals'
import type { ShelterSpecies } from '@/domain/species'
import type { AnimalListQuery } from '@/lib/queryKeys'
import { buildCmsHeaders } from '@/lib/cmsHeaders'
import {
  fetchExpectEmpty,
  fetchJsonZod,
  jsonHeaders,
} from '@/lib/apiRequest'
import type { AnimalStatus } from '@/schemas/animals'

export type { Animal }
export type { AnimalPatchPayload } from '@/schemas/animals'

export type AnimalCreatePayload = {
  shelterId: string
  name: string
  description: string
  species: ShelterSpecies
  status: AnimalStatus
  published: boolean
  /** Preferred; falls back to legacy imageUrl when empty (server merge). */
  imageUrls?: string[]
  imageUrl?: string | null
  externalUrl?: string | null
}

const ANIMALS_URL = '/api/animals'
const INVALID_JSON_ANIMALS = 'Invalid JSON from /api/animals'
const INVALID_JSON_HEART = 'Invalid JSON from heart endpoint'
const INVALID_JSON_UNHEART = 'Invalid JSON from unheart endpoint'

function buildListUrl(filters: AnimalListQuery): string {
  const p = new URLSearchParams()
  if (filters.city?.trim()) p.set('city', filters.city.trim())
  if (filters.shelterId?.trim()) p.set('shelterId', filters.shelterId.trim())
  if (filters.species) p.set('species', filters.species)
  const q = p.toString()
  return q ? `${ANIMALS_URL}?${q}` : ANIMALS_URL
}

/** Public list only: never send CMS key (no unpublished rows from the server). */
export async function fetchAnimalsPublic(filters: AnimalListQuery): Promise<Animal[]> {
  return fetchJsonZod(
    buildListUrl(filters),
    { headers: {} },
    INVALID_JSON_ANIMALS,
    animalsListSchema,
    'publicRead',
  )
}

/** CMS key when set widens listing to unpublished rows (server-side). */
export async function fetchAnimals(filters: AnimalListQuery): Promise<Animal[]> {
  return fetchJsonZod(
    buildListUrl(filters),
    { headers: { ...buildCmsHeaders() } },
    INVALID_JSON_ANIMALS,
    animalsListSchema,
    'publicRead',
  )
}

export async function createAnimal(body: AnimalCreatePayload): Promise<Animal> {
  return fetchJsonZod(
    ANIMALS_URL,
    {
      method: 'POST',
      headers: jsonHeaders(buildCmsHeaders()),
      body: JSON.stringify(body),
    },
    INVALID_JSON_ANIMALS,
    animalSchema,
  )
}

export async function updateAnimal(
  id: string,
  body: AnimalPatchPayload,
): Promise<Animal> {
  return fetchJsonZod(
    `${ANIMALS_URL}/${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: jsonHeaders(buildCmsHeaders()),
      body: JSON.stringify(body),
    },
    INVALID_JSON_ANIMALS,
    animalSchema,
  )
}

export async function deleteAnimal(id: string): Promise<void> {
  return fetchExpectEmpty(`${ANIMALS_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: buildCmsHeaders(),
  })
}

export async function heartAnimal(id: string): Promise<{ heartCount: number }> {
  return fetchJsonZod(
    `${ANIMALS_URL}/${encodeURIComponent(id)}/heart`,
    { method: 'POST' },
    INVALID_JSON_HEART,
    animalHeartResponseSchema,
  )
}

export async function unheartAnimal(id: string): Promise<{ heartCount: number }> {
  return fetchJsonZod(
    `${ANIMALS_URL}/${encodeURIComponent(id)}/unheart`,
    { method: 'POST' },
    INVALID_JSON_UNHEART,
    animalHeartResponseSchema,
  )
}
