import { useState, type FormEvent } from 'react'
import type { Animal, AnimalCreatePayload } from '@/api/animals'
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
import { toQueryError } from '@/lib/queryError'
import type { AnimalStatus } from '@/schemas/animals'

type Props = {
  open: boolean
  shelters: Shelter[]
  onClose: () => void
  onSubmit: (payload: AnimalCreatePayload) => Promise<Animal>
  isSubmitting: boolean
}

const STATUSES: AnimalStatus[] = ['available', 'reserved', 'adopted']

export function AddAnimalDialog({
  open,
  shelters,
  onClose,
  onSubmit,
  isSubmitting,
}: Props) {
  const [shelterId, setShelterId] = useState('')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [species, setSpecies] = useState<ShelterSpecies>('dog')
  const [status, setStatus] = useState<AnimalStatus>('available')
  const [published, setPublished] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!shelterId.trim()) {
      setFormError('Choose a shelter.')
      return
    }
    const payload: AnimalCreatePayload = {
      shelterId: shelterId.trim(),
      name: name.trim() || 'Unnamed',
      description: description.trim(),
      species,
      status,
      published,
      imageUrl: imageUrl.trim() || null,
      externalUrl: externalUrl.trim() || null,
    }
    try {
      await onSubmit(payload)
      onClose()
    } catch (err) {
      setFormError(
        toQueryError(err)?.message ?? 'Could not create animal. Is the API running?',
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className={shelterFormDialogContentClassName}>
        <DialogHeader className={shelterFormDialogHeaderClassName}>
          <DialogTitle>Add animal</DialogTitle>
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
                <Label htmlFor="animal-shelter">Shelter</Label>
                <select
                  id="animal-shelter"
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  value={shelterId}
                  onChange={(e) => setShelterId(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Select shelter…
                  </option>
                  {shelters.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.city})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="animal-name">Name</Label>
                <Input
                  id="animal-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="animal-desc">Description</Label>
                <Textarea
                  id="animal-desc"
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="animal-species">Species</Label>
                  <select
                    id="animal-species"
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
                  <Label htmlFor="animal-status">Status</Label>
                  <select
                    id="animal-status"
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
                Published (visible on public discovery)
              </label>
              <div className="space-y-1.5">
                <Label htmlFor="animal-image">Image URL</Label>
                <Input
                  id="animal-image"
                  inputMode="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="animal-ext">External URL</Label>
                <Input
                  id="animal-ext"
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
              {isSubmitting ? 'Saving…' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
