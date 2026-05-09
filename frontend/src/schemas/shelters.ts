import { z } from 'zod'

import { SPECIES_VALUES } from '@/domain/species'

const shelterSpeciesEnum = z.enum(SPECIES_VALUES)

/** Mirrors GET /api/shelters items and POST success body. */
export const shelterSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  species: z.array(shelterSpeciesEnum),
  /** ISO 3166-1 alpha-2 from backend coordinate regions — omit if older API. */
  countryCode: z.string().optional().nullable(),
  signupUrl: z.string().nullish(),
  imageUrl: z.string().nullish(),
  donationUrl: z.string().nullish(),
  city: z.string(),
})

export type Shelter = z.infer<typeof shelterSchema>

export const pagedSheltersResponseSchema = z.object({
  items: z.array(shelterSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export type PagedSheltersResponse = z.infer<typeof pagedSheltersResponseSchema>

/** GET /api/shelters/map-markers — full rows, same shape as list items. */
export const sheltersListSchema = z.array(shelterSchema)

/** PATCH /api/shelters/:id — only send fields that should change (omit unknown keys). */
export const shelterPatchPayloadSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  species: z.array(shelterSpeciesEnum).optional(),
  signupUrl: z.string().nullish(),
  imageUrl: z.string().nullish(),
  donationUrl: z.string().nullish(),
  city: z.string().optional(),
})

export type ShelterPatchPayload = z.infer<typeof shelterPatchPayloadSchema>
