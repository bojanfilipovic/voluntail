import {
  animalHeartResponseSchema,
  animalSchema,
  animalSpeciesFacetsResponseSchema,
  pagedAnimalsResponseSchema,
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

export const ANIMAL_PAGE_SIZE = 50

export type AnimalPageParams = {
  limit?: number
  offset?: number
  shuffleSeed?: string | null
}

function buildListUrl(
  filters: AnimalListQuery,
  page: AnimalPageParams,
): string {
  const p = new URLSearchParams()
  if (filters.city?.trim()) p.set('city', filters.city.trim())
  if (filters.shelterId?.trim()) p.set('shelterId', filters.shelterId.trim())
  if (filters.species) p.set('species', filters.species)
  const limit = page.limit ?? ANIMAL_PAGE_SIZE
  const offset = page.offset ?? 0
  p.set('limit', String(limit))
  p.set('offset', String(offset))
  const seed = page.shuffleSeed?.trim()
  if (seed) p.set('shuffleSeed', seed)
  const q = p.toString()
  return q ? `${ANIMALS_URL}?${q}` : ANIMALS_URL
}

function buildFacetsUrl(filters: Pick<AnimalListQuery, 'city' | 'shelterId'>): string {
  const p = new URLSearchParams()
  if (filters.city?.trim()) p.set('city', filters.city.trim())
  if (filters.shelterId?.trim()) p.set('shelterId', filters.shelterId.trim())
  const q = p.toString()
  return q ? `${ANIMALS_URL}/facets?${q}` : `${ANIMALS_URL}/facets`
}

/** Public list page: never send CMS key. */
export async function fetchAnimalsPublicPage(
  filters: AnimalListQuery,
  page: AnimalPageParams = {},
) {
  return fetchJsonZod(
    buildListUrl(filters, page),
    { headers: {} },
    INVALID_JSON_ANIMALS,
    pagedAnimalsResponseSchema,
    'publicRead',
  )
}

/** CMS key when set widens listing to unpublished rows (server-side). */
export async function fetchAnimalsPage(
  filters: AnimalListQuery,
  page: AnimalPageParams = {},
) {
  return fetchJsonZod(
    buildListUrl(filters, page),
    { headers: { ...buildCmsHeaders() } },
    INVALID_JSON_ANIMALS,
    pagedAnimalsResponseSchema,
    'publicRead',
  )
}

const MAX_ANIMAL_PAGES = 500

/** Load all pages for the given filters (directory unscoped / CMS tools). Honors total from API. */
export async function fetchAllAnimalsPages(
  filters: AnimalListQuery,
  opts: { cms: boolean; shuffleSeed?: string | null },
): Promise<Animal[]> {
  const limit = ANIMAL_PAGE_SIZE
  let offset = 0
  const out: Animal[] = []
  for (let i = 0; i < MAX_ANIMAL_PAGES; i++) {
    const page = opts.cms
      ? await fetchAnimalsPage(filters, { limit, offset, shuffleSeed: opts.shuffleSeed })
      : await fetchAnimalsPublicPage(filters, { limit, offset, shuffleSeed: opts.shuffleSeed })
    out.push(...page.items)
    if (page.total === 0 || out.length >= page.total || page.items.length === 0) break
    offset += page.items.length
  }
  return out
}

/** Explore: paged public load with shuffle seed (caller may merge pages). */
export async function fetchAllAnimalsPublicForExplore(
  filters: AnimalListQuery,
  shuffleSeed: string,
): Promise<Animal[]> {
  return fetchAllAnimalsPages(filters, { cms: false, shuffleSeed })
}

export async function fetchAnimalSpeciesFacets(
  filters: Pick<AnimalListQuery, 'city' | 'shelterId'>,
): Promise<Record<string, number>> {
  const res = await fetchJsonZod(
    buildFacetsUrl(filters),
    { headers: { ...buildCmsHeaders() } },
    INVALID_JSON_ANIMALS,
    animalSpeciesFacetsResponseSchema,
    'publicRead',
  )
  return res.counts
}

export async function fetchAnimalById(id: string): Promise<Animal> {
  return fetchJsonZod(
    `${ANIMALS_URL}/${encodeURIComponent(id)}`,
    { headers: { ...buildCmsHeaders() } },
    INVALID_JSON_ANIMALS,
    animalSchema,
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
