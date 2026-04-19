import { suggestionCreatedSchema, type SuggestionCreated } from '@/schemas/suggestions'

const SUGGESTIONS_URL = '/api/suggestions'

export type { SuggestionCreated }

export async function postSuggestion(message: string): Promise<SuggestionCreated> {
  const res = await fetch(SUGGESTIONS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
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
