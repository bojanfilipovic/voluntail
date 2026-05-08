import type { Map as MapboxMap } from 'mapbox-gl'

/** IDs registered on the Mapbox map for symbol-layer shelter pins (solid teardrop / “map pin” silhouette). */
export const SHELTER_PIN_IMAGE_IDS = {
  default: 'voluntail-pin',
  selected: 'voluntail-pin-selected',
  animal: 'voluntail-pin-animal',
} as const

/** Classic location-pin outline (one closed path); tip at bottom center for `icon-anchor: bottom`. */
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

/** Register raster pin images once per map instance (symbol layer references these IDs). */
export async function ensureShelterPinImages(map: MapboxMap): Promise<void> {
  if (typeof document === 'undefined') return
  if (map.hasImage(SHELTER_PIN_IMAGE_IDS.default)) return

  const specs = [
    [SHELTER_PIN_IMAGE_IDS.default, '#57534e', '#fafaf9'],
    [SHELTER_PIN_IMAGE_IDS.selected, '#c2410c', '#ffffff'],
    [SHELTER_PIN_IMAGE_IDS.animal, '#059669', '#ffffff'],
  ] as const

  for (const [id, fill, stroke] of specs) {
    const img = await loadImage(svgPinDataUrl(fill, stroke))
    map.addImage(id, img, { pixelRatio: 2 })
  }
}
