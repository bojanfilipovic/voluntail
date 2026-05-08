import bbox from '@turf/bbox'
import { featureCollection, point } from '@turf/helpers'
import type { Shelter } from '@/api/shelters'

/** Mapbox `fitBounds` expects west-south, east-north in longitude/latitude order. */
export type LngLatBounds = [[number, number], [number, number]]

const MIN_SPAN_DEG = 0.08

function isValidCoord(s: Shelter): boolean {
  return (
    Number.isFinite(s.latitude) &&
    Number.isFinite(s.longitude) &&
    Math.abs(s.latitude) <= 90 &&
    Math.abs(s.longitude) <= 180
  )
}

/** Stable key when shelter coordinates or membership change; ignores unrelated refetches. */
export function shelterGeometryKey(shelters: Shelter[]): string {
  return shelters
    .filter(isValidCoord)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((s) => `${s.id}:${s.latitude.toFixed(6)}:${s.longitude.toFixed(6)}`)
    .join('|')
}

function expandIfDegenerate(bounds: LngLatBounds): LngLatBounds {
  const [[w, s], [e, n]] = bounds
  const lonSpan = e - w
  const latSpan = n - s
  if (lonSpan >= MIN_SPAN_DEG && latSpan >= MIN_SPAN_DEG) {
    return bounds
  }
  const cx = (w + e) / 2
  const cy = (s + n) / 2
  const half = MIN_SPAN_DEG / 2
  return [
    [cx - half, cy - half],
    [cx + half, cy + half],
  ]
}

/**
 * Web-Mercator-friendly bounds for `map.fitBounds`.
 * Returns null when there are no valid shelter coordinates.
 */
export function boundsFromShelters(shelters: Shelter[]): LngLatBounds | null {
  const pts = shelters.filter(isValidCoord)
  if (pts.length === 0) return null
  if (pts.length === 1) {
    const { longitude: lng, latitude: lat } = pts[0]
    const half = 0.35
    return expandIfDegenerate([
      [lng - half, lat - half],
      [lng + half, lat + half],
    ])
  }
  const fc = featureCollection(pts.map((p) => point([p.longitude, p.latitude])))
  const b = bbox(fc)
  return expandIfDegenerate([
    [b[0], b[1]],
    [b[2], b[3]],
  ])
}

export const FIT_BOUNDS_PADDING = { top: 48, bottom: 88, left: 48, right: 48 }
export const FIT_BOUNDS_MAX_ZOOM_MULTI = 11
export const FIT_BOUNDS_MAX_ZOOM_SINGLE = 12
