import { useState, type FormEvent } from 'react'
import type { Animal } from '@/api/animals'
import type { Shelter } from '@/api/shelters'
import {
  shelterFormDialogContentClassName,
  shelterFormDialogHeaderClassName,
  shelterFormFooterClassName,
  shelterFormScrollAreaClassName,
} from '@/components/shelters/ShelterDialogChrome'
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
import { SPECIES_VALUES, speciesLabel, type ShelterSpecies } from '@/domain/species'
import type { AnimalPatchPayload } from '@/schemas/animals'
import type { AnimalStatus } from '@/schemas/animals'
import { toQueryError } from '@/lib/queryError'

type Props = {
  animal: Animal | null
  shelters: Shelter[]
  open: boolean
  onClose: () => void
  onSubmit: (id: string, body: AnimalPatchPayload) => Promise<unknown>
  isSubmitting: boolean
}

const STATUSES: AnimalStatus[] = ['available', 'reserved', 'adopted']

type FormProps = {
  animal: Animal
  shelters: Shelter[]
  onSubmit: (id: string, body: AnimalPatchPayload) => Promise<unknown>
  onClose: () => void
  isSubmitting: boolean
}

function EditAnimalForm({
  animal,
  shelters,
  onSubmit,
  onClose,
  isSubmitting,
}: FormProps) {
  const [shelterId, setShelterId] = useState(animal.shelterId)
  const [name, setName] = useState(animal.name)
  const [description, setDescription] = useState(animal.description)
  const [species, setSpecies] = useState<ShelterSpecies>(animal.species)
  const [status, setStatus] = useState<AnimalStatus>(animal.status)
  const [published, setPublished] = useState(animal.published)
  const [imageUrl, setImageUrl] = useState(animal.imageUrl ?? '')
  const [externalUrl, setExternalUrl] = useState(animal.externalUrl ?? '')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!shelterId.trim()) {
      setFormError('Choose a shelter.')
      return
    }
    const payload: AnimalPatchPayload = {
      shelterId: shelterId.trim(),
      name: name.trim(),
      description: description.trim(),
      species,
      status,
      published,
      imageUrl: imageUrl.trim(),
      externalUrl: externalUrl.trim(),
    }
    try {
      await onSubmit(animal.id, payload)
      onClose()
    } catch (err) {
      setFormError(
        toQueryError(err)?.message ?? 'Could not save changes. Check that the API is running.',
      )
    }
  }

  return (
    <>
      <DialogHeader className={shelterFormDialogHeaderClassName}>
        <DialogTitle>Edit animal</DialogTitle>
      </DialogHeader>
      <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit}>
        <div className={shelterFormScrollAreaClassName}>
          <div className="space-y-4">
            {formError ? (
              <p className="text-destructive text-sm" role="alert">
                {formError}
              </p>
            ) : null}
            <div className="space-y-1.5">
              <Label htmlFor="edit-animal-shelter">Shelter</Label>
              <select
                id="edit-animal-shelter"
                className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                value={shelterId}
                onChange={(e) => setShelterId(e.target.value)}
                required
              >
                {shelters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.city})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-animal-name">Name</Label>
              <Input
                id="edit-animal-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-animal-desc">Description</Label>
              <Textarea
                id="edit-animal-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="edit-animal-species">Species</Label>
                <select
                  id="edit-animal-species"
                  className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  value={species}
                  onChange={(e) => setSpecies(e.target.value as ShelterSpecies)}
                >
                  {SPECIES_VALUES.map((sp) => (
                    <option key={sp} value={sp}>
                      {speciesLabel(sp)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-animal-status">Status</Label>
                <select
                  id="edit-animal-status"
                  className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 text-sm focus-visible:ring-2 focus-visible:outline-none"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as AnimalStatus)}
                >
                  {STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="size-4 rounded border"
              />
              Published
            </label>
            <div className="space-y-1.5">
              <Label htmlFor="edit-animal-image">Image URL</Label>
              <Input
                id="edit-animal-image"
                inputMode="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-animal-ext">External URL</Label>
              <Input
                id="edit-animal-ext"
                inputMode="url"
                value={externalUrl}
                onChange={(e) => setExternalUrl(e.target.value)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className={shelterFormFooterClassName}>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </DialogFooter>
      </form>
    </>
  )
}

export function EditAnimalDialog({
  animal,
  shelters,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={shelterFormDialogContentClassName}>
        {open && animal ? (
          <EditAnimalForm
            key={animal.id}
            animal={animal}
            shelters={shelters}
            onSubmit={onSubmit}
            onClose={onClose}
            isSubmitting={isSubmitting}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
