import { useEffect, useState, type FormEvent } from 'react'
import type { Shelter } from '@/api/shelters'
import {
  shelterFormDialogContentClassName,
  shelterFormDialogHeaderClassName,
  shelterFormFooterClassName,
  shelterFormScrollAreaClassName,
} from '@/components/shelters/ShelterDialogChrome'
import { ShelterSpeciesFieldset } from '@/components/shelters/ShelterSpeciesFieldset'
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
import {
  sortShelterSpecies,
  type ShelterSpecies,
} from '@/domain/species'
import type { ShelterPatchPayload } from '@/schemas/shelters'

type Props = {
  shelter: Shelter | null
  open: boolean
  onClose: () => void
  onSubmit: (id: string, body: ShelterPatchPayload) => Promise<unknown>
  isSubmitting: boolean
}

export function EditShelterDialog({
  shelter,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [speciesPicked, setSpeciesPicked] = useState<ShelterSpecies[]>([])
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [signupUrl, setSignupUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [donationUrl, setDonationUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (!shelter || !open) return
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate form when dialog opens */
    setName(shelter.name)
    setDescription(shelter.description)
    setSpeciesPicked([...shelter.species])
    setLatitude(String(shelter.latitude))
    setLongitude(String(shelter.longitude))
    setSignupUrl(shelter.signupUrl ?? '')
    setImageUrl(shelter.imageUrl ?? '')
    setDonationUrl(shelter.donationUrl ?? '')
    setFormError(null)
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [shelter, open])

  const toggleSpecies = (sp: ShelterSpecies) => {
    setSpeciesPicked((prev) =>
      prev.includes(sp) ? prev.filter((x) => x !== sp) : [...prev, sp],
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!shelter) return
    setFormError(null)
    const coords = parseValidatedCoords(latitude, longitude)
    if (!coords.ok) {
      setFormError(coords.error)
      return
    }
    const payload: ShelterPatchPayload = {
      name: name.trim(),
      description: description.trim(),
      latitude: coords.latitude,
      longitude: coords.longitude,
      species: sortShelterSpecies(speciesPicked),
      signupUrl: signupUrl.trim(),
      imageUrl: imageUrl.trim(),
      donationUrl: donationUrl.trim(),
    }
    try {
      await onSubmit(shelter.id, payload)
      onClose()
    } catch {
      /* parent surfaces cmsError */
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={shelterFormDialogContentClassName}>
        <DialogHeader className={shelterFormDialogHeaderClassName}>
          <DialogTitle>Edit shelter</DialogTitle>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className={shelterFormScrollAreaClassName}>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Changes are saved to the API. Empty URL fields clear the link.
              </p>
              {formError ? (
                <p className="text-destructive text-sm" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  autoComplete="organization"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  name="description"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-lat">Latitude</Label>
                  <Input
                    id="edit-lat"
                    name="latitude"
                    inputMode="decimal"
                    required
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-lng">Longitude</Label>
                  <Input
                    id="edit-lng"
                    name="longitude"
                    inputMode="decimal"
                    required
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
              <ShelterSpeciesFieldset
                idPrefix="edit"
                selected={speciesPicked}
                onToggle={toggleSpecies}
              />
              <div className="space-y-1.5">
                <Label htmlFor="edit-signup">Signup URL</Label>
                <Input
                  id="edit-signup"
                  name="signupUrl"
                  inputMode="url"
                  value={signupUrl}
                  onChange={(e) => setSignupUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-image">Image URL</Label>
                <Input
                  id="edit-image"
                  name="imageUrl"
                  inputMode="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-donate">Donation URL</Label>
                <Input
                  id="edit-donate"
                  name="donationUrl"
                  inputMode="url"
                  value={donationUrl}
                  onChange={(e) => setDonationUrl(e.target.value)}
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
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
