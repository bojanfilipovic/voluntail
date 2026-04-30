import { Suspense, lazy, type RefObject } from 'react'
import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import { AnimalList } from '@/components/AnimalList'
import { DiscoveryErrorBoundary } from '@/components/layout/DiscoveryErrorBoundary'
import { DiscoveryGrid } from '@/components/layout/DiscoveryGrid'
import { MapPlacementToolbar } from '@/components/layout/MapPlacementToolbar'
import type { ShelterMapHandle } from '@/components/ShelterMap'
import { ShelterList } from '@/components/ShelterList'
import { Button } from '@/components/ui/button'
import type { ShelterSpecies } from '@/domain/species'
import { MapLoadingFallback } from '@/directory/MapLoadingFallback'

/** Same as MapCenter from ShelterMap — duplicated here to avoid a static import of the map module next to a lazy() of it. */
type DraftMapPosition = { latitude: number; longitude: number }

const ShelterMapLazy = lazy(async () => {
  const mod = await import('@/components/ShelterMap')
  return { default: mod.ShelterMap }
})

type DirectoryTab = 'shelters' | 'animals'

/**
 * Map + list area for the directory (no modals). State and queries live in the parent
 * so Explore and directory can share the same animal selection contract.
 */
export type DirectoryLayoutProps = {
  shelterMapRef: RefObject<ShelterMapHandle | null>
  placementMode: boolean
  draftLocation: DraftMapPosition | null
  addDialogOpen: boolean
  cmsBusy: boolean
  cancelPlacementDisabled: boolean
  onStartAddPin: () => void
  onEnterDetails: () => void
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
  speciesFilter: ShelterSpecies | null
  onShelterSpeciesFilter: (f: ShelterSpecies | null) => void
  speciesFilters: { species: ShelterSpecies; count: number }[]
  animals: Animal[] | undefined
  allShelters: Shelter[] | undefined
  animalsLoading: boolean
  onSelectAnimal: (a: Animal) => void
  selectedAnimalId: string | null
  animalCityFilter: string | null
  onAnimalCityFilter: (c: string | null) => void
  animalShelterFilter: string | null
  onAnimalShelterFilter: (s: string | null) => void
  animalSpeciesFilter: ShelterSpecies | null
  onAnimalSpeciesFilter: (s: ShelterSpecies | null) => void
  shelterCityOptions: string[]
  animalSpeciesCounts: Record<ShelterSpecies, number>
}

export function DirectoryLayout({
  shelterMapRef,
  placementMode,
  draftLocation,
  addDialogOpen,
  cmsBusy,
  cancelPlacementDisabled,
  onStartAddPin,
  onEnterDetails,
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
  animalSpeciesCounts,
}: DirectoryLayoutProps) {
  return (
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
            cmsBusy={cmsBusy}
            cancelPlacementDisabled={cancelPlacementDisabled}
            onStartAddPin={onStartAddPin}
            onEnterDetails={onEnterDetails}
            onCancelPlacement={onCancelPlacement}
          />
          <div className="flex h-full min-h-0 flex-1 flex-col">
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
            {directoryTab === 'animals' && cmsConfigured ? (
              <Button
                type="button"
                size="sm"
                variant="default"
                disabled={addAnimalCmsBusy || !canAddAnimal}
                onClick={onAddAnimalClick}
              >
                Add animal
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
              />
            ) : (
              <AnimalList
                animals={animals}
                shelters={allShelters}
                error={directoryError}
                isPending={animalsLoading}
                selectedId={selectedAnimalId}
                onSelectAnimal={onSelectAnimal}
                cityFilter={animalCityFilter}
                onCityFilter={onAnimalCityFilter}
                shelterFilter={animalShelterFilter}
                onShelterFilter={onAnimalShelterFilter}
                speciesFilter={animalSpeciesFilter}
                onSpeciesFilter={onAnimalSpeciesFilter}
                cityOptions={shelterCityOptions}
                speciesCounts={animalSpeciesCounts}
              />
            )}
          </div>
        </section>
      </DiscoveryGrid>
    </DiscoveryErrorBoundary>
  )
}
