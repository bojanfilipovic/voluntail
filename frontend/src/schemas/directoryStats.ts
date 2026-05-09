import { z } from 'zod'

export const directoryStatsResponseSchema = z.object({
  shelterCount: z.number(),
  animalCount: z.number(),
  heartCountSum: z.number(),
})

export type DirectoryStatsResponse = z.infer<typeof directoryStatsResponseSchema>
