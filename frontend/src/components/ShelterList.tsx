import { useQuery } from '@tanstack/react-query'
import { fetchShelters } from '../api/shelters'

export function ShelterList() {
  const { data, error, isPending } = useQuery({
    queryKey: ['shelters'],
    queryFn: fetchShelters,
  })

  return (
    <section className="shelters-preview" aria-labelledby="shelters-heading">
      <h2 id="shelters-heading">Shelters</h2>
      <p className="shelters-hint">
        Run the Ktor backend on <code>:8080</code>; this page loads{' '}
        <code>/api/shelters</code> via the Vite dev proxy.
      </p>
      {error ? (
        <p className="shelters-error" role="alert">
          {error instanceof Error ? error.message : 'Request failed'}
        </p>
      ) : isPending ? (
        <p>Loading shelters…</p>
      ) : (
        <ul className="shelters-list">
          {(data ?? []).map((s) => (
            <li key={s.id}>
              <strong>{s.name}</strong>{' '}
              <span className="shelters-meta">
                ({s.registryTag}) · {s.latitude.toFixed(4)},{' '}
                {s.longitude.toFixed(4)}
              </span>
              <div className="shelters-desc">{s.description}</div>
              {s.signupUrl ? <a href={s.signupUrl}>Signup link</a> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
