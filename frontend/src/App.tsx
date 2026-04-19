import { useQuery } from '@tanstack/react-query'
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { fetchAnimals } from '@/api/animals'
import type { Animal } from '@/api/animals'
import { fetchShelters, type Shelter } from '@/api/shelters'
import { AddAnimalDialog } from '@/components/AddAnimalDialog'
import { AddShelterDialog } from '@/components/AddShelterDialog'
import { AnimalDetailDialog } from '@/components/AnimalDetailDialog'
import { AnimalList } from '@/components/AnimalList'
import { EditAnimalDialog } from '@/components/EditAnimalDialog'
import { EditShelterDialog } from '@/components/EditShelterDialog'
import { ShelterDetailDialog } from '@/components/ShelterDetailDialog'
import { ShelterList } from '@/components/ShelterList'
import { ShareFeedbackDialog } from '@/components/ShareFeedbackDialog'
import { DiscoveryErrorBoundary } from '@/components/layout/DiscoveryErrorBoundary'
import { DiscoveryGrid } from '@/components/layout/DiscoveryGrid'
import { DiscoveryHeader } from '@/components/layout/DiscoveryHeader'
import { MapPlacementToolbar } from '@/components/layout/MapPlacementToolbar'
import { Button } from '@/components/ui/button'
import { useAnimalMutations } from '@/hooks/useAnimalMutations'
import { useShelterDiscoveryState } from '@/hooks/useShelterDiscoveryState'
import { useShelterMutations } from '@/hooks/useShelterMutations'
import { SPECIES_VALUES, type ShelterSpecies } from '@/domain/species'
import { toQueryError } from '@/lib/queryError'
import { animalQueryKeys, shelterQueryKeys } from '@/lib/queryKeys'

const ShelterMapLazy = lazy(async () => {
  const mod = await import('@/components/ShelterMap')
  return { default: mod.ShelterMap }
})

function MapLoadingFallback() {
  return (
    <div className="bg-muted/40 text-muted-foreground flex min-h-[220px] flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-sm">
      <span className="inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden />
      <span>Loading map…</span>
    </div>
  )
}

type DirectoryTab = 'shelters' | 'animals'

