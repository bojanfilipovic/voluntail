import { useEffect, useState, type FormEvent } from 'react'
import type { Shelter } from '@/api/shelters'
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
import {
  SPECIES_VALUES,
  sortShelterSpecies,
  speciesLabel,
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!shelter) return
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
    const payload: ShelterPatchPayload = {
      name: name.trim(),
      description: description.trim(),
      latitude: lat,
      longitude: lng,
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
      <DialogContent className="flex max-h-[min(92vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-5 pt-6 sm:p-6">
        <DialogHeader className="border-border shrink-0 border-b pb-4 pr-10">
          <DialogTitle>Edit shelter</DialogTitle>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 [-webkit-overflow-scrolling:touch]">
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
              <fieldset className="space-y-2">
                <legend className="text-foreground mb-1.5 text-sm font-medium">
                  Species
                </legend>
                <div className="flex flex-col gap-2">
                  {SPECIES_VALUES.map((sp) => (
                    <label
                      key={sp}
                      htmlFor={`edit-species-${sp}`}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <input
                        id={`edit-species-${sp}`}
                        type="checkbox"
                        name="species"
                        checked={speciesPicked.includes(sp)}
                        onChange={() =>
                          setSpeciesPicked((prev) =>
                            prev.includes(sp)
                              ? prev.filter((x) => x !== sp)
                              : [...prev, sp],
                          )
                        }
                        className="border-input accent-primary size-4 rounded"
                      />
                      <span>{speciesLabel(sp)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
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
          <DialogFooter className="border-border mt-2 shrink-0 rounded-b-xl border-t bg-muted/50 px-0 py-5 sm:justify-end">
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
