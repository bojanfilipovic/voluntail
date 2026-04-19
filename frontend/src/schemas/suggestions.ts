import { z } from 'zod'

/** POST /api/suggestions success body */
export const suggestionCreatedSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
})

export type SuggestionCreated = z.infer<typeof suggestionCreatedSchema>
