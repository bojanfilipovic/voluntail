import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import {
  ANIMAL_PAGE_SIZE,
  fetchAnimalSpeciesFacets,
  fetchAnimalsPage,
  fetchAnimalsPublicPage,
} from '@/api/animals'
import type { Animal } from '@/api/animals'
import { fetchDirectoryStats } from '@/api/directoryStats'
import { fetchShelterMapMarkers, type Shelter } from '@/api/shelters'
import { AddAnimalDialog } from '@/components/AddAnimalDialog'
import { AddShelterDialog } from '@/components/AddShelterDialog'
import { AnimalDetailDialog } from '@/components/AnimalDetailDialog'
import { EditAnimalDialog } from '@/components/EditAnimalDialog'
import { EditShelterDialog } from '@/components/EditShelterDialog'
import { ShelterDetailDialog } from '@/components/ShelterDetailDialog'
import { ShareFeedbackDialog } from '@/components/ShareFeedbackDialog'
import { SuggestShelterDialog } from '@/components/SuggestShelterDialog'
import { SeoHelmet } from '@/components/SeoHelmet'
import { DiscoveryHeader } from '@/components/layout/DiscoveryHeader'
import { WelcomeOverlay } from '@/components/WelcomeOverlay'
import { useAnimalDeepLink } from '@/hooks/useAnimalDeepLink'
import { useAnimalMutations } from '@/hooks/useAnimalMutations'
import { useAppViewNavigation } from '@/hooks/useAppViewNavigation'
import { useDiscoveryDerived } from '@/hooks/useDiscoveryDerived'
import { useShelterDiscoveryState } from '@/hooks/useShelterDiscoveryState'
import { useShelterMutations } from '@/hooks/useShelterMutations'
import { isOtherSpecies, type SpeciesFilterValue } from '@/domain/species'
import { DirectoryLayout } from '@/directory/DirectoryLayout'
import type { DirectoryTab } from '@/directory/types'
import { useTheme } from '@/hooks/useTheme'
import { catalogQueryOptions } from '@/lib/catalogQueryOptions'
import { animalQueryKeys, directoryQueryKeys, shelterQueryKeys } from '@/lib/queryKeys'
import { useI18n } from '@/i18n/I18nContext'

const ExploreViewLazy = lazy(async () => {
  const mod = await import('@/explore/ExploreView')
  return { default: mod.ExploreView }
})

