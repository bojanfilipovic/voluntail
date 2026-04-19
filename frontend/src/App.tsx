import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { fetchShelters } from './api/shelters'
import { AddShelterDialog } from './components/AddShelterDialog'
import { ShelterDetailDialog } from './components/ShelterDetailDialog'
import { ShelterList } from './components/ShelterList'
import { ShelterMap } from './components/ShelterMap'
import { useShelterDiscoveryState } from './hooks/useShelterDiscoveryState'
import { useShelterMutations } from './hooks/useShelterMutations'
import { toQueryError } from './lib/queryError'
import './App.css'

function App() {
  const mutations = useShelterMutations()
  const { data, error, isPending } = useQuery({
    queryKey: ['shelters'],
    queryFn: fetchShelters,
  })

  const queryError = useMemo(() => toQueryError(error), [error])

  const {
    mapRef,
    addDialogNonce,
    selectedShelter,
    placementMode,
    draftLocation,
    addDialogOpen,
    placementOrRelocateActive,
    cancelPlacementDisabled,
    clearSelection,
    handleCancelPlacement,
    handleMapSelect,
    handleListSelect,
    handleStartAddPin,
    handleDraftPosition,
    handleEnterDetails,
    handleCloseAddDialog,
    handleCreateShelter,
    handleRemovePin,
  } = useShelterDiscoveryState(data, mutations)

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
                disabled={mutations.cmsBusy}
              >
                Add pin
              </button>
              <button
                type="button"
                className="map-cms-btn map-cms-btn--primary"
                onClick={handleEnterDetails}
                disabled={mutations.cmsBusy || !draftLocation}
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
                selectedId={selectedShelter?.id ?? null}
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
            {mutations.cmsError ? (
              <p className="shelters-error map-cms-error" role="alert">
                {mutations.cmsError}
              </p>
            ) : null}
            <ShelterList
              shelters={data}
              error={queryError}
              isPending={isPending}
              selectedId={selectedShelter?.id ?? null}
              onSelectShelter={handleListSelect}
            />
          </section>
        </div>
      </main>
      <AddShelterDialog
        key={addDialogNonce}
        open={addDialogOpen}
        draftLocation={draftLocation}
        onClose={handleCloseAddDialog}
        onSubmit={handleCreateShelter}
        isSubmitting={mutations.createMutation.isPending}
      />
      <ShelterDetailDialog
        shelter={selectedShelter}
        onClose={clearSelection}
        onRemove={handleRemovePin}
        removeDisabled={mutations.cmsBusy}
      />
    </div>
  )
}

export default App
