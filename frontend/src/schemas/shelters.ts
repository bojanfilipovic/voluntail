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
  signupUrl: z.string().nullish(),
  imageUrl: z.string().nullish(),
  donationUrl: z.string().nullish(),
})

export const sheltersListSchema = z.array(shelterSchema)

export type Shelter = z.infer<typeof shelterSchema>

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
})

export type ShelterPatchPayload = z.infer<typeof shelterPatchPayloadSchema>
