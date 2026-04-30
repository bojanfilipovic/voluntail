import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { fetchAnimals } from '@/api/animals'
import type { Animal } from '@/api/animals'
import { fetchShelters, type Shelter } from '@/api/shelters'
import { AddAnimalDialog } from '@/components/AddAnimalDialog'
import { AddShelterDialog } from '@/components/AddShelterDialog'
import { AnimalDetailDialog } from '@/components/AnimalDetailDialog'
import { EditAnimalDialog } from '@/components/EditAnimalDialog'
import { EditShelterDialog } from '@/components/EditShelterDialog'
import { ShelterDetailDialog } from '@/components/ShelterDetailDialog'
import { ShareFeedbackDialog } from '@/components/ShareFeedbackDialog'
import { DiscoveryHeader } from '@/components/layout/DiscoveryHeader'
import { useAnimalMutations } from '@/hooks/useAnimalMutations'
import { useShelterDiscoveryState } from '@/hooks/useShelterDiscoveryState'
import { useShelterMutations } from '@/hooks/useShelterMutations'
import { SPECIES_VALUES, type ShelterSpecies } from '@/domain/species'
import { DirectoryLayout } from '@/directory/DirectoryLayout'
import { getInitialAppView, replaceAppViewInUrl, type AppView } from '@/directory/urlState'
import { toQueryError } from '@/lib/queryError'
import { animalQueryKeys, shelterQueryKeys } from '@/lib/queryKeys'

const ExploreViewLazy = lazy(async () => {
  const mod = await import('@/explore/ExploreView')
  return { default: mod.ExploreView }
})

type DirectoryTab = 'shelters' | 'animals'

function App() {
  const mutations = useShelterMutations()
  const animalMutations = useAnimalMutations()

  const [appView, setAppView] = useState<AppView>(getInitialAppView)
  const [directoryTab, setDirectoryTab] = useState<DirectoryTab>('shelters')
  const [speciesFilter, setSpeciesFilter] = useState<ShelterSpecies | null>(null)

  const [animalCityFilter, setAnimalCityFilter] = useState<string | null>(null)
  const [animalShelterFilter, setAnimalShelterFilter] = useState<string | null>(null)
  const [animalSpeciesFilter, setAnimalSpeciesFilter] = useState<ShelterSpecies | null>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackContext, setFeedbackContext] = useState<
    { shelterId?: string; animalId?: string; label?: string } | undefined
  >(undefined)

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

  const handleShelterSpeciesFilter = useCallback(
    (nextFilter: ShelterSpecies | null) => {
      if (
        nextFilter &&
        selectedShelter &&
        !selectedShelter.species.includes(nextFilter)
      ) {
        clearSelectionAndMapHighlight()
      }
      setSpeciesFilter(nextFilter)
    },
    [selectedShelter, clearSelectionAndMapHighlight],
  )

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

  const openHeaderFeedback = useCallback(() => {
    setFeedbackContext(undefined)
    setFeedbackOpen(true)
  }, [])

  const openShelterFeedback = useCallback(() => {
    if (!selectedShelter) return
    setFeedbackContext({ shelterId: selectedShelter.id, label: selectedShelter.name })
    setFeedbackOpen(true)
  }, [selectedShelter])

  const openAnimalFeedback = useCallback(() => {
    if (!selectedAnimal) return
    setFeedbackContext({
      shelterId: selectedAnimal.shelterId,
      animalId: selectedAnimal.id,
      label: selectedAnimal.name,
    })
    setFeedbackOpen(true)
  }, [selectedAnimal])

  const navigateView = useCallback((next: AppView) => {
    setAppView(next)
    replaceAppViewInUrl(next)
  }, [])

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col overflow-hidden">
      <DiscoveryHeader
        onShareFeedback={openHeaderFeedback}
        appView={appView}
        onGoExplore={() => navigateView('explore')}
        onGoDirectory={() => navigateView('directory')}
      />
      <main
        className={
          appView === 'directory'
            ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 py-3 lg:px-6 lg:py-4'
            : 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'
        }
      >
        {appView === 'directory' ? (
          <DirectoryLayout
            shelterMapRef={mapRef}
            placementMode={placementMode}
            draftLocation={draftLocation}
            addDialogOpen={addDialogOpen}
            cmsBusy={mutations.cmsBusy}
            cancelPlacementDisabled={cancelPlacementDisabled}
            onStartAddPin={handleStartAddPin}
            onEnterDetails={handleEnterDetails}
            onCancelPlacement={handleCancelPlacement}
            mapShelters={mapShelters}
            selectedShelter={selectedShelter}
            mapShelterHighlightId={mapShelterHighlightId}
            onMapSelectShelter={handleMapSelectClearingHighlight}
            onClearMapSelection={clearSelectionAndMapHighlight}
            placementOrRelocateActive={placementOrRelocateActive}
            onDraftPosition={handleDraftPosition}
            directoryTab={directoryTab}
            onDirectoryTab={setDirectoryTab}
            cmsConfigured={cmsConfigured}
            canAddAnimal={Boolean(data?.length)}
            onAddAnimalClick={() => setAddAnimalOpen(true)}
            addAnimalCmsBusy={animalMutations.cmsBusy}
            filteredShelters={filteredShelters}
            directoryError={directoryAlert}
            sheltersLoading={isPending}
            shelterTotal={data?.length}
            onSelectShelterFromList={handleListSelectClearingHighlight}
            speciesFilter={speciesFilter}
            onShelterSpeciesFilter={handleShelterSpeciesFilter}
            speciesFilters={speciesFilters}
            animals={animals}
            allShelters={data}
            animalsLoading={animalsPending}
            onSelectAnimal={handleSelectAnimal}
            selectedAnimalId={selectedAnimal?.id ?? null}
            animalCityFilter={animalCityFilter}
            onAnimalCityFilter={setAnimalCityFilter}
            animalShelterFilter={animalShelterFilter}
            onAnimalShelterFilter={setAnimalShelterFilter}
            animalSpeciesFilter={animalSpeciesFilter}
            onAnimalSpeciesFilter={setAnimalSpeciesFilter}
            shelterCityOptions={shelterCityOptions}
            animalSpeciesCounts={animalSpeciesCounts}
          />
        ) : (
          <Suspense
            fallback={
              <div className="text-muted-foreground flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 py-8 text-sm">
                <span className="inline-block size-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading Explore…</span>
              </div>
            }
          >
            <ExploreViewLazy
              onBack={() => navigateView('directory')}
              onOpenAnimal={handleSelectAnimal}
            />
          </Suspense>
        )}
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
        onShareFeedback={openShelterFeedback}
      />
      <EditShelterDialog
        shelter={selectedShelter}
        open={editOpen && Boolean(selectedShelter)}
        onClose={() => setEditOpen(false)}
        onSubmit={(id, body) => mutations.updateMutation.mutateAsync({ id, body })}
        isSubmitting={mutations.updateMutation.isPending}
      />
      <AnimalDetailDialog
        key={animalForDetailModal?.id ?? 'none'}
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
        onShareFeedback={openAnimalFeedback}
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
      <ShareFeedbackDialog
        open={feedbackOpen}
        onOpenChange={(o) => {
          if (!o) setFeedbackContext(undefined)
          setFeedbackOpen(o)
        }}
        context={feedbackContext}
      />
    </div>
  )
}

export default App
