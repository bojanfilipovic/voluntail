import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
import { SuggestShelterDialog } from '@/components/SuggestShelterDialog'
import { DiscoveryHeader } from '@/components/layout/DiscoveryHeader'
import { useAnimalMutations } from '@/hooks/useAnimalMutations'
import { useShelterDiscoveryState } from '@/hooks/useShelterDiscoveryState'
import { useShelterMutations } from '@/hooks/useShelterMutations'
import { isOtherSpecies, type SpeciesFilterValue } from '@/domain/species'
import { buildSpeciesFilterRows, countSpecies, filterBySpecies } from '@/domain/speciesFilter'
import { DirectoryLayout } from '@/directory/DirectoryLayout'
import { getInitialAppView, getAnimalIdFromUrl, clearAnimalIdFromUrl, replaceAppViewInUrl, type AppView } from '@/directory/urlState'
import { EXPLORE_STORAGE_KEY } from '@/explore/types'
import { useTheme } from '@/hooks/useTheme'
import { toQueryError } from '@/lib/queryError'
import { animalQueryKeys, shelterQueryKeys } from '@/lib/queryKeys'

const ExploreViewLazy = lazy(async () => {
  const mod = await import('@/explore/ExploreView')
  return { default: mod.ExploreView }
})

type DirectoryTab = 'shelters' | 'animals'

