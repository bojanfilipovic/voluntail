import 'mapbox-gl/dist/mapbox-gl.css'
import {
  forwardRef,
  useCallback,
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
import type { Shelter } from '../api/shelters'

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
  onSelectShelter: (s: Shelter) => void
  onClearSelection?: () => void
  /** First-time placement or moving the draft pin before the add modal. */
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

export const ShelterMap = forwardRef<ShelterMapHandle, Props>(
  function ShelterMap(
    {
      shelters,
      selectedId,
      onSelectShelter,
      onClearSelection,
      placementOrRelocateActive = false,
      draftLocation = null,
      onDraftPosition,
    },
    ref,
  ) {
    const mapRef = useRef<MapRef>(null)
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN

    const points = useMemo(() => validShelters(shelters), [shelters])

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
      [
        onClearSelection,
        onDraftPosition,
        placementOrRelocateActive,
      ],
    )

    if (!token) {
      return (
        <div className="map-shell map-shell--missing-token">
          <p className="map-missing-token">
            Add <code>VITE_MAPBOX_ACCESS_TOKEN</code> to{' '}
            <code>.env.local</code> (see <code>.env.example</code>), then restart{' '}
            <code>npm run dev</code>.
          </p>
        </div>
      )
    }

    const shellClass =
      'map-shell' +
      (placementOrRelocateActive ? ' map-shell--placing' : '')

    return (
      <div className={shellClass}>
        <Map
          ref={mapRef}
          mapboxAccessToken={token}
          initialViewState={NL_VIEW}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/light-v11"
          reuseMaps
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
                className={
                  s.id === selectedId
                    ? 'map-pin map-pin--selected'
                    : 'map-pin'
                }
                aria-label={s.name}
                title={s.name}
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
                className="map-pin map-pin--draft"
                aria-label="Draft pin location"
                title="Draft pin — use Enter details to save"
              />
            </Marker>
          ) : null}
        </Map>
      </div>
    )
  },
)
