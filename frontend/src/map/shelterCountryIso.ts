/**
 * Same bounding regions as backend `ShelterCountryIso.kt` — keeps map tint when `countryCode`
 * is absent from the API (older deploy) and avoids duplicate Tilequery calls.
 */
const REGION_BOXES: readonly [
  minLat: number,
  maxLat: number,
  minLon: number,
  maxLon: number,
  iso: string,
][] = [
  [42.2, 46.95, 13.0, 19.55, 'HR'],
  [50.75, 53.55, 3.3, 7.23, 'NL'],
]

export function countryIsoFromLatLon(latitude: number, longitude: number): string | null {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null
  for (const [minLat, maxLat, minLon, maxLon, iso] of REGION_BOXES) {
    if (latitude >= minLat && latitude <= maxLat && longitude >= minLon && longitude <= maxLon) {
      return iso
    }
  }
  return null
}
