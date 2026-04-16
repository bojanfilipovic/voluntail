import { useEffect, useRef } from 'react'
import type { Shelter } from '../api/shelters'

type Props = {
  shelter: Shelter | null
  onClose: () => void
}

export function ShelterDetailDialog({ shelter, onClose }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (shelter) {
      if (!el.open) el.showModal()
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
      })
    } else if (el.open) {
      el.close()
    }
  }, [shelter])

  return (
    <dialog
      ref={dialogRef}
      className="shelter-dialog"
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby={shelter ? 'shelter-dialog-title' : undefined}
    >
      {shelter ? (
        <>
          <div className="shelter-dialog-hero">
            {shelter.imageUrl ? (
              <img
                src={shelter.imageUrl}
                alt=""
                className="shelter-dialog-hero-img"
                loading="lazy"
              />
            ) : (
              <div className="shelter-dialog-hero-placeholder" aria-hidden />
            )}
          </div>
          <header className="shelter-dialog-header">
            <h2 id="shelter-dialog-title">{shelter.name}</h2>
            <form method="dialog">
              <button
                ref={closeButtonRef}
                type="submit"
                className="shelter-dialog-close"
                aria-label="Close"
              >
                ×
              </button>
            </form>
          </header>
          <div className="shelter-dialog-body">
            <p className="shelter-dialog-meta">
              {shelter.registryTag} · {shelter.species.length ? shelter.species.join(', ') : '—'}
            </p>
            <p className="shelter-dialog-lead">
              Most shelters need volunteers, adopters, and foster homes—reach out via the links
              below when you are ready.
            </p>
            <p className="shelter-dialog-desc">{shelter.description}</p>
            <div className="shelter-dialog-actions">
              {shelter.signupUrl ? (
                <a
                  className="shelter-dialog-cta shelter-dialog-cta--primary"
                  href={shelter.signupUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Volunteer / signup
                </a>
              ) : null}
              {shelter.donationUrl ? (
                <a
                  className="shelter-dialog-cta shelter-dialog-cta--secondary"
                  href={shelter.donationUrl}
                  rel="noreferrer noopener"
                  target="_blank"
                >
                  Donate
                </a>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </dialog>
  )
}
