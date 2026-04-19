import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  createShelter,
  deleteShelter,
  fetchShelters,
  type Shelter,
  type ShelterCreatePayload,
} from './api/shelters'
import { AddShelterDialog } from './components/AddShelterDialog'
import { ShelterDetailDialog } from './components/ShelterDetailDialog'
import { ShelterList } from './components/ShelterList'
import {
  ShelterMap,
  type MapCenter,
  type ShelterMapHandle,
} from './components/ShelterMap'
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

  const [placementMode, setPlacementMode] = useState(false)
  const [draftLocation, setDraftLocation] = useState<MapCenter | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  const { data, error, isPending } = useQuery({
    queryKey: ['shelters'],
    queryFn: fetchShelters,
  })

  const queryError = useMemo(() => toQueryError(error), [error])

  const createMutation = useMutation({
    mutationFn: createShelter,
    onSuccess: async (created) => {
      setCmsError(null)
      setDraftLocation(null)
      setPlacementMode(false)
      setAddDialogOpen(false)
      setSelectedId(created.id)
      mapRef.current?.flyToShelter(created)
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

  const handleCancelPlacement = useCallback(() => {
    setPlacementMode(false)
    setDraftLocation(null)
    setAddDialogOpen(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (addDialogOpen) return
      if (!placementMode && !draftLocation) return
      handleCancelPlacement()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [addDialogOpen, placementMode, draftLocation, handleCancelPlacement])

  const handleMapSelect = useCallback((s: Shelter) => {
    setDraftLocation(null)
    setPlacementMode(false)
    setSelectedId(s.id)
  }, [])

  const handleListSelect = useCallback((s: Shelter) => {
    setDraftLocation(null)
    setPlacementMode(false)
    setSelectedId(s.id)
    mapRef.current?.flyToShelter(s)
  }, [])

  const handleStartAddPin = useCallback(() => {
    setCmsError(null)
    setSelectedId(null)
    setAddDialogOpen(false)
    setDraftLocation(null)
    setPlacementMode(true)
  }, [])

  const handleDraftPosition = useCallback((loc: MapCenter) => {
    setDraftLocation(loc)
    setPlacementMode(false)
    setSelectedId(null)
  }, [])

  const handleEnterDetails = useCallback(() => {
    if (!draftLocation) return
    setAddDialogOpen(true)
  }, [draftLocation])

  const handleCloseAddDialog = useCallback(() => {
    setAddDialogOpen(false)
  }, [])

  const handleCreateShelter = useCallback(
    async (payload: ShelterCreatePayload) => {
      return createMutation.mutateAsync(payload)
    },
    [createMutation],
  )

  const handleRemovePin = useCallback(() => {
    if (!selectedId) return
    if (!window.confirm('Remove this shelter from the database?')) return
    setCmsError(null)
    deleteMutation.mutate(selectedId)
  }, [deleteMutation, selectedId])

  const cmsBusy = createMutation.isPending || deleteMutation.isPending

  const placementOrRelocateActive =
    placementMode || (!!draftLocation && !addDialogOpen)

  const cancelPlacementDisabled =
    cmsBusy || (!placementMode && !draftLocation)

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
                className={
                  placementMode
                    ? 'map-cms-btn map-cms-btn--active'
                    : 'map-cms-btn'
                }
                onClick={handleStartAddPin}
                disabled={cmsBusy}
              >
                Add pin
              </button>
              <button
                type="button"
                className="map-cms-btn map-cms-btn--primary"
                onClick={handleEnterDetails}
                disabled={cmsBusy || !draftLocation}
              >
                Enter details
              </button>
              <button
                type="button"
                className="map-cms-btn"
                onClick={handleCancelPlacement}
                disabled={cancelPlacementDisabled}
              >
                Cancel
              </button>
              {placementMode ? (
                <span className="map-cms-hint">Click the map to place a pin.</span>
              ) : draftLocation && !addDialogOpen ? (
                <span className="map-cms-hint">
                  Draft pin set — Enter details or click the map to move it.
                </span>
              ) : null}
            </div>
            <div className="map-cms-map-slot">
              <ShelterMap
                ref={mapRef}
                shelters={data ?? []}
                selectedId={selectedId}
                onSelectShelter={handleMapSelect}
                onClearSelection={clearSelection}
                placementOrRelocateActive={placementOrRelocateActive}
                draftLocation={draftLocation}
                onDraftPosition={handleDraftPosition}
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
      <AddShelterDialog
        open={addDialogOpen}
        draftLocation={draftLocation}
        onClose={handleCloseAddDialog}
        onSubmit={handleCreateShelter}
        isSubmitting={createMutation.isPending}
      />
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
