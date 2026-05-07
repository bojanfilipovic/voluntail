import { apiFetch } from '@/lib/apiRequest'
import { parseJsonResponse } from '@/lib/http'
import { throwIfSuggestionPostFailed } from '@/lib/suggestionPostErrors'
import {
  suggestionCreatedSchema,
  type SuggestionCreated,
} from '@/schemas/suggestions'

const SUGGESTIONS_URL = '/api/suggestions'
const INVALID_JSON_SUGGESTIONS = 'Invalid JSON from /api/suggestions'

export type { SuggestionCreated }

export async function postSuggestion(payload: {
  message: string
  contact?: string
  shelterId?: string
  animalId?: string
}): Promise<SuggestionCreated> {
  const body: {
    message: string
    contact?: string
    shelterId?: string
    animalId?: string
  } = {
    message: payload.message,
  }
  const c = payload.contact?.trim()
  if (c) {
    body.contact = c
  }
  if (payload.shelterId) {
    body.shelterId = payload.shelterId
  }
  if (payload.animalId) {
    body.animalId = payload.animalId
  }

  const res = await apiFetch(SUGGESTIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  await throwIfSuggestionPostFailed(res)

  const raw = await parseJsonResponse(res, INVALID_JSON_SUGGESTIONS)
  return suggestionCreatedSchema.parse(raw)
}
