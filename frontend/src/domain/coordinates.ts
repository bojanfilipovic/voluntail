/** Client-side coordinate checks aligned with backend shelter geo validation. */

export type CoordParseResult =
  | { ok: true; latitude: number; longitude: number }
  | { ok: false; error: string }

export function parseValidatedCoords(
  latitude: string,
  longitude: string,
): CoordParseResult {
  const lat = Number(latitude)
  const lng = Number(longitude)
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return { ok: false, error: 'Latitude and longitude must be valid numbers.' }
  }
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { ok: false, error: 'Coordinates out of range.' }
  }
  return { ok: true, latitude: lat, longitude: lng }
}
