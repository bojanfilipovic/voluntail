import type { Shelter } from '@/api/shelters'

export type ShelterCountryResolution = {
  /** Distinct ISO 3166-1 alpha-2 codes that contain at least one shelter (from Tilequery). */
  isoCodes: Set<string>
  /** Per-shelter ISO for chip zoom / future pagination-safe summaries. */
  isoByShelterId: Map<string, string>
}

function validCoord(s: Shelter): boolean {
  return (
    Number.isFinite(s.latitude) &&
    Number.isFinite(s.longitude) &&
    Math.abs(s.latitude) <= 90 &&
    Math.abs(s.longitude) <= 180
  )
}

/**
 * Mapbox Tilequery against Mapbox Countries v1 — resolves admin ISO at a point.
 * @see https://docs.mapbox.com/api/maps/tilequery/
 */
export async function tilequeryCountryIso(
  longitude: number,
  latitude: number,
  accessToken: string,
): Promise<string | null> {
  const url = new URL(
    `https://api.mapbox.com/v4/mapbox.country-boundaries-v1/tilequery/${longitude},${latitude}.json`,
  )
  url.searchParams.set('access_token', accessToken)
  url.searchParams.set('limit', '10')

  const res = await fetch(url.toString())
  if (!res.ok) return null

  const data = (await res.json()) as {
    features?: Array<{ properties?: Record<string, string> }>
  }
  const features = data.features ?? []

  for (const f of features) {
    const p = f.properties
    if (!p) continue
    const disputed = p.disputed as string | boolean | undefined
    if (disputed !== 'false' && disputed !== false) continue
    const iso = p.iso_3166_1
    if (typeof iso !== 'string' || iso.length !== 2) continue
    return iso.toUpperCase()
  }

  return null
}

/** Dedupe Tilequery: one request per ~11m rounded coordinate bucket. */
function coordKey(lon: number, lat: number): string {
  return `${lon.toFixed(4)},${lat.toFixed(4)}`
}

/**
 * Resolve shelter → ISO using Mapbox Tilequery (deduped).
 * Replace later with `countryCode` from GET /api/shelters or GET /api/shelters/countries when available.
 */
export async function resolveShelterCountriesWithTilequery(
  shelters: Shelter[],
  accessToken: string,
): Promise<ShelterCountryResolution> {
  const valid = shelters.filter(validCoord)
  const bucket = new Map<string, Shelter[]>()

  for (const s of valid) {
    const k = coordKey(s.longitude, s.latitude)
    const list = bucket.get(k) ?? []
    list.push(s)
    bucket.set(k, list)
  }

  const isoByShelterId = new Map<string, string>()
  const isoCodes = new Set<string>()

  const entries = [...bucket.entries()]
  const concurrency = 6

  for (let i = 0; i < entries.length; i += concurrency) {
    const chunk = entries.slice(i, i + concurrency)
    await Promise.all(
      chunk.map(async ([key, list]) => {
        const [lonS, latS] = key.split(',')
        const lon = Number(lonS)
        const lat = Number(latS)
        const iso = await tilequeryCountryIso(lon, lat, accessToken)
        if (!iso) return
        isoCodes.add(iso)
        for (const sh of list) {
          isoByShelterId.set(sh.id, iso)
        }
      }),
    )
  }

  return { isoCodes, isoByShelterId }
}
