import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { fetchShelters } from '@/api/shelters'
import { AddShelterDialog } from '@/components/AddShelterDialog'
import { EditShelterDialog } from '@/components/EditShelterDialog'
import { ShelterDetailDialog } from '@/components/ShelterDetailDialog'
import { ShelterList } from '@/components/ShelterList'
import { ShelterMap } from '@/components/ShelterMap'
import { ShareFeedbackDialog } from '@/components/ShareFeedbackDialog'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { useShelterDiscoveryState } from '@/hooks/useShelterDiscoveryState'
import { useShelterMutations } from '@/hooks/useShelterMutations'
import type { ShelterSpecies } from '@/domain/species'
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

  const speciesOptions = useMemo(() => {
    const set = new Set<ShelterSpecies>()
    for (const s of data ?? []) {
      for (const sp of s.species) {
        set.add(sp)
      }
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [data])

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
      <header className="border-border border-b px-6 py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <div className="min-w-0 md:w-2/3">
            <h1 className="text-lg font-semibold tracking-tight">Voluntail</h1>
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
              Discover animal shelters in the Netherlands—explore the map or list, then open a
              shelter for volunteer signup and donation links. Info here is curated; always confirm
              details on the shelter&apos;s official site.
            </p>
          </div>
          <div className="flex shrink-0 md:mt-0 md:w-1/3 md:justify-end">
            <Button
              type="button"
              variant="default"
              className="w-full md:w-auto"
              onClick={() => setFeedbackOpen(true)}
            >
              <MessageSquare aria-hidden />
              Share feedback
            </Button>
          </div>
        </div>
      </header>
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4">
        {/*
          Viewport shell is fixed (see index.css). Grid must not grow with list intrinsic height:
          - lg: one row minmax(0,1fr) → map + list share viewport height; list scrolls inside.
          - stacked: capped map row + remainder to list so the map cannot push the page.
        */}
        <div
          className="
            grid min-h-0 flex-1 gap-4
            grid-cols-1
            grid-rows-[minmax(220px,min(40svh,420px))_minmax(0,1fr)]
            lg:grid-cols-2
            lg:grid-rows-[minmax(0,1fr)]
          "
        >
          <section
            className="border-border flex min-h-0 flex-col overflow-hidden rounded-lg border"
            aria-label="Map of shelters"
          >
            <div
              className="border-border bg-muted/40 flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
              role="toolbar"
              aria-label="Shelter CMS"
            >
              <Button
                type="button"
                size="sm"
                variant={placementMode ? 'secondary' : 'outline'}
                onClick={handleStartAddPin}
                disabled={mutations.cmsBusy}
              >
                Add pin
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleEnterDetails}
                disabled={mutations.cmsBusy || !draftLocation}
              >
                Enter details
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCancelPlacement}
                disabled={cancelPlacementDisabled}
              >
                Cancel
              </Button>
              {placementMode ? (
                <span className="text-muted-foreground min-w-[12rem] flex-1 text-xs">
                  Click the map to place a pin.
                </span>
              ) : draftLocation && !addDialogOpen ? (
                <span className="text-muted-foreground min-w-[12rem] flex-1 text-xs">
                  Draft pin set — Enter details or click the map to move it.
                </span>
              ) : null}
            </div>
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
                selectedId={selectedShelter?.id ?? null}
                onSelectShelter={handleListSelect}
                speciesFilter={speciesFilter}
                onSpeciesFilter={setSpeciesFilter}
                speciesOptions={speciesOptions}
              />
            </div>
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
