import 'mapbox-gl/dist/mapbox-gl.css'
import { cn } from '@/lib/utils'
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import Map, {
  Marker,
  NavigationControl,
  type MapMouseEvent,
  type MapRef,
} from 'react-map-gl/mapbox'
import type { Shelter } from '@/api/shelters'

const NL_VIEW = {
  longitude: 5.2913,
  latitude: 52.1326,
  zoom: 6.5,
} as const

export type MapCenter = { latitude: number; longitude: number }

export type ShelterMapHandle = {
  flyToShelter: (s: Shelter) => void
  getMapCenter: () => MapCenter
}

type Props = {
  shelters: Shelter[]
  selectedId: string | null
  /** When set (e.g. animal detail open), emphasize this shelter pin without map selection state. */
  animalContextShelterId?: string | null
  onSelectShelter: (s: Shelter) => void
  onClearSelection?: () => void
  placementOrRelocateActive?: boolean
  draftLocation?: MapCenter | null
  onDraftPosition?: (c: MapCenter) => void
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
    },
    ref,
  ) {
    const mapRef = useRef<MapRef>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    const points = useMemo(() => validShelters(shelters), [shelters])

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
    }))

    const handleMapClick = useCallback(
      (e: MapMouseEvent) => {
        if (placementOrRelocateActive && onDraftPosition) {
          const lngLat = e.lngLat
          if (!lngLat) return
          onDraftPosition({
            latitude: lngLat.lat,
            longitude: lngLat.lng,
          })
          return
        }
        onClearSelection?.()
      },
      [onClearSelection, onDraftPosition, placementOrRelocateActive],
    )

    if (!token) {
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
      <div
        ref={containerRef}
        className={cn(
          'relative h-full min-h-0 w-full flex-1',
          placementOrRelocateActive && '[&_.mapboxgl-canvas-container]:cursor-crosshair',
        )}
      >
        {/* Absolute fill: Mapbox canvas must match the flex-allocated box; call resize() on load + container resize. */}
        <div className="absolute inset-0">
          <Map
            ref={mapRef}
            mapboxAccessToken={token}
            initialViewState={NL_VIEW}
            style={{ width: '100%', height: '100%' }}
            mapStyle="mapbox://styles/mapbox/light-v11"
            reuseMaps
            onLoad={() => {
              resizeMap()
              requestAnimationFrame(() => resizeMap())
            }}
            onClick={handleMapClick}
            cursor={placementOrRelocateActive ? 'crosshair' : undefined}
          >
          <NavigationControl position="top-right" showCompass={false} />
          {points.map((s) => (
            <Marker
              key={s.id}
              longitude={s.longitude}
              latitude={s.latitude}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation()
                onSelectShelter(s)
              }}
            >
              <button
                type="button"
                className={cn(
                  pinBase,
                  'bg-primary',
                  s.id === selectedId &&
                    'scale-110 bg-blue-600 shadow-lg dark:bg-blue-500',
                  s.id !== selectedId &&
                    animalContextShelterId &&
                    s.id === animalContextShelterId &&
                    'scale-110 bg-emerald-600 shadow-lg dark:bg-emerald-500',
                )}
                aria-label={
                  s.id !== selectedId &&
                  animalContextShelterId &&
                  s.id === animalContextShelterId
                    ? `${s.name} — shelter for selected animal`
                    : s.name
                }
                title={
                  s.id !== selectedId &&
                  animalContextShelterId &&
                  s.id === animalContextShelterId
                    ? `${s.name} (selected animal's shelter)`
                    : s.name
                }
              />
            </Marker>
          ))}
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
        </Map>
        </div>
      </div>
    )
  },
)
