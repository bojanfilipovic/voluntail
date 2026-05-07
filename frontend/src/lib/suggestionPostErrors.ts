/**
 * POST /api/suggestions uses plain-text bodies and pilot-specific status messages.
 * Centralized so suggestion-like endpoints stay consistent.
 */

import {
  friendlyHttpStatusMessage,
  isProbablyInfrastructureErrorBody,
  plainTextErrorBody,
} from '@/lib/apiErrors'

export async function throwIfSuggestionPostFailed(res: Response): Promise<void> {
  if (res.ok) return
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
