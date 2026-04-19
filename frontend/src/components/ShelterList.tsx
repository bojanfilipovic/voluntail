import type { Shelter } from '../api/shelters'

type Props = {
  shelters: Shelter[] | undefined
  error: Error | null
  isPending: boolean
  selectedId: string | null
  onSelectShelter: (s: Shelter) => void
}

function speciesLine(s: Shelter): string {
  return s.species.length ? s.species.join(' · ') : '—'
}

export function ShelterList({
  shelters,
  error,
  isPending,
  selectedId,
  onSelectShelter,
}: Props) {
  return (
    <section className="shelters-preview" aria-labelledby="shelters-heading">
      <h2 id="shelters-heading">Shelters</h2>
      <p className="shelters-hint">
        Run the Ktor backend on <code>:8080</code>; this page loads{' '}
        <code>/api/shelters</code> via the Vite dev proxy.
      </p>
      {error ? (
        <p className="shelters-error" role="alert">
          {error.message}
        </p>
      ) : isPending ? (
        <p>Loading shelters…</p>
      ) : (
        <ul className="shelters-list">
          {(shelters ?? []).map((s) => (
            <li key={s.id}>
              <button
                type="button"
                className={`shelter-row${s.id === selectedId ? ' shelter-row--selected' : ''}`}
                onClick={() => onSelectShelter(s)}
              >
                <span className="shelter-row-grid">
                  {s.imageUrl ? (
                    <span className="shelter-row-thumb-wrap">
                      <img
                        src={s.imageUrl}
                        alt=""
                        className="shelter-row-thumb"
                        loading="lazy"
                      />
                    </span>
                  ) : (
                    <span className="shelter-row-thumb-wrap shelter-row-thumb-wrap--empty" aria-hidden />
                  )}
                  <span className="shelter-row-text">
                    <span className="shelter-row-title">
                      <strong>{s.name}</strong>
                    </span>
                    <span className="shelters-species">{speciesLine(s)}</span>
                    <span className="shelters-desc">{s.description}</span>
                    {s.signupUrl ? (
                      <span className="shelters-link-wrap">
                        <a
                          href={s.signupUrl}
                          onClick={(e) => e.stopPropagation()}
                          rel="noreferrer noopener"
                          target="_blank"
                        >
                          Signup link
                        </a>
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
