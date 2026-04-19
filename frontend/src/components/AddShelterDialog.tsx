import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { Shelter, ShelterCreatePayload } from '../api/shelters'
import type { MapCenter } from './ShelterMap'

type Props = {
  open: boolean
  draftLocation: MapCenter | null
  onClose: () => void
  onSubmit: (payload: ShelterCreatePayload) => Promise<Shelter>
  isSubmitting: boolean
}

const DEFAULT_NAME = 'New shelter'
const DEFAULT_DESCRIPTION =
  'Placeholder from the map. Edit in Supabase or here before saving.'

/** Stub outbound URLs when fields are left blank (quick testing; override by typing). */
const DEFAULT_SIGNUP_URL = 'https://example.com/signup'
const DEFAULT_IMAGE_URL =
  'https://picsum.photos/seed/voluntail-default/800/450'
const DEFAULT_DONATION_URL = 'https://example.com/donate'

function parseSpecies(raw: string): string[] {
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function urlOrDefault(raw: string, fallback: string): string {
  const t = raw.trim()
  return t || fallback
}

export function AddShelterDialog({
  open,
  draftLocation,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [speciesRaw, setSpeciesRaw] = useState('')
  const [latitude, setLatitude] = useState(() =>
    draftLocation ? String(draftLocation.latitude) : '',
  )
  const [longitude, setLongitude] = useState(() =>
    draftLocation ? String(draftLocation.longitude) : '',
  )
  const [signupUrl, setSignupUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [donationUrl, setDonationUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    if (open && draftLocation) {
      if (!el.open) el.showModal()
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus()
      })
    } else if (el.open) {
      el.close()
    }
  }, [open, draftLocation])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const lat = Number(latitude)
    const lng = Number(longitude)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      setFormError('Latitude and longitude must be valid numbers.')
      return
    }
    if (Math.abs(lat) > 90 || Math.abs(lng) > 180) {
      setFormError('Coordinates out of range.')
      return
    }
    const nameFinal = name.trim() || DEFAULT_NAME
    const descFinal = description.trim() || DEFAULT_DESCRIPTION
    const payload: ShelterCreatePayload = {
      name: nameFinal,
      description: descFinal,
      latitude: lat,
      longitude: lng,
      species: parseSpecies(speciesRaw),
      signupUrl: urlOrDefault(signupUrl, DEFAULT_SIGNUP_URL),
      imageUrl: urlOrDefault(imageUrl, DEFAULT_IMAGE_URL),
      donationUrl: urlOrDefault(donationUrl, DEFAULT_DONATION_URL),
    }
    try {
      await onSubmit(payload)
    } catch {
      /* parent surfaces cmsError */
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="shelter-dialog add-shelter-dialog"
      onClose={onClose}
      onCancel={onClose}
      aria-labelledby="add-shelter-dialog-title"
    >
      {open && draftLocation ? (
        <div className="add-shelter-dialog-inner">
          <header className="shelter-dialog-header add-shelter-dialog-header">
            <h2 id="add-shelter-dialog-title">Add shelter</h2>
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
          <div className="add-shelter-dialog-scroll">
          <form className="add-shelter-form" onSubmit={handleSubmit}>
            <p className="add-shelter-lead">
              Location is set on the map (you can adjust numbers below). Empty
              text uses sample name/description; empty URLs use placeholder links
              (example.com / picsum) unless you paste your own.
            </p>
            {formError ? (
              <p className="add-shelter-error" role="alert">
                {formError}
              </p>
            ) : null}
            <label className="add-shelter-field">
              <span>Name</span>
              <input
                type="text"
                name="name"
                autoComplete="organization"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={DEFAULT_NAME}
              />
            </label>
            <label className="add-shelter-field">
              <span>Description</span>
              <textarea
                name="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={DEFAULT_DESCRIPTION}
              />
            </label>
            <div className="add-shelter-row">
              <label className="add-shelter-field">
                <span>Latitude</span>
                <input
                  type="text"
                  name="latitude"
                  inputMode="decimal"
                  required
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                />
              </label>
              <label className="add-shelter-field">
                <span>Longitude</span>
                <input
                  type="text"
                  name="longitude"
                  inputMode="decimal"
                  required
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                />
              </label>
            </div>
            <label className="add-shelter-field">
              <span>Species (comma-separated)</span>
              <input
                type="text"
                name="species"
                value={speciesRaw}
                onChange={(e) => setSpeciesRaw(e.target.value)}
                placeholder="dog, cat"
              />
            </label>
            <label className="add-shelter-field">
              <span>Signup URL</span>
              <input
                type="url"
                name="signupUrl"
                value={signupUrl}
                onChange={(e) => setSignupUrl(e.target.value)}
                placeholder={`Blank → ${DEFAULT_SIGNUP_URL}`}
              />
            </label>
            <label className="add-shelter-field">
              <span>Image URL</span>
              <input
                type="url"
                name="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder={`Blank → picsum placeholder`}
              />
            </label>
            <label className="add-shelter-field">
              <span>Donation URL</span>
              <input
                type="url"
                name="donationUrl"
                value={donationUrl}
                onChange={(e) => setDonationUrl(e.target.value)}
                placeholder={`Blank → ${DEFAULT_DONATION_URL}`}
              />
            </label>
            <div className="add-shelter-actions">
              <button
                type="button"
                className="map-cms-btn"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="map-cms-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving…' : 'Save shelter'}
              </button>
            </div>
          </form>
          </div>
        </div>
      ) : null}
    </dialog>
  )
}
