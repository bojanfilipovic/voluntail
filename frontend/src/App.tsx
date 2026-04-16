import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { fetchShelters, type Shelter } from './api/shelters'
import { ShelterDetailDialog } from './components/ShelterDetailDialog'
import { ShelterList } from './components/ShelterList'
import { ShelterMap, type ShelterMapHandle } from './components/ShelterMap'
import './App.css'

function toQueryError(error: unknown): Error | null {
  if (!error) return null
  if (error instanceof Error) return error
  return new Error(typeof error === 'string' ? error : 'Request failed')
}

function App() {
  const mapRef = useRef<ShelterMapHandle>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const { data, error, isPending } = useQuery({
    queryKey: ['shelters'],
    queryFn: fetchShelters,
  })

  const queryError = useMemo(() => toQueryError(error), [error])

  const selectedShelter = useMemo(() => {
    if (!selectedId || !data) return null
    return data.find((s) => s.id === selectedId) ?? null
  }, [data, selectedId])

  const clearSelection = useCallback(() => {
    setSelectedId(null)
  }, [])

  const handleMapSelect = useCallback((s: Shelter) => {
    setSelectedId(s.id)
  }, [])

  const handleListSelect = useCallback((s: Shelter) => {
    setSelectedId(s.id)
    mapRef.current?.flyToShelter(s)
  }, [])

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>Voluntail</h1>
        <p className="app-tagline">Discovery (dev shell)</p>
      </header>
      <main className="app-main">
        <div className="split">
          <section
            className="split-pane split-pane--map"
            aria-label="Map of shelters"
          >
            <ShelterMap
              ref={mapRef}
              shelters={data ?? []}
              selectedId={selectedId}
              onSelectShelter={handleMapSelect}
              onClearSelection={clearSelection}
            />
          </section>
          <section
            className="split-pane split-pane--directory"
            aria-label="Directory"
          >
            <ShelterList
              shelters={data}
              error={queryError}
              isPending={isPending}
              selectedId={selectedId}
              onSelectShelter={handleListSelect}
            />
          </section>
        </div>
      </main>
      <ShelterDetailDialog shelter={selectedShelter} onClose={clearSelection} />
    </div>
  )
}

export default App
