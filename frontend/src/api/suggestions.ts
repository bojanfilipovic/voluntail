import {
  errorFromFetchFailure,
  friendlyHttpStatusMessage,
  isProbablyInfrastructureErrorBody,
  plainTextErrorBody,
} from '@/lib/apiErrors'
import { parseJsonResponse } from '@/lib/http'
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

  let res: Response
  try {
    res = await fetch(SUGGESTIONS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch (e) {
    throw errorFromFetchFailure(e)
  }

  if (!res.ok) {
    const rawText = await res.text().catch(() => '')
    const plain = plainTextErrorBody(rawText)
    const usePlain = plain && !isProbablyInfrastructureErrorBody(plain)
    if (res.status === 503) {
      throw new Error(
        (usePlain ? plain : null) ?? 'Feedback is temporarily unavailable.',
      )
    }
    if (res.status === 429) {
      throw new Error((usePlain ? plain : null) ?? 'Feedback inbox is full for this pilot.')
    }
    if (res.status === 400) {
      throw new Error((usePlain ? plain : null) ?? 'Invalid suggestion.')
    }
    throw new Error((usePlain ? plain : null) ?? friendlyHttpStatusMessage(res.status))
  }

  const raw = await parseJsonResponse(res, INVALID_JSON_SUGGESTIONS)
  return suggestionCreatedSchema.parse(raw)
}
