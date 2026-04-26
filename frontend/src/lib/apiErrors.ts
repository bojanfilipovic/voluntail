/**
 * User-facing API failure messages (avoid raw "HTTP 502" in the UI).
 * Keep server response body when it looks like plain text from our API.
 */

/** `publicRead` = unauthenticated GET /api/... list/directory. */
export type PublicApiErrorContext = 'default' | 'publicRead'

const NETWORK_FAILED =
  'Network error — check your connection and that the API is running.'

const BACKEND_UNREACHABLE_DEV =
  'Could not reach the shelter API. If you run locally, start the backend (e.g. Ktor on port 8080) and refresh.'

const BACKEND_UNREACHABLE_PROD =
  "We couldn’t reach the shelter data right now. Please try again in a moment."

function backendUnreachableUserMessage(): string {
  return import.meta.env.DEV ? BACKEND_UNREACHABLE_DEV : BACKEND_UNREACHABLE_PROD
}

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

/**
 * Bodies from static hosts / CDNs (e.g. Vercel 404 when /api is not proxied) —
 * not useful to show verbatim; prefer friendly status messages.
 */
export function isProbablyInfrastructureErrorBody(detail: string): boolean {
  const t = detail.trim()
  if (t.length < 4) return false
  if (/The page could not be found/i.test(t)) return true
  if (/\bNOT_FOUND\b/.test(t)) return true
  if (/[a-z]{2,6}\d*::[a-z0-9-]+/i.test(t)) return true
  return false
}

const MSG_404_DEFAULT =
  "We couldn’t find that, or it may have been removed."

const MSG_404_PUBLIC_READ =
  'The directory is temporarily unavailable. Please try again later.'

/**
 * @deprecated Prefer errorMessageFromResponse; kept for call sites that already have status + no body.
 */
export function friendlyHttpStatusMessage(
  status: number,
  context: PublicApiErrorContext = 'default',
): string {
  switch (status) {
    case 502:
    case 503:
    case 504:
      return backendUnreachableUserMessage()
    case 401:
      return 'Not authorized — check your CMS API key matches the server.'
    case 403:
      return 'This action is not allowed (CMS may be disabled or the key is wrong).'
    case 404:
      return context === 'publicRead' ? MSG_404_PUBLIC_READ : MSG_404_DEFAULT
    case 429:
      return 'Too many requests — try again in a moment.'
    default:
      if (status >= 500) {
        return 'The server had a problem. Try again later.'
      }
      return `Request failed (${status}).`
  }
}

function messageFromBodyOrContext(
  detail: string,
  context: PublicApiErrorContext,
  status: number,
): string {
  if (
    detail &&
    !isProbablyHtml(detail) &&
    detail.length < 2000 &&
    !isProbablyInfrastructureErrorBody(detail)
  ) {
    return detail
  }
  return friendlyHttpStatusMessage(status, context)
}

/**
 * Prefer short plain-text body from our API; otherwise map status to a friendly line.
 * Use `publicRead` for unauthenticated list/directory fetches (GET /api/shelters, GET /api/animals).
 */
export async function errorMessageFromResponse(
  res: Response,
  context: PublicApiErrorContext = 'default',
): Promise<string> {
  const detail = (await res.text().catch(() => '')).trim()
  return messageFromBodyOrContext(detail, context, res.status)
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