function App() {
  const mutations = useShelterMutations()
  const animalMutations = useAnimalMutations()

  const [directoryTab, setDirectoryTab] = useState<DirectoryTab>('shelters')
  const [speciesFilter, setSpeciesFilter] = useState<ShelterSpecies | null>(null)

  const [animalCityFilter, setAnimalCityFilter] = useState<string | null>(null)
  const [animalShelterFilter, setAnimalShelterFilter] = useState<string | null>(null)
  const [animalSpeciesFilter, setAnimalSpeciesFilter] = useState<ShelterSpecies | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)

  const [selectedAnimal, setSelectedAnimal] = useState<Animal | null>(null)
  const [animalDetailOpen, setAnimalDetailOpen] = useState(false)
  const [animalEditOpen, setAnimalEditOpen] = useState(false)
  const [addAnimalOpen, setAddAnimalOpen] = useState(false)
  /** Map emerald pin for “last viewed animal’s shelter”; persists after closing the animal modal. */
  const [mapShelterHighlightId, setMapShelterHighlightId] = useState<string | null>(
    null,
  )

  const animalListQuery = useMemo(
    () => ({
      city: animalCityFilter,
      shelterId: animalShelterFilter,
      species: animalSpeciesFilter,
    }),
    [animalCityFilter, animalShelterFilter, animalSpeciesFilter],
  )

  const { data, error, isPending } = useQuery({
    queryKey: shelterQueryKeys.all,
    queryFn: fetchShelters,
  })

  const {
    data: animals,
    error: animalsError,
    isPending: animalsPending,
  } = useQuery({
    queryKey: animalQueryKeys.list(animalListQuery),
    queryFn: () => fetchAnimals(animalListQuery),
    enabled: directoryTab === 'animals',
  })

  const queryError = useMemo(() => toQueryError(error), [error])
  const animalsQueryError = useMemo(() => toQueryError(animalsError), [animalsError])

  const directoryAlert = useMemo((): Error | null => {
    const q = directoryTab === 'shelters' ? queryError : animalsQueryError
    const cmsText =
      directoryTab === 'shelters' ? mutations.cmsError : animalMutations.cmsError
    if (q?.message && cmsText && q.message === cmsText) {
      return q
    }
    if (q) return q
    if (cmsText) return new Error(cmsText)
    return null
  }, [
    directoryTab,
    queryError,
    animalsQueryError,
    mutations.cmsError,
    animalMutations.cmsError,
  ])

  const shelterCityOptions = useMemo(() => {
    const set = new Set<string>()
    for (const s of data ?? []) {
      const c = s.city.trim()
      if (c) set.add(c)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [data])

  const filteredShelters = useMemo(() => {
    if (!data) return undefined
    let rows = data
    if (speciesFilter) rows = rows.filter((s) => s.species.includes(speciesFilter))
    return rows
  }, [data, speciesFilter])

  const mapShelters = useMemo(() => {
    if (directoryTab === 'animals') return data ?? []
    return filteredShelters ?? []
  }, [directoryTab, data, filteredShelters])

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

  const animalSpeciesCounts = useMemo(() => {
    const counts = Object.fromEntries(
      SPECIES_VALUES.map((sp) => [sp, 0]),
    ) as Record<ShelterSpecies, number>
    for (const a of animals ?? []) {
      counts[a.species] += 1
    }
    return counts
  }, [animals])

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

  const clearSelectionAndMapHighlight = useCallback(() => {
    clearSelection()
    setMapShelterHighlightId(null)
  }, [clearSelection])

  useEffect(() => {
    if (!selectedShelter || !speciesFilter) return
    if (!selectedShelter.species.includes(speciesFilter)) {
      clearSelectionAndMapHighlight()
    }
  }, [speciesFilter, selectedShelter, clearSelectionAndMapHighlight])

  const handleMapSelectClearingHighlight = useCallback(
    (s: Shelter) => {
      setMapShelterHighlightId(null)
      handleMapSelect(s)
    },
    [handleMapSelect],
  )

  const handleListSelectClearingHighlight = useCallback(
    (s: Shelter) => {
      setMapShelterHighlightId(null)
      handleListSelect(s)
    },
    [handleListSelect],
  )

  const cmsConfigured = Boolean(import.meta.env.VITE_CMS_API_KEY?.trim())

  /** Single source for animal detail modal: avoids open=true with animal=null (empty overlay). */
  const animalForDetailModal =
    animalDetailOpen && selectedAnimal ? selectedAnimal : null

  const selectedAnimalShelter = useMemo(() => {
    if (!animalForDetailModal || !data) return null
    return data.find((s) => s.id === animalForDetailModal.shelterId) ?? null
  }, [animalForDetailModal, data])

  const handleSelectAnimal = useCallback(
    (animal: Animal) => {
      clearSelection()
      setMapShelterHighlightId(animal.shelterId)
      const sh = data?.find((s) => s.id === animal.shelterId)
      if (sh) {
        mapRef.current?.flyToShelter(sh)
      }
      setSelectedAnimal(animal)
      setAnimalDetailOpen(true)
    },
    [data, clearSelection, mapRef],
  )

  const handleCloseAnimalDetail = useCallback(() => {
    setAnimalDetailOpen(false)
    setSelectedAnimal(null)
  }, [])

  const handleCloseDetail = () => {
    setEditOpen(false)
    handleCloseAnimalDetail()
    clearSelectionAndMapHighlight()
  }

  const handlePublishToggle = useCallback(async () => {
    if (!selectedAnimal) return
    await animalMutations.updateMutation.mutateAsync({
      id: selectedAnimal.id,
      body: { published: !selectedAnimal.published },
    })
    setSelectedAnimal((prev) =>
      prev && prev.id === selectedAnimal.id
        ? { ...prev, published: !prev.published }
        : prev,
    )
  }, [selectedAnimal, animalMutations.updateMutation])

  const handleDeleteAnimal = useCallback(async () => {
    if (!selectedAnimal) return
    if (!window.confirm('Remove this animal from the directory?')) return
    animalMutations.setCmsError(null)
    await animalMutations.deleteMutation.mutateAsync(selectedAnimal.id)
    handleCloseAnimalDetail()
  }, [selectedAnimal, animalMutations, handleCloseAnimalDetail])

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col overflow-hidden">
      <DiscoveryHeader onShareFeedback={() => setFeedbackOpen(true)} />
      <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-6 py-4">
        <DiscoveryErrorBoundary>
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
                <Suspense fallback={<MapLoadingFallback />}>
                  <ShelterMapLazy
                    ref={mapRef}
                    shelters={mapShelters}
                    selectedId={selectedShelter?.id ?? null}
                    animalContextShelterId={mapShelterHighlightId}
                    onSelectShelter={handleMapSelectClearingHighlight}
                    onClearSelection={clearSelectionAndMapHighlight}
                    placementOrRelocateActive={placementOrRelocateActive}
                    draftLocation={draftLocation}
                    onDraftPosition={handleDraftPosition}
                  />
                </Suspense>
              </div>
            </section>
            <section
              className="border-border flex min-h-0 flex-col overflow-hidden rounded-lg border"
              aria-label="Directory"
            >
              <div
                className="border-border bg-muted/30 flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
                role="tablist"
                aria-label="Directory view"
              >
                <Button
                  type="button"
                  size="sm"
                  variant={directoryTab === 'shelters' ? 'secondary' : 'outline'}
                  onClick={() => setDirectoryTab('shelters')}
                  aria-pressed={directoryTab === 'shelters'}
                >
                  Shelters
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={directoryTab === 'animals' ? 'secondary' : 'outline'}
                  onClick={() => setDirectoryTab('animals')}
                  aria-pressed={directoryTab === 'animals'}
                >
                  Animals
                </Button>
                {directoryTab === 'animals' && cmsConfigured ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="default"
                    disabled={animalMutations.cmsBusy || !data?.length}
                    onClick={() => setAddAnimalOpen(true)}
                  >
                    Add animal
                  </Button>
                ) : null}
              </div>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
                {directoryTab === 'shelters' ? (
                  <ShelterList
                    shelters={filteredShelters}
                    error={directoryAlert}
                    isPending={isPending}
                    totalShelterCount={data?.length}
                    selectedId={selectedShelter?.id ?? null}
                    onSelectShelter={handleListSelectClearingHighlight}
                    speciesFilter={speciesFilter}
                    onSpeciesFilter={setSpeciesFilter}
                    speciesFilters={speciesFilters}
                  />
                ) : (
                  <AnimalList
                    animals={animals}
                    shelters={data}
                    error={directoryAlert}
                    isPending={animalsPending}
                    selectedId={selectedAnimal?.id ?? null}
                    onSelectAnimal={handleSelectAnimal}
                    cityFilter={animalCityFilter}
                    onCityFilter={setAnimalCityFilter}
                    shelterFilter={animalShelterFilter}
                    onShelterFilter={setAnimalShelterFilter}
                    speciesFilter={animalSpeciesFilter}
                    onSpeciesFilter={setAnimalSpeciesFilter}
                    cityOptions={shelterCityOptions}
                    speciesCounts={animalSpeciesCounts}
                  />
                )}
              </div>
            </section>
          </DiscoveryGrid>
        </DiscoveryErrorBoundary>
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
      <AnimalDetailDialog
        animal={animalForDetailModal}
        shelter={selectedAnimalShelter}
        onClose={handleCloseAnimalDetail}
        onEdit={() => {
          setAnimalEditOpen(true)
        }}
        cmsConfigured={cmsConfigured}
        onPublishToggle={handlePublishToggle}
        onDelete={handleDeleteAnimal}
        publishBusy={animalMutations.updateMutation.isPending}
        deleteBusy={animalMutations.deleteMutation.isPending}
      />
      <EditAnimalDialog
        animal={selectedAnimal}
        shelters={data ?? []}
        open={animalEditOpen && Boolean(selectedAnimal)}
        onClose={() => setAnimalEditOpen(false)}
        onSubmit={async (id, body) => {
          const updated = await animalMutations.updateMutation.mutateAsync({ id, body })
          setSelectedAnimal(updated)
        }}
        isSubmitting={animalMutations.updateMutation.isPending}
      />
      <AddAnimalDialog
        open={addAnimalOpen}
        shelters={data ?? []}
        onClose={() => setAddAnimalOpen(false)}
        onSubmit={(payload) => animalMutations.createMutation.mutateAsync(payload)}
        isSubmitting={animalMutations.createMutation.isPending}
      />
      <ShareFeedbackDialog open={feedbackOpen} onOpenChange={setFeedbackOpen} />
    </div>
  )
}

export default App