function App() {
  const { theme, resolved, cycleTheme } = useTheme()
  const mutations = useShelterMutations()
  const animalMutations = useAnimalMutations()

  const [appView, setAppView] = useState<AppView>(getInitialAppView)
  const [exploreHasMatches, setExploreHasMatches] = useState(() => {
    try {
      const raw = localStorage.getItem(EXPLORE_STORAGE_KEY)
      if (!raw) return false
      const o = JSON.parse(raw) as { shortlistIds?: unknown }
      return Array.isArray(o.shortlistIds) && o.shortlistIds.length > 0
    } catch { return false }
  })
  const [directoryTab, setDirectoryTab] = useState<DirectoryTab>('shelters')
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilterValue | null>(null)

  const [initialAnimalId] = useState(getAnimalIdFromUrl)
  const deepLinkHandled = useRef(false)

  const [animalCityFilter, setAnimalCityFilter] = useState<string | null>(null)
  const [animalShelterFilter, setAnimalShelterFilter] = useState<string | null>(null)
  const [animalSpeciesFilter, setAnimalSpeciesFilter] = useState<SpeciesFilterValue | null>(null)

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
      species: null,
    }),
    [animalCityFilter, animalShelterFilter],
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

  const filteredShelters = useMemo(
    () => (data ? filterBySpecies(data, speciesFilter, (s) => s.species) : undefined),
    [data, speciesFilter],
  )

  const mapShelters = useMemo(() => {
    if (directoryTab === 'animals') return data ?? []
    return filteredShelters ?? []
  }, [directoryTab, data, filteredShelters])

  const speciesFilters = useMemo(
    () => buildSpeciesFilterRows(countSpecies(data ?? [], (s) => s.species)),
    [data],
  )

  const filteredAnimals = useMemo(
    () => (animals ? filterBySpecies(animals, animalSpeciesFilter, (a) => a.species) : undefined),
    [animals, animalSpeciesFilter],
  )

  const animalSpeciesFilters = useMemo(
    () => buildSpeciesFilterRows(countSpecies(animals ?? [], (a) => a.species)),
    [animals],
  )

  const communityStats = useMemo(() => ({
    shelters: data?.length,
    animals: animals?.length,
    hearts: animals?.reduce((s, a) => s + a.heartCount, 0),
  }), [data, animals])

  const {
    mapRef,
    addDialogNonce,
    suggestDialogNonce,
    selectedShelter,
    placementMode,
    suggestPlacementMode,
    draftFlow,
    draftLocation,
    addDialogOpen,
    suggestDialogOpen,
    placementOrRelocateActive,
    cancelPlacementDisabled,
    cancelSuggestDisabled,
    clearSelection,
    handleCancelPlacement,
    handleMapSelect,
    handleListSelect,
    handleStartAddPin,
    handleStartSuggestShelter,
    handleDraftPosition,
    handleEnterDetails,
    handleEnterSuggestDetails,
    handleCloseAddDialog,
    handleCloseSuggestDialog,
    handleSuggestSubmitted,
    handleCreateShelter,
    handleRemovePin,
  } = useShelterDiscoveryState(data, mutations)

  const clearSelectionAndMapHighlight = useCallback(() => {
    clearSelection()
    setMapShelterHighlightId(null)
  }, [clearSelection])

  const handleShelterSpeciesFilter = useCallback(
    (nextFilter: SpeciesFilterValue | null) => {
      if (nextFilter && selectedShelter) {
        const matches =
          nextFilter === 'others'
            ? selectedShelter.species.some(isOtherSpecies)
            : selectedShelter.species.includes(nextFilter)
        if (!matches) clearSelectionAndMapHighlight()
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

  // Deep link: open animal modal when ?animal=ID is in URL
  useEffect(() => {
    if (!initialAnimalId || deepLinkHandled.current || !animals) return
    deepLinkHandled.current = true
    const target = animals.find((a) => a.id === initialAnimalId)
    clearAnimalIdFromUrl()
    if (!target) return
    // Schedule after current render to avoid cascading setState in effect
    const id = requestAnimationFrame(() => handleSelectAnimal(target))
    return () => cancelAnimationFrame(id)
  }, [initialAnimalId, animals, handleSelectAnimal])

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
    try {
      const raw = localStorage.getItem(EXPLORE_STORAGE_KEY)
      if (raw) {
        const o = JSON.parse(raw) as { shortlistIds?: unknown }
        setExploreHasMatches(Array.isArray(o.shortlistIds) && o.shortlistIds.length > 0)
      }
    } catch { /* ignore */ }
  }, [])

  return (
    <div className="bg-background text-foreground flex h-full min-h-0 flex-col overflow-hidden">
      <DiscoveryHeader
        onShareFeedback={openHeaderFeedback}
        appView={appView}
        onGoExplore={() => navigateView('explore')}
        onGoDirectory={() => navigateView('directory')}
        hasMatches={exploreHasMatches}
        theme={theme}
        onCycleTheme={cycleTheme}
        stats={communityStats}
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
            suggestPlacementMode={suggestPlacementMode}
            draftFlow={draftFlow}
            draftLocation={draftLocation}
            addDialogOpen={addDialogOpen}
            suggestDialogOpen={suggestDialogOpen}
            cmsBusy={mutations.cmsBusy}
            cancelPlacementDisabled={cancelPlacementDisabled}
            cancelSuggestDisabled={cancelSuggestDisabled}
            onStartAddPin={handleStartAddPin}
            onStartSuggestShelter={handleStartSuggestShelter}
            onEnterDetails={handleEnterDetails}
            onEnterSuggestDetails={handleEnterSuggestDetails}
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
            animals={filteredAnimals}
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
            animalSpeciesFilters={animalSpeciesFilters}
            totalAnimalCount={filteredAnimals?.length}
            onViewAnimals={(shelterId) => {
              setAnimalShelterFilter(shelterId)
              setDirectoryTab('animals')
            }}
            isDark={resolved === 'dark'}
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
        key={`add-${addDialogNonce}`}
        open={addDialogOpen}
        draftLocation={draftFlow === 'cms' ? draftLocation : null}
        onClose={handleCloseAddDialog}
        onSubmit={handleCreateShelter}
        isSubmitting={mutations.createMutation.isPending}
      />
      <SuggestShelterDialog
        key={`suggest-${suggestDialogNonce}`}
        open={suggestDialogOpen}
        draftLocation={draftFlow === 'suggest' ? draftLocation : null}
        onClose={handleCloseSuggestDialog}
        onSubmitted={handleSuggestSubmitted}
      />
      <ShelterDetailDialog
        shelter={selectedShelter}
        onClose={handleCloseDetail}
        onRemove={handleRemovePin}
        onEdit={() => setEditOpen(true)}
        removeDisabled={mutations.cmsBusy}
        editDisabled={mutations.cmsBusy}
        onShareFeedback={openShelterFeedback}
        cmsConfigured={cmsConfigured}
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
        onShelterClick={() => {
          if (selectedAnimalShelter) {
            handleCloseAnimalDetail()
            handleListSelectClearingHighlight(selectedAnimalShelter)
          }
        }}
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
