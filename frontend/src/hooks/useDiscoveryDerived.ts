import { useMemo } from 'react'
import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import type { SpeciesFilterValue } from '@/domain/species'
import { buildSpeciesFilterRows, countSpecies, filterBySpecies } from '@/domain/speciesFilter'
import type { DirectoryTab } from '@/directory/types'
import { toQueryError } from '@/lib/queryError'

export function useDiscoveryDerived(params: {
  directoryTab: DirectoryTab
  speciesFilter: SpeciesFilterValue | null
  animalSpeciesFilter: SpeciesFilterValue | null
  shelterRows: Shelter[] | undefined
  animalRows: Animal[] | undefined
  shelterQueryError: unknown
  animalsQueryError: unknown
  shelterCmsError: string | null
  animalCmsError: string | null
}) {
  const {
    directoryTab,
    speciesFilter,
    animalSpeciesFilter,
    shelterRows,
    animalRows,
    shelterQueryError,
    animalsQueryError,
    shelterCmsError,
    animalCmsError,
  } = params

  const queryError = useMemo(
    () => toQueryError(shelterQueryError),
    [shelterQueryError],
  )
  const animalsQueryErrorNorm = useMemo(
    () => toQueryError(animalsQueryError),
    [animalsQueryError],
  )

  const directoryAlert = useMemo((): Error | null => {
    const q = directoryTab === 'shelters' ? queryError : animalsQueryErrorNorm
    const cmsText =
      directoryTab === 'shelters' ? shelterCmsError : animalCmsError
    if (q?.message && cmsText && q.message === cmsText) {
      return q
    }
    if (q) return q
    if (cmsText) return new Error(cmsText)
    return null
  }, [
    directoryTab,
    queryError,
    animalsQueryErrorNorm,
    shelterCmsError,
    animalCmsError,
  ])

  const shelterCityOptions = useMemo(() => {
    const set = new Set<string>()
    for (const s of shelterRows ?? []) {
      const c = s.city.trim()
      if (c) set.add(c)
    }
    return [...set].sort((a, b) => a.localeCompare(b))
  }, [shelterRows])

  const filteredShelters = useMemo(
    () =>
      shelterRows
        ? filterBySpecies(shelterRows, speciesFilter, (s) => s.species)
        : undefined,
    [shelterRows, speciesFilter],
  )

  const mapShelters = useMemo(() => {
    if (directoryTab === 'animals') return shelterRows ?? []
    return filteredShelters ?? []
  }, [directoryTab, shelterRows, filteredShelters])

  const speciesFilters = useMemo(
    () =>
      buildSpeciesFilterRows(
        countSpecies(shelterRows ?? [], (s) => s.species),
      ),
    [shelterRows],
  )

  const filteredAnimals = useMemo(
    () =>
      animalRows
        ? filterBySpecies(animalRows, animalSpeciesFilter, (a) => a.species)
        : undefined,
    [animalRows, animalSpeciesFilter],
  )

  const animalSpeciesFilters = useMemo(
    () =>
      buildSpeciesFilterRows(
        countSpecies(animalRows ?? [], (a) => a.species),
      ),
    [animalRows],
  )

  const communityStats = useMemo(
    () => ({
      shelters: shelterRows?.length,
      animals: animalRows?.length,
      hearts: animalRows?.reduce((s, a) => s + a.heartCount, 0),
    }),
    [shelterRows, animalRows],
  )

  return {
    directoryAlert,
    shelterCityOptions,
    filteredShelters,
    mapShelters,
    speciesFilters,
    filteredAnimals,
    animalSpeciesFilters,
    communityStats,
  }
}
