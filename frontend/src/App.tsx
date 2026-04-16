import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import {
  createShelter,
  deleteShelter,
  fetchShelters,
  type Shelter,
} from './api/shelters'
import { ShelterDetailDialog } from './components/ShelterDetailDialog'
import { ShelterList } from './components/ShelterList'
import { ShelterMap, type ShelterMapHandle } from './components/ShelterMap'
import './App.css'

function toQueryError(error: unknown): Error | null {
  if (!error) return null
  if (error instanceof Error) return error
  return new Error(typeof error === 'string' ? error : 'Request failed')
}

function App() {
  const queryClient = useQueryClient()
  const mapRef = useRef<ShelterMapHandle>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cmsError, setCmsError] = useState<string | null>(null)

  const { data, error, isPending } = useQuery({
    queryKey: ['shelters'],
    queryFn: fetchShelters,
  })

  const queryError = useMemo(() => toQueryError(error), [error])

  const createMutation = useMutation({
    mutationFn: createShelter,
    onSuccess: async () => {
      setCmsError(null)
      await queryClient.invalidateQueries({ queryKey: ['shelters'] })
    },
    onError: (e) => {
      setCmsError(toQueryError(e)?.message ?? 'Create failed')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteShelter,
    onSuccess: async () => {
      setCmsError(null)
      setSelectedId(null)
      await queryClient.invalidateQueries({ queryKey: ['shelters'] })
    },
    onError: (e) => {
      setCmsError(toQueryError(e)?.message ?? 'Delete failed')
    },
  })

  const selectedShelter = useMemo(() => {
    if (!selectedId || !data) return null
    return data.find((s) => s.id === selectedId) ?? null
  }, [data, selectedId])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleMapSelect = useCallback((s: Shelter) => {
    setSelectedId(s.id)
  }, [])

  const handleListSelect = useCallback((s: Shelter) => {
    setSelectedId(s.id)
    mapRef.current?.flyToShelter(s)
  }, [])

  const handleAddPin = useCallback(() => {
    setCmsError(null)
    const c = mapRef.current?.getMapCenter() ?? {
      latitude: 52.1326,
      longitude: 5.2913,
    }
    createMutation.mutate({
      name: 'New shelter',
      description:
        'Placeholder from the map. Edit name, description, and links in Supabase (or a future in-app editor).',
      latitude: c.latitude,
      longitude: c.longitude,
      registryTag: 'DOA',
      species: [],
    })
  }, [createMutation])

  const handleRemovePin = useCallback(() => {
    if (!selectedId) return
    if (!window.confirm('Remove this shelter from the database?')) return
    setCmsError(null)
    deleteMutation.mutate(selectedId)
  }, [deleteMutation, selectedId])

  const cmsBusy = createMutation.isPending || deleteMutation.isPending

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Voluntail</h1>
        <p className="app-tagline">Discovery (dev shell)</p>
      </header>
      <main className="app-main">
        <div className="split">
          <section
            className="split-pane split-pane--map split-pane--map-column"
            aria-label="Map of shelters"
          >
            <div className="map-cms-toolbar" role="toolbar" aria-label="Shelter CMS">
              <button
                type="button"
                className="map-cms-btn"
                onClick={handleAddPin}
                disabled={cmsBusy}
              >
                Add pin
              </button>
              <button
                type="button"
                className="map-cms-btn map-cms-btn--danger"
                onClick={handleRemovePin}
                disabled={cmsBusy || !selectedId}
              >
                Remove pin
              </button>
            </div>
            <div className="map-cms-map-slot">
              <ShelterMap
                ref={mapRef}
                shelters={data ?? []}
                selectedId={selectedId}
                onSelectShelter={handleMapSelect}
                onClearSelection={clearSelection}
              />
            </div>
          </section>
          <section
            className="split-pane split-pane--directory"
            aria-label="Directory"
          >
            {cmsError ? (
              <p className="shelters-error map-cms-error" role="alert">
                {cmsError}
              </p>
            ) : null}
            <ShelterList
              shelters={data}
              error={queryError}
              isPending={isPending}
              selectedId={selectedId}
              onSelectShelter={handleListSelect}
            />
          </section>
        </div>
      </main>
      <ShelterDetailDialog
        shelter={selectedShelter}
        onClose={clearSelection}
        onRemove={handleRemovePin}
        removeDisabled={cmsBusy}
      />
    </div>
  )
}

export default App
