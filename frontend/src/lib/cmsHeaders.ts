/** Shared CMS auth header for mutation routes (matches Ktor `X-CMS-Key`). */

export const CMS_HEADER = 'X-CMS-Key'

export function buildCmsHeaders(): HeadersInit {
  const key = import.meta.env.VITE_CMS_API_KEY?.trim()
  if (!key) return {}
  return { [CMS_HEADER]: key }
}
