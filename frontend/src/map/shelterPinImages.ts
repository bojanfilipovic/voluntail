import type { Map as MapboxMap } from 'mapbox-gl'

/** IDs registered on the Mapbox map for symbol-layer shelter pins (solid teardrop silhouette). */
export const SHELTER_PIN_IMAGE_IDS = {
  default: 'voluntail-pin',
  selected: 'voluntail-pin-selected',
  animal: 'voluntail-pin-animal',
} as const

function svgPinDataUrl(fill: string, stroke: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="72" height="92" viewBox="0 0 72 92">
  <path
    fill="${fill}"
    stroke="${stroke}"
    stroke-width="3"
    stroke-linejoin="round"
    d="M36 6 C22 6 10 18 10 32 C10 50 36 84 36 84 C36 84 62 50 62 32 C62 18 50 6 36 6 Z"
  />
</svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * Register teardrop rasters. Call again on `style.load` and when `isDark` changes — custom images
 * are cleared on style swap; default pin colors follow the basemap (light vs dark).
 *
 * Callers should **not** run multiple instances concurrently for the same map (see ShelterMap
 * single-flight registration); otherwise `removeImage` / `addImage` can race with symbol layers.
 */
export async function ensureShelterPinImages(
  map: MapboxMap,
  isDark: boolean,
): Promise<void> {
  if (typeof document === 'undefined') return

  const defaultFill = isDark ? '#ffffff' : '#171717'
  const defaultStroke = isDark ? '#171717' : '#ffffff'

  const specs = [
    [SHELTER_PIN_IMAGE_IDS.default, defaultFill, defaultStroke],
    [SHELTER_PIN_IMAGE_IDS.selected, '#c2410c', '#ffffff'],
    [SHELTER_PIN_IMAGE_IDS.animal, '#059669', '#ffffff'],
  ] as const

  for (const [id, fill, stroke] of specs) {
    if (map.hasImage(id)) {
      try {
        map.removeImage(id)
      } catch {
        /* still referenced during rare style transitions */
      }
    }
    const img = await loadImage(svgPinDataUrl(fill, stroke))
    try {
      map.addImage(id, img, { pixelRatio: 2 })
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      if (!msg.includes('already exists')) throw e
      try {
        map.removeImage(id)
      } catch {
        /* noop */
      }
      map.addImage(id, img, { pixelRatio: 2 })
    }
  }
}
