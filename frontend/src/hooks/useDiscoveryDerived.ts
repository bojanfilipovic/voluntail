import { useMemo } from 'react'
import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import type { SpeciesFilterValue } from '@/domain/species'
import {
  buildSpeciesFilterRows,
  countSpecies,
  facetCountsToSpeciesRecord,
  filterBySpecies,
} from '@/domain/speciesFilter'
import type { DirectoryTab } from '@/directory/types'
import { toQueryError } from '@/lib/queryError'

export type DirectoryStatsStrip = {
  shelters: number
  animals: number
  hearts: number
}

export function useDiscoveryDerived(params: {
  directoryTab: DirectoryTab
  speciesFilter: SpeciesFilterValue | null
  animalSpeciesFilter: SpeciesFilterValue | null
  /** Full shelter set for map + list (map-markers). */
  shelterRows: Shelter[] | undefined
  animalRows: Animal[] | undefined
  shelterQueryError: unknown
  animalsQueryError: unknown
  shelterCmsError: string | null
  animalCmsError: string | null
  /** From GET /api/directory-stats — replaces counting loaded rows. */
  directoryStats: DirectoryStatsStrip | undefined
  /** From GET /api/animals/facets for current city/shelter scope. */
  animalSpeciesFacetCounts: Record<string, number> | undefined
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
    directoryStats,
    animalSpeciesFacetCounts,
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

  const animalSpeciesFilters = useMemo(() => {
    if (animalSpeciesFacetCounts) {
      return buildSpeciesFilterRows(facetCountsToSpeciesRecord(animalSpeciesFacetCounts))
    }
    return buildSpeciesFilterRows(
      countSpecies(animalRows ?? [], (a) => a.species),
    )
  }, [animalSpeciesFacetCounts, animalRows])

  const communityStats = useMemo((): DirectoryStatsStrip | undefined => {
    if (directoryStats) return directoryStats
    if (shelterRows === undefined || animalRows === undefined) return undefined
    return {
      shelters: shelterRows.length,
      animals: animalRows.length,
      hearts: animalRows.reduce((s, a) => s + a.heartCount, 0),
    }
  }, [directoryStats, shelterRows, animalRows])

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
