import {
  animalSchema,
  animalsListSchema,
  type Animal,
  type AnimalPatchPayload,
} from '@/schemas/animals'
import type { ShelterSpecies } from '@/domain/species'
import type { AnimalListQuery } from '@/lib/queryKeys'
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
  imageUrl?: string | null
  externalUrl?: string | null
}

const ANIMALS_URL = '/api/animals'

const CMS_HEADER = 'X-CMS-Key'

function cmsHeaders(): HeadersInit {
  const key = import.meta.env.VITE_CMS_API_KEY?.trim()
  if (!key) return {}
  return { [CMS_HEADER]: key }
}

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
  const res = await fetch(buildListUrl(filters), { headers: {} })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    throw new Error('Invalid JSON from /api/animals')
  }
  return animalsListSchema.parse(raw)
}

/** CMS key when set widens listing to unpublished rows (server-side). */
export async function fetchAnimals(filters: AnimalListQuery): Promise<Animal[]> {
  const res = await fetch(buildListUrl(filters), {
    headers: { ...cmsHeaders() },
  })
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }
  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    throw new Error('Invalid JSON from /api/animals')
  }
  return animalsListSchema.parse(raw)
}

export async function createAnimal(body: AnimalCreatePayload): Promise<Animal> {
  const res = await fetch(ANIMALS_URL, {
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
  return animalSchema.parse(raw)
}

export async function updateAnimal(
  id: string,
  body: AnimalPatchPayload,
): Promise<Animal> {
  const res = await fetch(`${ANIMALS_URL}/${encodeURIComponent(id)}`, {
    method: 'PATCH',
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
  return animalSchema.parse(raw)
}

export async function deleteAnimal(id: string): Promise<void> {
  const res = await fetch(`${ANIMALS_URL}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { ...cmsHeaders() },
  })
  if (res.status === 204) return
  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(detail || `HTTP ${res.status}`)
  }
}
