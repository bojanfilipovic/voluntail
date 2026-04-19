import { suggestionCreatedSchema, type SuggestionCreated } from '@/schemas/suggestions'

const SUGGESTIONS_URL = '/api/suggestions'

export type { SuggestionCreated }

export async function postSuggestion(payload: {
  message: string
  contact?: string
}): Promise<SuggestionCreated> {
  const body: { message: string; contact?: string } = {
    message: payload.message,
  }
  const c = payload.contact?.trim()
  if (c) {
    body.contact = c
  }

  const res = await fetch(SUGGESTIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    if (res.status === 503) {
      throw new Error(detail || 'Feedback is temporarily unavailable.')
    }
    if (res.status === 429) {
      throw new Error(detail || 'Feedback inbox is full for this pilot.')
    }
    if (res.status === 400) {
      throw new Error(detail || 'Invalid suggestion.')
    }
    throw new Error(detail || `HTTP ${res.status}`)
  }

  let raw: unknown
  try {
    raw = await res.json()
  } catch {
    throw new Error('Invalid JSON from /api/suggestions')
  }

  return suggestionCreatedSchema.parse(raw)
}
