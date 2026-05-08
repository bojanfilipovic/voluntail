/**
 * Derives the shelter list "Website" href from `signupUrl` (volunteer/contact).
 * Default: `origin` only so the list does not deep-link to signup/contact.
 *
 * Dierenbescherming: same contact URL with the final `/contact` path segment removed
 * (branch identity on a shared domain). Volunteer dialogs still use full `signupUrl`.
 * Intentionally fragile if their URL scheme changes.
 */
function isDierenbeschermingHost(hostname: string): boolean {
  const h = hostname.replace(/^www\./i, '').toLowerCase()
  return h === 'dierenbescherming.nl' || h.endsWith('.dierenbescherming.nl')
}

export function listWebsiteHref(signupUrl: string): string {
  try {
    const u = new URL(signupUrl)
    if (!isDierenbeschermingHost(u.hostname)) {
      return u.origin
    }

    const pathNoTrailing = u.pathname.replace(/\/+$/, '') || '/'
    if (pathNoTrailing !== '/' && pathNoTrailing.endsWith('/contact')) {
      const stripped =
        pathNoTrailing.slice(0, -'/contact'.length).replace(/\/+$/, '') || '/'
      u.pathname = stripped === '/' ? '/' : `${stripped}/`
      return u.toString()
    }

    return u.origin
  } catch {
    return signupUrl
  }
}
