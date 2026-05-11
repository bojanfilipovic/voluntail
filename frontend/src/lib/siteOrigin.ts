/**
 * Canonical public origin (no trailing slash).
 * Set `VITE_SITE_ORIGIN` in production so canonicals, OG URLs, and sitemap match the live host.
 */
export function getSiteOrigin(): string {
  const raw = import.meta.env.VITE_SITE_ORIGIN?.trim()
  if (raw) return raw.replace(/\/$/, '')
  if (typeof window !== 'undefined') return window.location.origin
  return 'https://voluntail.vercel.app'
}
