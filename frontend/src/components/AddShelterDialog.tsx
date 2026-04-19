import { useEffect, useState, type FormEvent } from 'react'
import type { Shelter, ShelterCreatePayload } from '@/api/shelters'
import {
  shelterFormDialogContentClassName,
  shelterFormDialogHeaderClassName,
  shelterFormFooterClassName,
  shelterFormScrollAreaClassName,
} from '@/components/shelters/ShelterDialogChrome'
import { ShelterSpeciesFieldset } from '@/components/shelters/ShelterSpeciesFieldset'
import type { MapCenter } from '@/components/ShelterMap'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { parseValidatedCoords } from '@/domain/coordinates'
import { sortShelterSpecies, type ShelterSpecies } from '@/domain/species'
import { toQueryError } from '@/lib/queryError'

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

const DEFAULT_SIGNUP_URL = 'https://example.com/signup'
const DEFAULT_IMAGE_URL =
  'https://picsum.photos/seed/voluntail-default/800/450'
const DEFAULT_DONATION_URL = 'https://example.com/donate'

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
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [speciesPicked, setSpeciesPicked] = useState<ShelterSpecies[]>([])
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

  /* Keep coordinate fields in sync when the draft pin moves on the map */
  useEffect(() => {
    if (!draftLocation || !open) return
    /* eslint-disable react-hooks/set-state-in-effect -- intentional sync from map draft */
    setLatitude(String(draftLocation.latitude))
    setLongitude(String(draftLocation.longitude))
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [draftLocation, open])

  const toggleSpecies = (sp: ShelterSpecies) => {
    setSpeciesPicked((prev) =>
      prev.includes(sp) ? prev.filter((x) => x !== sp) : [...prev, sp],
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const coords = parseValidatedCoords(latitude, longitude)
    if (!coords.ok) {
      setFormError(coords.error)
      return
    }
    const nameFinal = name.trim() || DEFAULT_NAME
    const descFinal = description.trim() || DEFAULT_DESCRIPTION
    const payload: ShelterCreatePayload = {
      name: nameFinal,
      description: descFinal,
      latitude: coords.latitude,
      longitude: coords.longitude,
      species: sortShelterSpecies(speciesPicked),
      signupUrl: urlOrDefault(signupUrl, DEFAULT_SIGNUP_URL),
      imageUrl: urlOrDefault(imageUrl, DEFAULT_IMAGE_URL),
      donationUrl: urlOrDefault(donationUrl, DEFAULT_DONATION_URL),
    }
    try {
      await onSubmit(payload)
    } catch (e) {
      setFormError(
        toQueryError(e)?.message ?? 'Could not save shelter. Check that the API is running.',
      )
    }
  }

  const showForm = open && !!draftLocation

  return (
    <Dialog open={showForm} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={shelterFormDialogContentClassName}>
        <DialogHeader className={shelterFormDialogHeaderClassName}>
          <DialogTitle>Add shelter</DialogTitle>
        </DialogHeader>
        {draftLocation ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit}
          >
            <div className={shelterFormScrollAreaClassName}>
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Location is set on the map (adjust numbers below). Empty text uses sample
                  name/description; empty URLs use placeholder links unless you paste your own.
                </p>
                {formError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="add-name">Name</Label>
                  <Input
                    id="add-name"
                    name="name"
                    autoComplete="organization"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={DEFAULT_NAME}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-description">Description</Label>
                  <Textarea
                    id="add-description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={DEFAULT_DESCRIPTION}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="add-lat">Latitude</Label>
                    <Input
                      id="add-lat"
                      name="latitude"
                      inputMode="decimal"
                      required
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="add-lng">Longitude</Label>
                    <Input
                      id="add-lng"
                      name="longitude"
                      inputMode="decimal"
                      required
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                    />
                  </div>
                </div>
                <ShelterSpeciesFieldset
                  idPrefix="add"
                  selected={speciesPicked}
                  onToggle={toggleSpecies}
                />
                <div className="space-y-1.5">
                  <Label htmlFor="add-signup">Signup URL</Label>
                  <Input
                    id="add-signup"
                    name="signupUrl"
                    inputMode="url"
                    value={signupUrl}
                    onChange={(e) => setSignupUrl(e.target.value)}
                    placeholder={`Blank → ${DEFAULT_SIGNUP_URL}`}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-image">Image URL</Label>
                  <Input
                    id="add-image"
                    name="imageUrl"
                    inputMode="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Blank → picsum placeholder"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="add-donate">Donation URL</Label>
                  <Input
                    id="add-donate"
                    name="donationUrl"
                    inputMode="url"
                    value={donationUrl}
                    onChange={(e) => setDonationUrl(e.target.value)}
                    placeholder={`Blank → ${DEFAULT_DONATION_URL}`}
                  />
                </div>
              </div>
            </div>
            <DialogFooter className={shelterFormFooterClassName}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save shelter'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
