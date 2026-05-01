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

export type DraftFlow = 'cms' | 'suggest' | null

export function useShelterDiscoveryState(
  shelters: Shelter[] | undefined,
  mutations: ShelterMutationsApi,
) {
  const { createMutation, deleteMutation, setCmsError } = mutations

  const mapRef = useRef<ShelterMapHandle>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const [placementMode, setPlacementMode] = useState(false)
  const [suggestPlacementMode, setSuggestPlacementMode] = useState(false)
  const [draftLocation, setDraftLocation] = useState<MapCenter | null>(null)
  const [draftFlow, setDraftFlow] = useState<DraftFlow>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [suggestDialogOpen, setSuggestDialogOpen] = useState(false)
  /** Bumps when opening "Enter details" so AddShelterDialog remounts with fresh form fields. */
  const [addDialogNonce, setAddDialogNonce] = useState(0)
  const [suggestDialogNonce, setSuggestDialogNonce] = useState(0)

  const selectedShelter = useMemo(() => {
    if (!selectedId || !shelters) return null
    return shelters.find((s) => s.id === selectedId) ?? null
  }, [shelters, selectedId])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleCancelPlacement = useCallback(() => {
    setPlacementMode(false)
    setSuggestPlacementMode(false)
    setDraftLocation(null)
    setDraftFlow(null)
    setAddDialogOpen(false)
    setSuggestDialogOpen(false)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (addDialogOpen || suggestDialogOpen) return
      if (!placementMode && !suggestPlacementMode && !draftLocation) return
      handleCancelPlacement()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    addDialogOpen,
    suggestDialogOpen,
    placementMode,
    suggestPlacementMode,
    draftLocation,
    handleCancelPlacement,
  ])

  const clearDraftAndPickModes = useCallback(() => {
    setDraftLocation(null)
    setDraftFlow(null)
    setPlacementMode(false)
    setSuggestPlacementMode(false)
    setAddDialogOpen(false)
    setSuggestDialogOpen(false)
  }, [])

  const handleMapSelect = useCallback((s: Shelter) => {
    clearDraftAndPickModes()
    setSelectedId(s.id)
  }, [clearDraftAndPickModes])

  const handleListSelect = useCallback(
    (s: Shelter) => {
      clearDraftAndPickModes()
      setSelectedId(s.id)
      mapRef.current?.flyToShelter(s)
    },
    [clearDraftAndPickModes],
  )

  const handleStartAddPin = useCallback(() => {
    setCmsError(null)
    setSelectedId(null)
    setAddDialogOpen(false)
    setSuggestPlacementMode(false)
    setSuggestDialogOpen(false)
    setDraftLocation(null)
    setDraftFlow(null)
    setPlacementMode(true)
  }, [setCmsError])

  const handleStartSuggestShelter = useCallback(() => {
    setSelectedId(null)
    setAddDialogOpen(false)
    setPlacementMode(false)
    setDraftLocation(null)
    setDraftFlow(null)
    setSuggestDialogOpen(false)
    setSuggestPlacementMode(true)
  }, [])

  const handleDraftPosition = useCallback(
    (loc: MapCenter) => {
      let flow: DraftFlow = null
      if (placementMode) flow = 'cms'
      else if (suggestPlacementMode) flow = 'suggest'
      else if (draftFlow) flow = draftFlow
      if (!flow) return

      setDraftFlow(flow)
      setPlacementMode(false)
      setSuggestPlacementMode(false)
      setDraftLocation(loc)
      setSelectedId(null)
    },
    [placementMode, suggestPlacementMode, draftFlow],
  )

  const handleEnterDetails = useCallback(() => {
    if (!draftLocation || draftFlow !== 'cms') return
    setAddDialogNonce((n) => n + 1)
    setAddDialogOpen(true)
  }, [draftLocation, draftFlow])

  const handleEnterSuggestDetails = useCallback(() => {
    if (!draftLocation || draftFlow !== 'suggest') return
    setSuggestDialogNonce((n) => n + 1)
    setSuggestDialogOpen(true)
  }, [draftLocation, draftFlow])

  const handleCloseAddDialog = useCallback(() => {
    setAddDialogOpen(false)
  }, [])

  const handleCloseSuggestDialog = useCallback(() => {
    setSuggestDialogOpen(false)
  }, [])

  const handleSuggestSubmitted = useCallback(() => {
    setDraftLocation(null)
    setDraftFlow(null)
    setSuggestPlacementMode(false)
  }, [])

  const handleCreateShelter = useCallback(
    async (payload: ShelterCreatePayload) => {
      const created = await createMutation.mutateAsync(payload)
      setDraftLocation(null)
      setDraftFlow(null)
      setPlacementMode(false)
      setSuggestPlacementMode(false)
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
    placementMode ||
    suggestPlacementMode ||
    (!!draftLocation &&
      draftFlow === 'cms' &&
      !addDialogOpen) ||
    (!!draftLocation &&
      draftFlow === 'suggest' &&
      !suggestDialogOpen)

  const cancelPlacementDisabled =
    mutations.cmsBusy ||
    (!(placementMode || (draftFlow === 'cms' && !!draftLocation)))

  const cancelSuggestDisabled =
    !(suggestPlacementMode || (draftFlow === 'suggest' && !!draftLocation))

  return {
    mapRef,
    addDialogNonce,
    suggestDialogNonce,
    draftFlow,
    selectedShelter,
    placementMode,
    suggestPlacementMode,
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
  }
}
