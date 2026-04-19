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
  imageUrl: z.string().nullish(),
  externalUrl: z.string().nullish(),
})

export const animalsListSchema = z.array(animalSchema)

export type Animal = z.infer<typeof animalSchema>

export const animalPatchPayloadSchema = z.object({
  shelterId: z.string().optional(),
  city: z.string().optional(),
  name: z.string().optional(),
  description: z.string().optional(),
  species: shelterSpeciesEnum.optional(),
  status: animalStatusEnum.optional(),
  published: z.boolean().optional(),
  imageUrl: z.string().nullish(),
  externalUrl: z.string().nullish(),
})

export type AnimalPatchPayload = z.infer<typeof animalPatchPayloadSchema>
