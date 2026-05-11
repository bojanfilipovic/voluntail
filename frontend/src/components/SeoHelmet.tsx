import { Helmet } from 'react-helmet-async'

import { getSiteOrigin } from '@/lib/siteOrigin'

type Props = {
  title: string
  description: string
  /** Path starting with `/` (e.g. `/adopteren`). */
  path: string
  /** When false, emit noindex for soft-404s etc. */
  index?: boolean
  /** When false and index is false, skip canonical (avoid fake /404 URLs). */
  canonical?: boolean
}

export function SeoHelmet({ title, description, path, index = true, canonical = true }: Props) {
  const origin = getSiteOrigin()
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${origin}${normalizedPath === '/' ? '/' : normalizedPath}`
  const imageUrl = `${origin}/og-image.png`

  return (
    <Helmet>
      <html lang="nl" />
      <title>{title}</title>
      <meta name="description" content={description} />
      {!index ? <meta name="robots" content="noindex, nofollow" /> : null}
      {index && canonical ? <link rel="canonical" href={url} /> : null}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:locale" content="nl_NL" />
      {index ? <meta property="og:url" content={url} /> : null}
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
    </Helmet>
  )
}
