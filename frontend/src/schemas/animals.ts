import { z } from 'zod'

import { SPECIES_VALUES } from '@/domain/species'

const shelterSpeciesEnum = z.enum(SPECIES_VALUES)

export const ANIMAL_STATUS_VALUES = ['available', 'reserved', 'adopted'] as const
export type AnimalStatus = (typeof ANIMAL_STATUS_VALUES)[number]

const animalStatusEnum = z.enum(ANIMAL_STATUS_VALUES)

export const animalSchema = z.object({
  id: z.string(),
  shelterId: z.string(),
  city: z.string(),
  name: z.string(),
  description: z.string(),
  species: shelterSpeciesEnum,
  status: animalStatusEnum,
  published: z.boolean(),
  imageUrls: z
    .union([z.array(z.string()), z.null()])
    .optional()
    .transform((v) => v ?? []),
  imageUrl: z.string().nullish(),
  externalUrl: z.string().nullish(),
  createdAt: z.string(),
  heartCount: z.number(),
})

export type Animal = z.infer<typeof animalSchema>

export const animalsListSchema = z.array(animalSchema)

/** Paginated GET /api/animals */
export const pagedAnimalsResponseSchema = z.object({
  items: z.array(animalSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
})

export type PagedAnimalsResponse = z.infer<typeof pagedAnimalsResponseSchema>

export const animalSpeciesFacetsResponseSchema = z.object({
  counts: z.record(z.string(), z.number()),
})

export type AnimalSpeciesFacetsResponse = z.infer<typeof animalSpeciesFacetsResponseSchema>

export const animalPatchPayloadSchema = z.object({
  shelterId: z.string().optional(),
  city: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  species: shelterSpeciesEnum.optional(),
  status: animalStatusEnum.optional(),
  published: z.boolean().optional(),
  imageUrls: z.array(z.string()).optional(),
  imageUrl: z.string().nullish(),
  externalUrl: z.string().nullish(),
})

export type AnimalPatchPayload = z.infer<typeof animalPatchPayloadSchema>

export const animalHeartResponseSchema = z.object({
  heartCount: z.number(),
})

export type AnimalHeartResponse = z.infer<typeof animalHeartResponseSchema>
