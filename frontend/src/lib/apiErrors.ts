/**
 * User-facing API failure messages (avoid raw "HTTP 502" in the UI).
 * Keep server response body when it looks like plain text from our API.
 */

const BACKEND_UNREACHABLE =
  'Could not reach the shelter API. If you run locally, start the backend (e.g. Ktor on port 8080) and refresh.'

const NETWORK_FAILED =
  'Network error — check your connection and that the API is running.'

/** Non-empty, non-HTML error body from our API (for layered handlers). */
export function plainTextErrorBody(raw: string): string | null {
  const t = raw.trim()
  if (!t || isProbablyHtml(t) || t.length >= 2000) return null
  return t
}

/** Strip HTML error pages from proxies (e.g. nginx 502 body). */
function isProbablyHtml(text: string): boolean {
  const t = text.trimStart()
  return t.startsWith('<!') || t.startsWith('<html')
}

export function friendlyHttpStatusMessage(status: number): string {
  switch (status) {
    case 502:
    case 503:
    case 504:
      return BACKEND_UNREACHABLE
    case 401:
      return 'Not authorized — check your CMS API key matches the server.'
    case 403:
      return 'This action is not allowed (CMS may be disabled or the key is wrong).'
    case 404:
      return 'That shelter was not found.'
    case 429:
      return 'Too many requests — try again in a moment.'
    default:
      if (status >= 500) {
        return 'The server had a problem. Try again later.'
      }
      return `Request failed (${status}).`
  }
}

/**
 * Prefer short plain-text body from API; otherwise map status to a friendly line.
 */
export async function errorMessageFromResponse(res: Response): Promise<string> {
  const detail = (await res.text().catch(() => '')).trim()
  if (detail && !isProbablyHtml(detail) && detail.length < 2000) {
    return detail
  }
  return friendlyHttpStatusMessage(res.status)
}

export function errorFromFetchFailure(reason: unknown): Error {
  if (reason instanceof TypeError) {
    const m = reason.message.toLowerCase()
    if (m.includes('fetch') || m.includes('network') || m.includes('failed')) {
      return new Error(NETWORK_FAILED)
    }
  }
  if (reason instanceof Error) {
    return reason
  }
  return new Error(NETWORK_FAILED)
}
