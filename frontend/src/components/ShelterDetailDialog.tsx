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
              {shelter.registryTag} · {shelter.species.join(', ')}
            </p>
            <p className="shelter-dialog-desc">{shelter.description}</p>
            {shelter.signupUrl ? (
              <p className="shelter-dialog-links">
                <a href={shelter.signupUrl} rel="noreferrer noopener" target="_blank">
                  Signup / volunteer
                </a>
              </p>
            ) : null}
          </div>
        </>
      ) : null}
    </dialog>
  )
}
