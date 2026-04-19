import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { fetchShelters } from '@/api/shelters'
import { AddShelterDialog } from '@/components/AddShelterDialog'
import { EditShelterDialog } from '@/components/EditShelterDialog'
import { ShelterDetailDialog } from '@/components/ShelterDetailDialog'
import { ShelterList } from '@/components/ShelterList'
import { ShelterMap } from '@/components/ShelterMap'
import { ShareFeedbackDialog } from '@/components/ShareFeedbackDialog'
import { DiscoveryGrid } from '@/components/layout/DiscoveryGrid'
import { DiscoveryHeader } from '@/components/layout/DiscoveryHeader'
import { MapPlacementToolbar } from '@/components/layout/MapPlacementToolbar'
import { useShelterDiscoveryState } from '@/hooks/useShelterDiscoveryState'
import { useShelterMutations } from '@/hooks/useShelterMutations'
import { SPECIES_VALUES, type ShelterSpecies } from '@/domain/species'
import { toQueryError } from '@/lib/queryError'

function App() {
  const mutations = useShelterMutations()
  const [speciesFilter, setSpeciesFilter] = useState<ShelterSpecies | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const { data, error, isPending } = useQuery({
    queryKey: ['shelters'],
    queryFn: fetchShelters,
  })

  const queryError = useMemo(() => toQueryError(error), [error])

  const speciesCounts = useMemo(() => {
    const counts = Object.fromEntries(
      SPECIES_VALUES.map((sp) => [sp, 0]),
    ) as Record<ShelterSpecies, number>
    for (const s of data ?? []) {
      for (const sp of s.species) {
        counts[sp] += 1
      }
    }
    return counts
  }, [data])

  const speciesFilters = useMemo(
    () =>
      SPECIES_VALUES.map((species) => ({
        species,
        count: speciesCounts[species],
      })),
    [speciesCounts],
  )

  const filteredShelters = useMemo(() => {
    if (!data) return undefined
    if (!speciesFilter) return data
    return data.filter((s) => s.species.includes(speciesFilter))
  }, [data, speciesFilter])

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

  useEffect(() => {
    if (!selectedShelter || !speciesFilter) return
    if (!selectedShelter.species.includes(speciesFilter)) {
      clearSelection()
    }
  }, [speciesFilter, selectedShelter, clearSelection])

  const handleCloseDetail = () => {
    setEditOpen(false)
    clearSelection()
  }

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col overflow-hidden">
      <DiscoveryHeader onShareFeedback={() => setFeedbackOpen(true)} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4">
        <DiscoveryGrid>
          <section
            className="border-border flex min-h-0 flex-col overflow-hidden rounded-lg border"
            aria-label="Map of shelters"
          >
            <MapPlacementToolbar
              placementMode={placementMode}
              draftLocationKnown={Boolean(draftLocation)}
              addDialogOpen={addDialogOpen}
              cmsBusy={mutations.cmsBusy}
              cancelPlacementDisabled={cancelPlacementDisabled}
              onStartAddPin={handleStartAddPin}
              onEnterDetails={handleEnterDetails}
              onCancelPlacement={handleCancelPlacement}
            />
            <div className="flex h-full min-h-0 flex-1 flex-col">
              <ShelterMap
                ref={mapRef}
                shelters={filteredShelters ?? []}
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
            className="border-border flex min-h-0 flex-col overflow-hidden rounded-lg border"
            aria-label="Directory"
          >
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
              {mutations.cmsError ? (
                <p className="text-destructive mb-3 text-sm" role="alert">
                  {mutations.cmsError}
                </p>
              ) : null}
              <ShelterList
                shelters={filteredShelters}
                error={queryError}
                isPending={isPending}
                totalShelterCount={data?.length}
                selectedId={selectedShelter?.id ?? null}
                onSelectShelter={handleListSelect}
                speciesFilter={speciesFilter}
                onSpeciesFilter={setSpeciesFilter}
                speciesFilters={speciesFilters}
              />
            </div>
          </section>
        </DiscoveryGrid>
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
        onClose={handleCloseDetail}
        onRemove={handleRemovePin}
        onEdit={() => setEditOpen(true)}
        removeDisabled={mutations.cmsBusy}
        editDisabled={mutations.cmsBusy}
      />
      <EditShelterDialog
        shelter={selectedShelter}
        open={editOpen && Boolean(selectedShelter)}
        onClose={() => setEditOpen(false)}
        onSubmit={(id, body) => mutations.updateMutation.mutateAsync({ id, body })}
        isSubmitting={mutations.updateMutation.isPending}
      />
      <ShareFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  )
}

export default App
