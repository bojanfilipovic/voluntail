import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import type { Shelter, ShelterCreatePayload } from '@/api/shelters'
import type { MapCenter, ShelterMapHandle } from '@/components/ShelterMap'
import type { ShelterMutationsApi } from '@/hooks/useShelterMutations'

export function useShelterDiscoveryState(
  shelters: Shelter[] | undefined,
  mutations: ShelterMutationsApi,
) {
  const { createMutation, deleteMutation, setCmsError } = mutations

  const mapRef = useRef<ShelterMapHandle>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [placementMode, setPlacementMode] = useState(false)
  const [draftLocation, setDraftLocation] = useState<MapCenter | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  /** Bumps when opening "Enter details" so AddShelterDialog remounts with fresh form fields. */
  const [addDialogNonce, setAddDialogNonce] = useState(0)

  const selectedShelter = useMemo(() => {
    if (!selectedId || !shelters) return null
    return shelters.find((s) => s.id === selectedId) ?? null
  }, [shelters, selectedId])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleCancelPlacement = useCallback(() => {
    setPlacementMode(false)
    setDraftLocation(null)
    setAddDialogOpen(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (addDialogOpen) return
      if (!placementMode && !draftLocation) return
      handleCancelPlacement()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [addDialogOpen, placementMode, draftLocation, handleCancelPlacement])

  const handleMapSelect = useCallback((s: Shelter) => {
    setDraftLocation(null)
    setPlacementMode(false)
    setSelectedId(s.id)
  }, [])

  const handleListSelect = useCallback((s: Shelter) => {
    setDraftLocation(null)
    setPlacementMode(false)
    setSelectedId(s.id)
    mapRef.current?.flyToShelter(s)
  }, [])

  const handleStartAddPin = useCallback(() => {
    setCmsError(null)
    setSelectedId(null)
    setAddDialogOpen(false)
    setDraftLocation(null)
    setPlacementMode(true)
  }, [setCmsError])

  const handleDraftPosition = useCallback((loc: MapCenter) => {
    setDraftLocation(loc)
    setPlacementMode(false)
    setSelectedId(null)
  }, [])

  const handleEnterDetails = useCallback(() => {
    if (!draftLocation) return
    setAddDialogNonce((n) => n + 1)
    setAddDialogOpen(true)
  }, [draftLocation])

  const handleCloseAddDialog = useCallback(() => {
    setAddDialogOpen(false)
  }, [])

  const handleCreateShelter = useCallback(
    async (payload: ShelterCreatePayload) => {
      const created = await createMutation.mutateAsync(payload)
      setDraftLocation(null)
      setPlacementMode(false)
      setAddDialogOpen(false)
      setSelectedId(created.id)
      mapRef.current?.flyToShelter(created)
      return created
    },
    [createMutation],
  )

  const handleRemovePin = useCallback(() => {
    if (!selectedId) return
    if (!window.confirm('Remove this shelter from the database?')) return
    setCmsError(null)
    deleteMutation.mutate(selectedId, {
      onSuccess: () => setSelectedId(null),
    })
  }, [deleteMutation, selectedId, setCmsError])

  const placementOrRelocateActive =
    placementMode || (!!draftLocation && !addDialogOpen)

  const cancelPlacementDisabled =
    mutations.cmsBusy || (!placementMode && !draftLocation)

  return {
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
  }
}
