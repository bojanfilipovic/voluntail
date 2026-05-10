import 'mapbox-gl/dist/mapbox-gl.css'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  boundsFromShelters,
  FIT_BOUNDS_MAX_ZOOM_MULTI,
  FIT_BOUNDS_MAX_ZOOM_SINGLE,
  FIT_BOUNDS_PADDING,
  shelterGeometryKey,
} from '@/map/shelterBounds'
import {
  ensureShelterPinImages,
  SHELTER_PIN_IMAGE_IDS,
} from '@/map/shelterPinImages'
import { countryIsoFromLatLon } from '@/map/shelterCountryIso'
import type { Shelter } from '@/api/shelters'
import bbox from '@turf/bbox'
import type { Feature, FeatureCollection, MultiPolygon, Polygon } from 'geojson'
import type { GeoJSONSource, Map as MapboxMap, MapMouseEvent } from 'mapbox-gl'
import { Maximize2 } from 'lucide-react'
import {
  forwardRef,
  startTransition,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import MapGL, {
  Layer,
  Marker,
  NavigationControl,
  Source,
  type MapRef,
} from 'react-map-gl/mapbox'

/** Fallback frame when there are no coordinates yet (legacy NL–HR pilot). */
const NL_VIEW = {
  longitude: 11.4,
  latitude: 48.0,
  zoom: 4.5,
} as const

const SHELTER_CLUSTER_SOURCE = 'voluntail-shelter-cluster'
const LAYER_CLUSTERS = 'voluntail-clusters'
const LAYER_CLUSTER_COUNT = 'voluntail-cluster-count'
const LAYER_UNCLUSTERED = 'voluntail-unclustered-point'
/** @see https://docs.mapbox.com/data/tilesets/reference/mapbox-countries-v1/ */
const MAPBOX_COUNTRIES_TILESET = 'mapbox://mapbox.country-boundaries-v1'
const COUNTRY_VECTOR_SOURCE = 'voluntail-country-boundaries'
const LAYER_COUNTRY_FILL = 'voluntail-country-fill-layer'

function countryLayerIds(hasCountries: boolean): string[] {
  if (!hasCountries) return []
  return [LAYER_COUNTRY_FILL]
}

function shelterLayersPresentOnMap(map: MapboxMap): string[] {
  return [LAYER_CLUSTERS, LAYER_CLUSTER_COUNT, LAYER_UNCLUSTERED].filter((id) =>
    Boolean(map.getLayer(id)),
  )
}

/** Whether any shelter cluster/unclustered symbol is visible (aligned with rendered pins, not raw lng/lat contains). */
function shelterPinsVisibleInViewport(map: MapboxMap): boolean {
  const canvas = map.getCanvas()
  const box: [[number, number], [number, number]] = [
    [0, 0],
    [canvas.width, canvas.height],
  ]
  const layers = shelterLayersPresentOnMap(map)
  if (layers.length === 0) return true
  try {
    const feats = map.queryRenderedFeatures(box, { layers })
    return feats.length > 0
  } catch {
    /* Style/layers not ready — avoid false “empty area” banner */
    return true
  }
}

export type MapCenter = { latitude: number; longitude: number }

export type ShelterMapHandle = {
  flyToShelter: (s: Shelter) => void
  getMapCenter: () => MapCenter
  fitAllShelters: () => void
}

type Props = {
  shelters: Shelter[]
  selectedId: string | null
  animalContextShelterId?: string | null
  onSelectShelter: (s: Shelter) => void
  onClearSelection?: () => void
  placementOrRelocateActive?: boolean
  draftLocation?: MapCenter | null
  onDraftPosition?: (c: MapCenter) => void
  isDark?: boolean
  /** Opens public “suggest a shelter” flow (optional empty-viewport hint). */
  onSuggestShelter?: () => void
}

function validShelters(shelters: Shelter[]): Shelter[] {
  return shelters.filter(
    (s) =>
      Number.isFinite(s.latitude) &&
      Number.isFinite(s.longitude) &&
      Math.abs(s.latitude) <= 90 &&
      Math.abs(s.longitude) <= 180,
  )
}

function defaultCenter(): MapCenter {
  return { latitude: NL_VIEW.latitude, longitude: NL_VIEW.longitude }
}

const pinBase =
  'pointer-events-auto block size-[22px] rotate-[-45deg] rounded-full rounded-bl-none border-2 border-background shadow-md cursor-pointer'

export const ShelterMap = forwardRef<ShelterMapHandle, Props>(
  function ShelterMap(
    {
      shelters,
      selectedId,
      animalContextShelterId = null,
      onSelectShelter,
      onClearSelection,
      placementOrRelocateActive = false,
      draftLocation = null,
      onDraftPosition,
      isDark = false,
      onSuggestShelter,
    },
    ref,
  ) {
    const mapRef = useRef<MapRef>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    const points = useMemo(() => validShelters(shelters), [shelters])
    const boundsKey = useMemo(() => shelterGeometryKey(shelters), [shelters])
    const shelterById = useMemo(() => new Map(points.map((s) => [s.id, s])), [points])

    const pointsRef = useRef(points)
    const boundsKeyRef = useRef(boundsKey)
    const isDarkRef = useRef(isDark)

    useEffect(() => {
      pointsRef.current = points
      boundsKeyRef.current = boundsKey
    }, [points, boundsKey])

    useEffect(() => {
      isDarkRef.current = isDark
    }, [isDark])

    const [mapReady, setMapReady] = useState(false)
    /** Unclustered symbol layer needs images; Mapbox warns if layers render before addImage completes. */
    const [shelterPinSpritesReady, setShelterPinSpritesReady] = useState(false)
    const [emptyViewportHint, setEmptyViewportHint] = useState(false)

    const lastFittedBoundsKeyRef = useRef<string | null>(null)
    /** Serialize pin raster registration — concurrent runs can remove images while symbol layers still mount. */
    const pinImageRegRef = useRef({ busy: false, pending: false })

    const runShelterPinImages = useCallback(async (map: MapboxMap): Promise<void> => {
      const reg = pinImageRegRef.current
      if (reg.busy) {
        reg.pending = true
        return
      }
      reg.busy = true
      try {
        do {
          reg.pending = false
          setShelterPinSpritesReady(false)
          try {
            await ensureShelterPinImages(map, isDarkRef.current)
            setShelterPinSpritesReady(true)
          } catch {
            setShelterPinSpritesReady(false)
          }
        } while (reg.pending)
      } finally {
        reg.busy = false
      }
    }, [])

    const { isoCodes, isoByShelterId } = useMemo(() => {
      const byId = new Map<string, string>()
      const codes = new Set<string>()
      for (const s of points) {
        const fromApi = s.countryCode?.trim().toUpperCase()
        const code =
          fromApi && fromApi.length === 2
            ? fromApi
            : countryIsoFromLatLon(s.latitude, s.longitude)
        if (code && code.length === 2) {
          codes.add(code)
          byId.set(s.id, code)
        }
      }
      return { isoCodes: codes, isoByShelterId: byId }
    }, [points])

    const shelterFeatureCollection = useMemo((): FeatureCollection => {
      return {
        type: 'FeatureCollection',
        features: points.map((s) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [s.longitude, s.latitude],
          },
          properties: {
            id: s.id,
            name: s.name,
          },
        })),
      }
    }, [points])

    const regionNames = useMemo(() => {
      try {
        return new Intl.DisplayNames(['en'], { type: 'region' })
      } catch {
        return null
      }
    }, [])

    const sortedIsoChips = useMemo(() => [...isoCodes].sort(), [isoCodes])

    const showCountryLayers = isoCodes.size > 0

    /** Shelter layers first so pointer/hover logic prefers pins over country tint. */
    const interactiveLayerIds = useMemo(
      () => [
        LAYER_CLUSTERS,
        LAYER_CLUSTER_COUNT,
        ...(shelterPinSpritesReady ? [LAYER_UNCLUSTERED] : []),
        ...countryLayerIds(showCountryLayers),
      ],
      [shelterPinSpritesReady, showCountryLayers],
    )

    /**
     * ISO highlight on Mapbox Countries — disputed=false only.
     * Omit worldview filter so EU-only tiles (e.g. HR) still render; ISO list comes from GET /api/shelters `countryCode`.
     */
    const countryFillFilter = useMemo(() => {
      const codes = [...isoCodes].sort()
      return [
        'all',
        ['==', ['get', 'disputed'], 'false'],
        ['in', ['get', 'iso_3166_1'], ['literal', codes]],
      ] as never
    }, [isoCodes])

    const resizeMap = useCallback(() => {
      const map = mapRef.current?.getMap()
      map?.resize()
    }, [])

    useEffect(() => {
      if (!token) return
      const el = containerRef.current
      if (!el || typeof ResizeObserver === 'undefined') return
      const ro = new ResizeObserver(() => {
        resizeMap()
      })
      ro.observe(el)
      return () => ro.disconnect()
    }, [token, resizeMap])

    /** Recolor default pin when theme toggles — same single-flight path as map load / style.load. */
    useEffect(() => {
      const map = mapRef.current?.getMap()
      if (!map || !mapReady || !token) return
      void runShelterPinImages(map)
    }, [isDark, mapReady, token, runShelterPinImages])

    const runFitBounds = useCallback(
      (duration: number) => {
        const map = mapRef.current?.getMap()
        if (!map || placementOrRelocateActive) return
        const b = boundsFromShelters(pointsRef.current)
        if (!b) return
        const n = pointsRef.current.length
        map.fitBounds(b, {
          padding: FIT_BOUNDS_PADDING,
          maxZoom: n <= 1 ? FIT_BOUNDS_MAX_ZOOM_SINGLE : FIT_BOUNDS_MAX_ZOOM_MULTI,
          duration,
          essential: true,
        })
      },
      [placementOrRelocateActive],
    )

    const handleFitAllClick = useCallback(() => {
      const map = mapRef.current?.getMap()
      if (!map) return
      const b = boundsFromShelters(pointsRef.current)
      if (!b) return
      const n = pointsRef.current.length
      map.fitBounds(b, {
        padding: FIT_BOUNDS_PADDING,
        maxZoom: n <= 1 ? FIT_BOUNDS_MAX_ZOOM_SINGLE : FIT_BOUNDS_MAX_ZOOM_MULTI,
        duration: 700,
        essential: true,
      })
      lastFittedBoundsKeyRef.current = boundsKeyRef.current
    }, [])

    useEffect(() => {
      if (!mapReady || placementOrRelocateActive) return
      if (boundsKey === lastFittedBoundsKeyRef.current) return
      const b = boundsFromShelters(pointsRef.current)
      if (!b) return
      lastFittedBoundsKeyRef.current = boundsKey
      runFitBounds(0)
    }, [mapReady, placementOrRelocateActive, boundsKey, runFitBounds])

    useEffect(() => {
      const map = mapRef.current?.getMap()
      if (!map || !mapReady || points.length === 0) {
        startTransition(() => setEmptyViewportHint(false))
        return
      }

      let timeoutId: ReturnType<typeof setTimeout>
      const update = () => {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          const visible = shelterPinsVisibleInViewport(map)
          startTransition(() => setEmptyViewportHint(points.length > 0 && !visible))
        }, 350)
      }

      map.on('moveend', update)
      map.on('zoomend', update)
      queueMicrotask(update)
      return () => {
        map.off('moveend', update)
        map.off('zoomend', update)
        clearTimeout(timeoutId)
      }
    }, [mapReady, points, shelterPinSpritesReady])

    const handleMapClick = useCallback(
      (e: MapMouseEvent) => {
        const map = e.target
        if (placementOrRelocateActive && onDraftPosition) {
          const lngLat = e.lngLat
          onDraftPosition({
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          })
          return
        }

        /**
         * Query shelter layers first — country fill can sit above GeoJSON in hit-tests at some zooms,
         * which was swallowing pin clicks when all layers were queried together.
         */
        const shelterLayers = shelterLayersPresentOnMap(map)
        const shelterHits =
          shelterLayers.length > 0
            ? map.queryRenderedFeatures(e.point, { layers: shelterLayers })
            : []
        const top = shelterHits[0]

        if (top) {
          const lid = top.layer?.id

          if (lid === LAYER_CLUSTERS || lid === LAYER_CLUSTER_COUNT) {
            const props = top.properties
            const clusterIdRaw = props?.cluster_id
            const geometry = top.geometry
            if (
              geometry?.type === 'Point' &&
              clusterIdRaw !== undefined &&
              clusterIdRaw !== null
            ) {
              const coords = geometry.coordinates as [number, number]
              const src = map.getSource(SHELTER_CLUSTER_SOURCE)
              if (src && src.type === 'geojson') {
                const g = src as GeoJSONSource
                const clusterId = Number(clusterIdRaw)
                g.getClusterExpansionZoom(clusterId, (err, zoom) => {
                  if (err || zoom == null) return
                  map.easeTo({
                    center: coords,
                    zoom,
                    duration: 500,
                    essential: true,
                  })
                })
              }
            }
            return
          }

          if (lid === LAYER_UNCLUSTERED) {
            const rawId = top.properties?.id
            const id =
              typeof rawId === 'string' ? rawId : rawId != null ? String(rawId) : null
            if (id) {
              const shelter = shelterById.get(id)
              if (shelter) onSelectShelter(shelter)
            }
            return
          }
        }

        if (showCountryLayers) {
          const countryHits = map.queryRenderedFeatures(e.point, {
            layers: [LAYER_COUNTRY_FILL],
          })
          const cf = countryHits[0]
          if (cf?.layer?.id === LAYER_COUNTRY_FILL) {
            const geom = cf.geometry
            if (geom?.type === 'Polygon' || geom?.type === 'MultiPolygon') {
              const box = bbox({
                type: 'Feature',
                geometry: geom,
                properties: {},
              } as Feature<Polygon | MultiPolygon>)
              map.fitBounds(
                [
                  [box[0], box[1]],
                  [box[2], box[3]],
                ],
                {
                  padding: FIT_BOUNDS_PADDING,
                  maxZoom: 9,
                  duration: 550,
                  essential: true,
                },
              )
            }
            return
          }
        }

        onClearSelection?.()
      },
      [
        placementOrRelocateActive,
        onDraftPosition,
        onClearSelection,
        onSelectShelter,
        shelterById,
        showCountryLayers,
      ],
    )

    useImperativeHandle(ref, () => ({
      flyToShelter: (s: Shelter) => {
        const map = mapRef.current?.getMap()
        if (!map || !Number.isFinite(s.latitude) || !Number.isFinite(s.longitude)) {
          return
        }
        map.flyTo({
          center: [s.longitude, s.latitude],
          zoom: Math.max(map.getZoom(), 10),
          essential: true,
        })
      },
      getMapCenter: () => {
        const map = mapRef.current?.getMap()
        const c = map?.getCenter()
        if (!c) return defaultCenter()
        return { latitude: c.lat, longitude: c.lng }
      },
      fitAllShelters: handleFitAllClick,
    }), [handleFitAllClick])

    /**
     * Country wash — same paint for every ISO in `countryFillFilter`.
     * Opacity must be high enough that underlying dark-v11 land tones (they differ by region)
     * do not make e.g. NL vs HR read as different “highlight colors”.
     */
    const countryFillPaint = useMemo(
      () =>
        ({
          'fill-color': isDark ? '#94a3b8' : '#64748b',
          'fill-opacity': isDark ? 0.22 : 0.09,
        }) as const,
      [isDark],
    )

    /** SVG teardrops registered via `ensureShelterPinImages` — same look as pre–country-highlight map. */
    const unclusteredSymbolLayout = useMemo(
      () =>
        ({
          'icon-image': [
            'case',
            ['==', ['get', 'id'], selectedId ?? '__none__'],
            SHELTER_PIN_IMAGE_IDS.selected,
            ['==', ['get', 'id'], animalContextShelterId ?? '__none__'],
            SHELTER_PIN_IMAGE_IDS.animal,
            SHELTER_PIN_IMAGE_IDS.default,
          ],
          'icon-size': 0.75,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
          'icon-ignore-placement': true,
        }) as never,
      [selectedId, animalContextShelterId],
    )

    if (!token) {
      if (import.meta.env.DEV) {
        return (
          <div className="bg-muted/50 flex min-h-[min(55vh,520px)] w-full items-center justify-center p-4">
            <p className="text-muted-foreground max-w-md text-start text-sm leading-relaxed">
              Add <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">VITE_MAPBOX_ACCESS_TOKEN</code>{' '}
              to <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">.env.local</code> (see{' '}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">.env.example</code>), then restart{' '}
              <code className="bg-muted rounded px-1 py-0.5 font-mono text-xs">npm run dev</code>.
            </p>
          </div>
        )
      }
      return (
        <div className="bg-muted/50 flex min-h-[min(55vh,520px)] w-full items-center justify-center p-4">
          <p className="text-muted-foreground max-w-md text-start text-sm leading-relaxed">
            The map is not available right now. You can still browse shelters in the list beside the map.
          </p>
        </div>
      )
    }

    return (
      <div
        ref={containerRef}
        className={cn(
          'relative h-full min-h-0 w-full flex-1',
          placementOrRelocateActive && '[&_.mapboxgl-canvas-container]:cursor-crosshair',
        )}
      >
        <div className="absolute inset-0">
          <MapGL
            ref={mapRef}
            mapboxAccessToken={token}
            initialViewState={NL_VIEW}
            style={{ width: '100%', height: '100%' }}
            mapStyle={isDark ? 'mapbox://styles/mapbox/dark-v11' : 'mapbox://styles/mapbox/light-v11'}
            reuseMaps
            interactiveLayerIds={interactiveLayerIds}
            onLoad={(e) => {
              const map = e.target
              const syncPins = () => {
                void runShelterPinImages(map)
              }
              map.on('style.load', syncPins)
              map.on('styleimagemissing', (ev) => {
                const id = ev.id
                if (
                  id === SHELTER_PIN_IMAGE_IDS.default ||
                  id === SHELTER_PIN_IMAGE_IDS.selected ||
                  id === SHELTER_PIN_IMAGE_IDS.animal
                ) {
                  void runShelterPinImages(map)
                }
              })
              void (async () => {
                await runShelterPinImages(map)
                setMapReady(true)
                resizeMap()
                requestAnimationFrame(() => resizeMap())
              })()
            }}
            onClick={handleMapClick}
            cursor={placementOrRelocateActive ? 'crosshair' : undefined}
          >
            {showCountryLayers ? (
              <Source id={COUNTRY_VECTOR_SOURCE} type="vector" url={MAPBOX_COUNTRIES_TILESET}>
                <Layer
                  id={LAYER_COUNTRY_FILL}
                  type="fill"
                  source-layer="country_boundaries"
                  filter={countryFillFilter}
                  paint={countryFillPaint}
                />
              </Source>
            ) : null}

            <Source
              id={SHELTER_CLUSTER_SOURCE}
              type="geojson"
              data={shelterFeatureCollection}
              cluster
              clusterMaxZoom={9}
              clusterRadius={36}
              promoteId="id"
            >
              <Layer
                id={LAYER_CLUSTERS}
                type="circle"
                filter={['has', 'point_count']}
                paint={{
                  'circle-color': '#78716c',
                  'circle-radius': [
                    'step',
                    ['get', 'point_count'],
                    22,
                    10,
                    26,
                    50,
                    32,
                  ],
                  'circle-stroke-width': 2,
                  'circle-stroke-color': '#fafaf9',
                }}
              />
              <Layer
                id={LAYER_CLUSTER_COUNT}
                type="symbol"
                filter={['has', 'point_count']}
                layout={{
                  'text-field': ['get', 'point_count_abbreviated'],
                  'text-size': 12,
                  'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
                }}
                paint={{
                  'text-color': '#ffffff',
                }}
              />
              {shelterPinSpritesReady ? (
                <Layer
                  id={LAYER_UNCLUSTERED}
                  type="symbol"
                  filter={['!', ['has', 'point_count']]}
                  layout={unclusteredSymbolLayout}
                />
              ) : null}
            </Source>

            {draftLocation &&
            Number.isFinite(draftLocation.latitude) &&
            Number.isFinite(draftLocation.longitude) ? (
              <Marker
                longitude={draftLocation.longitude}
                latitude={draftLocation.latitude}
                anchor="bottom"
              >
                <span
                  className={cn(
                    pinBase,
                    'pointer-events-none animate-pulse bg-amber-500 shadow-[0_0_0_3px_rgba(245,158,11,0.45)]',
                  )}
                  aria-label="Draft pin location"
                  title="Draft pin — use Enter details to save"
                />
              </Marker>
            ) : null}

            <NavigationControl position="top-right" showCompass={false} />
          </MapGL>
        </div>

        {points.length > 0 ? (
          <div className="pointer-events-auto absolute bottom-10 right-2 z-10">
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shadow-md"
              onClick={handleFitAllClick}
              aria-label="Fit map to all shelters"
              title="Show all shelters"
            >
              <Maximize2 className="mr-1 size-4" aria-hidden />
              Fit all
            </Button>
          </div>
        ) : null}

        {sortedIsoChips.length > 0 ? (
          <div className="pointer-events-auto absolute bottom-2 left-1/2 z-10 flex max-w-[min(100%,28rem)] -translate-x-1/2 flex-wrap justify-center gap-1 px-1">
            {sortedIsoChips.map((iso) => (
              <Button
                key={iso}
                type="button"
                size="sm"
                variant="outline"
                className="bg-background/90 text-xs shadow-sm backdrop-blur-sm"
                onClick={() => {
                  const map = mapRef.current?.getMap()
                  if (!map) return
                  const inCountry = points.filter(
                    (s) => isoByShelterId.get(s.id) === iso,
                  )
                  const bb = boundsFromShelters(inCountry)
                  if (!bb) return
                  map.fitBounds(bb, {
                    padding: FIT_BOUNDS_PADDING,
                    maxZoom: 10,
                    duration: 550,
                    essential: true,
                  })
                }}
              >
                {regionNames?.of(iso) ?? iso}
              </Button>
            ))}
          </div>
        ) : null}

        {emptyViewportHint && onSuggestShelter && points.length > 0 ? (
          <div className="pointer-events-none absolute top-12 left-2 right-2 z-10 flex justify-center px-2">
            <div className="bg-background/95 text-foreground pointer-events-auto flex max-w-md flex-col gap-2 rounded-md border px-3 py-2 text-center text-xs shadow-md backdrop-blur-sm sm:flex-row sm:items-center sm:text-start">
              <span className="text-muted-foreground">
                No shelters in this map area — zoom out, use country chips, or suggest one we&apos;re missing.
              </span>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="shrink-0 self-center sm:self-auto"
                onClick={handleFitAllClick}
              >
                Show all
              </Button>
              <Button type="button" size="sm" variant="default" className="shrink-0 self-center sm:self-auto" onClick={onSuggestShelter}>
                Suggest a shelter
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    )
  },
)