export function DirectoryApp() {
  const location = useLocation()
  const { locale, t } = useI18n()
  const { theme, resolved, cycleTheme } = useTheme()
  const mutations = useShelterMutations()
  const animalMutations = useAnimalMutations()
  const { appView, exploreHasMatches, navigateView } = useAppViewNavigation()

  const [directoryTab, setDirectoryTab] = useState<DirectoryTab>('shelters')
  const [speciesFilter, setSpeciesFilter] = useState<SpeciesFilterValue | null>(null)

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

  const cmsConfigured = Boolean(import.meta.env.VITE_CMS_API_KEY?.trim())

  const { data: shelterRows, error, isPending } = useQuery({
    queryKey: shelterQueryKeys.mapMarkers,
    queryFn: fetchShelterMapMarkers,
    ...catalogQueryOptions,
  })

  const { data: statsData } = useQuery({
    queryKey: directoryQueryKeys.stats,
    queryFn: fetchDirectoryStats,
    ...catalogQueryOptions,
  })

  const facetFilters = useMemo(
    () => ({ city: animalCityFilter, shelterId: animalShelterFilter }),
    [animalCityFilter, animalShelterFilter],
  )

  const { data: facetCounts } = useQuery({
    queryKey: animalQueryKeys.facets(facetFilters),
    queryFn: () => fetchAnimalSpeciesFacets(facetFilters),
    ...catalogQueryOptions,
  })

  const animalInf = useInfiniteQuery({
    queryKey: animalQueryKeys.listInfinite(animalListQuery),
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const offset = pageParam as number
      return cmsConfigured
        ? fetchAnimalsPage(animalListQuery, { limit: ANIMAL_PAGE_SIZE, offset })
        : fetchAnimalsPublicPage(animalListQuery, { limit: ANIMAL_PAGE_SIZE, offset })
    },
    getNextPageParam: (last) => {
      const next = last.offset + last.items.length
      return next < last.total ? next : undefined
    },
    ...catalogQueryOptions,
  })

  const animalsFlat = useMemo(
    () => animalInf.data?.pages.flatMap((p) => p.items),
    [animalInf.data],
  )

  const animalsTotal = animalInf.data?.pages[0]?.total

  const directoryStatsStrip = useMemo(() => {
    if (!statsData) return undefined
    return {
      shelters: statsData.shelterCount,
      animals: statsData.animalCount,
      hearts: statsData.heartCountSum,
    }
  }, [statsData])

  const {
    directoryAlert,
    shelterCityOptions,
    filteredShelters,
    mapShelters,
    speciesFilters,
    filteredAnimals,
    animalSpeciesFilters,
    communityStats,
  } = useDiscoveryDerived({
    directoryTab,
    speciesFilter,
    animalSpeciesFilter,
    shelterRows,
    animalRows: animalsFlat,
    shelterQueryError: error,
    animalsQueryError: animalInf.error,
    shelterCmsError: mutations.cmsError,
    animalCmsError: animalMutations.cmsError,
    directoryStats: directoryStatsStrip,
    animalSpeciesFacetCounts: facetCounts,
  })

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
  } = useShelterDiscoveryState(shelterRows, mutations)

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

  /** Single source for animal detail modal: avoids open=true with animal=null (empty overlay). */
  const animalForDetailModal =
    animalDetailOpen && selectedAnimal ? selectedAnimal : null

  const selectedAnimalShelter = useMemo(() => {
    if (!animalForDetailModal || !shelterRows) return null
    return shelterRows.find((s) => s.id === animalForDetailModal.shelterId) ?? null
  }, [animalForDetailModal, shelterRows])

  const handleSelectAnimal = useCallback(
    (animal: Animal) => {
      clearSelection()
      setMapShelterHighlightId(animal.shelterId)
      const sh = shelterRows?.find((s) => s.id === animal.shelterId)
      if (sh) {
        mapRef.current?.flyToShelter(sh)
      }
      setSelectedAnimal(animal)
      setAnimalDetailOpen(true)
    },
    [shelterRows, clearSelection, mapRef],
  )

  useAnimalDeepLink(animalsFlat, handleSelectAnimal)

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
    if (!window.confirm(t('cms.confirmRemoveAnimal'))) return
    animalMutations.setCmsError(null)
    await animalMutations.deleteMutation.mutateAsync(selectedAnimal.id)
    handleCloseAnimalDetail()
  }, [selectedAnimal, animalMutations, handleCloseAnimalDetail, t])

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

  return (
    <>
      <SeoHelmet
        title={t('seo.home.title')}
        description={t('seo.home.description')}
        path={location.pathname}
        locale={locale}
      />
      <div className="bg-background text-foreground flex min-h-0 flex-1 flex-col overflow-hidden">
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
      <WelcomeOverlay stats={communityStats} />
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
            onSuggestShelter={handleStartSuggestShelter}
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
            canAddAnimal={Boolean(shelterRows?.length)}
            onAddAnimalClick={() => setAddAnimalOpen(true)}
            addAnimalCmsBusy={animalMutations.cmsBusy}
            filteredShelters={filteredShelters}
            directoryError={directoryAlert}
            sheltersLoading={isPending}
            shelterTotal={statsData?.shelterCount ?? shelterRows?.length}
            onSelectShelterFromList={handleListSelectClearingHighlight}
            speciesFilter={speciesFilter}
            onShelterSpeciesFilter={handleShelterSpeciesFilter}
            speciesFilters={speciesFilters}
            animals={filteredAnimals}
            allShelters={shelterRows}
            animalsLoading={animalInf.isPending}
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
            totalAnimalCount={animalsTotal}
            onLoadMoreAnimals={() => void animalInf.fetchNextPage()}
            animalsHasNextPage={animalInf.hasNextPage}
            animalsFetchingNextPage={animalInf.isFetchingNextPage}
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
                <span>{t('loading.explore')}</span>
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
        shelters={shelterRows ?? []}
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
        shelters={shelterRows ?? []}
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
      <Analytics />
      <SpeedInsights />
    </div>
    </>
  )
}
