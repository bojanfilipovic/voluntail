import { useQuery } from '@tanstack/react-query'
import { Suspense, lazy, useMemo, useState, useCallback, useEffect, type RefObject } from 'react'
import type { Animal } from '@/api/animals'
import { fetchAnimals } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import { AnimalList } from '@/components/AnimalList'
import { DiscoveryErrorBoundary } from '@/components/layout/DiscoveryErrorBoundary'
import { DiscoveryGrid } from '@/components/layout/DiscoveryGrid'
import { AnimalCmsToolbar } from '@/components/layout/AnimalCmsToolbar'
import { MapPlacementToolbar } from '@/components/layout/MapPlacementToolbar'
import { MapPublicToolbar } from '@/components/layout/MapPublicToolbar'
import type { ShelterMapHandle } from '@/components/ShelterMap'
import { ShelterList } from '@/components/ShelterList'
import { Button } from '@/components/ui/button'
import type { DraftFlow } from '@/hooks/useShelterDiscoveryState'
import type { SpeciesFilterValue } from '@/domain/species'
import { animalsRowsForDirectoryList } from '@/directory/animalListSource'
import { MapLoadingFallback } from '@/directory/MapLoadingFallback'
import type { DirectoryTab } from '@/directory/types'
import { EXPLORE_SESSION_CHANGED_EVENT, EXPLORE_STORAGE_KEY } from '@/explore/types'
import { getShortlistIds } from '@/lib/exploreShortlist'
import { getHeartedIds, HEARTS_STORAGE_KEY, subscribeHeartsChanged } from '@/lib/heartStorage'
import { animalQueryKeys, type AnimalListQuery } from '@/lib/queryKeys'
import { Dices } from 'lucide-react'

/** Same as MapCenter from ShelterMap — duplicated here to avoid a static import of the map module next to a lazy() of it. */
type DraftMapPosition = { latitude: number; longitude: number }

const ShelterMapLazy = lazy(async () => {
  const mod = await import('@/components/ShelterMap')
  return { default: mod.ShelterMap }
})

/**
 * Map + list area for the directory (no modals). State and queries live in the parent
 * so Explore and directory can share the same animal selection contract.
 */
export type DirectoryLayoutProps = {
  shelterMapRef: RefObject<ShelterMapHandle | null>
  placementMode: boolean
  suggestPlacementMode: boolean
  draftFlow: DraftFlow
  draftLocation: DraftMapPosition | null
  addDialogOpen: boolean
  suggestDialogOpen: boolean
  cmsBusy: boolean
  cancelPlacementDisabled: boolean
  cancelSuggestDisabled: boolean
  onStartAddPin: () => void
  onStartSuggestShelter: () => void
  /** Map empty-viewport hint → same flow as “Suggest shelter” in the public toolbar. */
  onSuggestShelter?: () => void
  onEnterDetails: () => void
  onEnterSuggestDetails: () => void
  onCancelPlacement: () => void
  mapShelters: Shelter[]
  selectedShelter: Shelter | null
  mapShelterHighlightId: string | null
  onMapSelectShelter: (s: Shelter) => void
  onClearMapSelection: () => void
  placementOrRelocateActive: boolean
  onDraftPosition: (c: DraftMapPosition) => void
  directoryTab: DirectoryTab
  onDirectoryTab: (t: DirectoryTab) => void
  cmsConfigured: boolean
  canAddAnimal: boolean
  onAddAnimalClick: () => void
  addAnimalCmsBusy: boolean
  filteredShelters: Shelter[] | undefined
  directoryError: Error | null
  sheltersLoading: boolean
  shelterTotal: number | undefined
  onSelectShelterFromList: (s: Shelter) => void
  speciesFilter: SpeciesFilterValue | null
  onShelterSpeciesFilter: (f: SpeciesFilterValue | null) => void
  speciesFilters: import('@/components/SpeciesFilterBar').SpeciesFilterRow[]
  animals: Animal[] | undefined
  allShelters: Shelter[] | undefined
  animalsLoading: boolean
  onSelectAnimal: (a: Animal) => void
  selectedAnimalId: string | null
  animalCityFilter: string | null
  onAnimalCityFilter: (c: string | null) => void
  animalShelterFilter: string | null
  onAnimalShelterFilter: (s: string | null) => void
  animalSpeciesFilter: SpeciesFilterValue | null
  onAnimalSpeciesFilter: (s: SpeciesFilterValue | null) => void
  shelterCityOptions: string[]
  animalSpeciesFilters: import('@/components/SpeciesFilterBar').SpeciesFilterRow[]
  totalAnimalCount: number | undefined
  onViewAnimals: (shelterId: string) => void
  isDark?: boolean
}

