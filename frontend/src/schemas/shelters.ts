import { z } from 'zod'

/** Mirrors GET /api/shelters items and POST success body. */
export const shelterSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  species: z.array(z.string()),
  signupUrl: z.string().nullish(),
  imageUrl: z.string().nullish(),
  donationUrl: z.string().nullish(),
})

export const sheltersListSchema = z.array(shelterSchema)

export type Shelter = z.infer<typeof shelterSchema>
