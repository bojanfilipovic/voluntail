/**
 * Writes `public/robots.txt` and `public/sitemap.xml` before `vite build`.
 * Uses `process.env.VITE_SITE_ORIGIN` when set (e.g. in CI or `.env.production`).
 */
import { writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = resolve(__dirname, '../public')

const origin = (process.env.VITE_SITE_ORIGIN || 'https://voluntail.vercel.app').replace(/\/$/, '')

const paths = ['/', '/adopteren', '/vrijwilliger', '/hoe-het-werkt', '/explore']

const urlEntries = paths
  .map((p) => {
    const loc = `${origin}${p}`
    const priority = p === '/' ? '1.0' : '0.8'
    return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`
  })
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`

writeFileSync(resolve(publicDir, 'sitemap.xml'), sitemap)
writeFileSync(
  resolve(publicDir, 'robots.txt'),
  `User-agent: *\nAllow: /\n\nSitemap: ${origin}/sitemap.xml\n`,
)