export function DirectoryLayout({
  shelterMapRef,
  placementMode,
  suggestPlacementMode,
  draftFlow,
  draftLocation,
  addDialogOpen,
  suggestDialogOpen,
  cmsBusy,
  cancelPlacementDisabled,
  cancelSuggestDisabled,
  onStartAddPin,
  onStartSuggestShelter,
  onSuggestShelter,
  onEnterDetails,
  onEnterSuggestDetails,
  onCancelPlacement,
  mapShelters,
  selectedShelter,
  mapShelterHighlightId,
  onMapSelectShelter,
  onClearMapSelection,
  placementOrRelocateActive,
  onDraftPosition,
  directoryTab,
  onDirectoryTab,
  cmsConfigured,
  canAddAnimal,
  onAddAnimalClick,
  addAnimalCmsBusy,
  filteredShelters,
  directoryError,
  sheltersLoading,
  shelterTotal,
  onSelectShelterFromList,
  speciesFilter,
  onShelterSpeciesFilter,
  speciesFilters,
  animals,
  allShelters,
  animalsLoading,
  onSelectAnimal,
  selectedAnimalId,
  animalCityFilter,
  onAnimalCityFilter,
  animalShelterFilter,
  onAnimalShelterFilter,
  animalSpeciesFilter,
  onAnimalSpeciesFilter,
  shelterCityOptions,
  animalSpeciesFilters,
  totalAnimalCount,
  onViewAnimals,
  isDark = false,
}: DirectoryLayoutProps) {
  const cmsDraftLocationKnown = draftFlow === 'cms' && Boolean(draftLocation)
  const suggestDraftLocationKnown = draftFlow === 'suggest' && Boolean(draftLocation)
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const handleFavoritesToggle = useCallback(() => setFavoritesOnly((v) => !v), [])
  const [matchesOnly, setMatchesOnly] = useState(false)
  const handleMatchesToggle = useCallback(() => setMatchesOnly((v) => !v), [])

  useEffect(() => {
    const syncFavoriteMode = (): void => {
      setFavoritesOnly((fo) => (fo && getHeartedIds().size === 0 ? false : fo))
    }
    const syncMatchMode = (): void => {
      setMatchesOnly((mo) => (mo && getShortlistIds().size === 0 ? false : mo))
    }
    const unheart = subscribeHeartsChanged(syncFavoriteMode)
    const onExplore = (): void => {
      syncMatchMode()
    }
    window.addEventListener(EXPLORE_SESSION_CHANGED_EVENT, onExplore)
    const onStorage = (e: StorageEvent): void => {
      if (e.key === HEARTS_STORAGE_KEY || e.key === EXPLORE_STORAGE_KEY) {
        syncFavoriteMode()
        syncMatchMode()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => {
      unheart()
      window.removeEventListener(EXPLORE_SESSION_CHANGED_EVENT, onExplore)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const unscopedListQuery = useMemo(
    (): AnimalListQuery => ({
      city: null,
      shelterId: null,
      species: null,
    }),
    [],
  )

  const favoritesOrMatchesOnly = favoritesOnly || matchesOnly
  const needsGlobalAnimalList = favoritesOrMatchesOnly && directoryTab === 'animals'

  const { data: unscopedAnimals, isPending: unscopedAnimalsPending } = useQuery({
    queryKey: animalQueryKeys.list(unscopedListQuery),
    queryFn: () => fetchAnimals(unscopedListQuery),
    enabled: needsGlobalAnimalList,
  })

  const animalsForList = useMemo(
    () =>
      animalsRowsForDirectoryList({
        favoritesOrMatchesOnly,
        scopedAnimals: animals,
        unscopedAnimals,
        speciesFilter: animalSpeciesFilter,
      }),
    [favoritesOrMatchesOnly, animals, unscopedAnimals, animalSpeciesFilter],
  )

  const animalsListLoading = animalsLoading || (needsGlobalAnimalList && unscopedAnimalsPending)

  const surprisePickSource = animalsForList ?? animals

  return (
    <DiscoveryErrorBoundary>
      <DiscoveryGrid>
        <section
          className="border-border relative shrink-0 snap-start overflow-hidden rounded-lg border h-[30svh] lg:h-auto"
          aria-label="Map of shelters"
        >
          <Suspense fallback={<MapLoadingFallback />}>
            <ShelterMapLazy
              ref={shelterMapRef}
              shelters={mapShelters}
              selectedId={selectedShelter?.id ?? null}
              animalContextShelterId={mapShelterHighlightId}
              onSelectShelter={onMapSelectShelter}
              onClearSelection={onClearMapSelection}
              placementOrRelocateActive={placementOrRelocateActive}
              draftLocation={draftLocation}
              onDraftPosition={onDraftPosition}
              isDark={isDark}
              onSuggestShelter={onSuggestShelter}
            />
          </Suspense>
          <div className="pointer-events-none absolute top-2 left-2 z-10">
            <MapPublicToolbar
              placementMode={suggestPlacementMode}
              draftLocationKnown={suggestDraftLocationKnown}
              suggestDialogOpen={suggestDialogOpen}
              cancelPlacementDisabled={cancelSuggestDisabled}
              onStartAddPin={onStartSuggestShelter}
              onEnterDetails={onEnterSuggestDetails}
              onCancelPlacement={onCancelPlacement}
            />
          </div>
          {cmsConfigured ? (
            <div className="pointer-events-none absolute bottom-2 left-2 z-10">
              <MapPlacementToolbar
                placementMode={placementMode}
                draftLocationKnown={cmsDraftLocationKnown}
                addDialogOpen={addDialogOpen}
                cmsBusy={cmsBusy}
                cancelPlacementDisabled={cancelPlacementDisabled}
                onStartAddPin={onStartAddPin}
                onEnterDetails={onEnterDetails}
                onCancelPlacement={onCancelPlacement}
              />
            </div>
          ) : null}
        </section>
        <section
          className="border-border flex min-h-[calc(100%-80px)] shrink-0 snap-start flex-col overflow-hidden rounded-lg border lg:min-h-0"
          aria-label="Directory"
        >
          {/* Drag handle — mobile affordance for scroll-snap */}
          <div className="flex justify-center py-1.5 lg:hidden" aria-hidden>
            <div className="h-1 w-10 rounded-full bg-border" />
          </div>
          <div
            className="border-border bg-muted/30 flex flex-shrink-0 flex-wrap items-center gap-2 border-b px-3 py-2"
            role="tablist"
            aria-label="Directory view"
          >
            <Button
              type="button"
              size="sm"
              variant={directoryTab === 'shelters' ? 'default' : 'outline'}
              onClick={() => onDirectoryTab('shelters')}
              aria-pressed={directoryTab === 'shelters'}
            >
              Shelters
            </Button>
            <Button
              type="button"
              size="sm"
              variant={directoryTab === 'animals' ? 'default' : 'outline'}
              onClick={() => onDirectoryTab('animals')}
              aria-pressed={directoryTab === 'animals'}
            >
              Animals
            </Button>
            {directoryTab === 'animals' && (surprisePickSource?.length ?? 0) > 1 ? (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="ml-auto"
                onClick={() => {
                  if (!surprisePickSource?.length) return
                  const pick =
                    surprisePickSource[Math.floor(Math.random() * surprisePickSource.length)]
                  onSelectAnimal(pick)
                }}
              >
                <Dices className="size-3.5" aria-hidden />
                Surprise me
              </Button>
            ) : null}
          </div>
          <div
            className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4"
            role="region"
            aria-label="Shelter and animal directory list"
          >
            {directoryTab === 'shelters' ? (
              <ShelterList
                shelters={filteredShelters}
                error={directoryError}
                isPending={sheltersLoading}
                totalShelterCount={shelterTotal}
                selectedId={selectedShelter?.id ?? null}
                onSelectShelter={onSelectShelterFromList}
                speciesFilter={speciesFilter}
                onSpeciesFilter={onShelterSpeciesFilter}
                speciesFilters={speciesFilters}
                onViewAnimals={onViewAnimals}
              />
            ) : (
              <AnimalList
                animals={animalsForList}
                shelters={allShelters}
                error={directoryError}
                isPending={animalsListLoading}
                selectedId={selectedAnimalId}
                onSelectAnimal={onSelectAnimal}
                cityFilter={animalCityFilter}
                onCityFilter={onAnimalCityFilter}
                shelterFilter={animalShelterFilter}
                onShelterFilter={onAnimalShelterFilter}
                speciesFilter={animalSpeciesFilter}
                onSpeciesFilter={onAnimalSpeciesFilter}
                cityOptions={shelterCityOptions}
                speciesFilters={animalSpeciesFilters}
                totalAnimalCount={totalAnimalCount}
                favoritesOnly={favoritesOnly}
                onFavoritesToggle={handleFavoritesToggle}
                matchesOnly={matchesOnly}
                onMatchesToggle={handleMatchesToggle}
              />
            )}
          </div>
          {cmsConfigured && directoryTab === 'animals' ? (
            <AnimalCmsToolbar
              cmsBusy={addAnimalCmsBusy}
              canAddAnimal={canAddAnimal}
              onAddAnimal={onAddAnimalClick}
            />
          ) : null}
        </section>
      </DiscoveryGrid>
    </DiscoveryErrorBoundary>
  )
}
