import { useMutation } from '@tanstack/react-query'
import { type FormEvent, useEffect, useState } from 'react'
import { postSuggestion } from '@/api/suggestions'
import {
  shelterFormDialogContentClassName,
  shelterFormDialogHeaderClassName,
  shelterFormFooterClassName,
  shelterFormScrollAreaClassName,
} from '@/components/shelters/ShelterDialogChrome'
import { DraftPositionInputs } from '@/components/shelters/DraftPositionInputs'
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
import {
  buildSuggestShelterMessage,
  type SuggestShelterSpeciesTag,
} from '@/domain/buildSuggestShelterMessage'
import {
  SUGGESTION_MAX_CONTACT_LENGTH,
  SUGGESTION_MAX_MESSAGE_LENGTH,
} from '@/domain/feedbackLimits'
import { parseValidatedCoords } from '@/domain/coordinates'
import { PartyPopper } from 'lucide-react'

const SPECIES_ORDER: SuggestShelterSpeciesTag[] = [
  'dog',
  'cat',
  'rabbit',
  'reptile',
  'other',
]

const SPECIES_LABEL: Record<SuggestShelterSpeciesTag, string> = {
  dog: 'Dog',
  cat: 'Cat',
  rabbit: 'Rabbit',
  reptile: 'Reptile',
  other: 'Other',
}

type Props = {
  open: boolean
  draftLocation: MapCenter | null
  onClose: () => void
  /** Clears map draft in parent after a successful submit (dialog may stay open on thanks). */
  onSubmitted: () => void
}

export function SuggestShelterDialog({
  open,
  draftLocation,
  onClose,
  onSubmitted,
}: Props) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [city, setCity] = useState('')
  const [signupUrl, setSignupUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [donationUrl, setDonationUrl] = useState('')
  const [comment, setComment] = useState('')
  const [contact, setContact] = useState('')
  const [otherSpeciesDetail, setOtherSpeciesDetail] = useState('')
  const [species, setSpecies] = useState<Partial<Record<SuggestShelterSpeciesTag, boolean>>>(
    {},
  )
  const [formError, setFormError] = useState<string | null>(null)
  const [showThanks, setShowThanks] = useState(false)

  const mutation = useMutation({
    mutationFn: postSuggestion,
    onSuccess: () => {
      setShowThanks(true)
      onSubmitted()
      setName('')
      setDescription('')
      setCity('')
      setSignupUrl('')
      setImageUrl('')
      setDonationUrl('')
      setComment('')
      setContact('')
      setOtherSpeciesDetail('')
      setSpecies({})
    },
  })

  useEffect(() => {
    if (!open) {
      mutation.reset()
      setShowThanks(false)
      setFormError(null)
    }
  }, [open])

  const toggleSpecies = (tag: SuggestShelterSpeciesTag) => {
    setSpecies((prev) => ({ ...prev, [tag]: !prev[tag] }))
    mutation.reset()
    setFormError(null)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      onClose()
    }
  }

  const trimmedName = name.trim()
  const submitDisabled =
    mutation.isPending || trimmedName.length === 0 || !draftLocation

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)
    if (!draftLocation || trimmedName.length === 0) return

    const form = event.currentTarget
    const fd = new FormData(form)
    const latStr = String(fd.get('latitude') ?? '')
    const lonStr = String(fd.get('longitude') ?? '')
    const coords = parseValidatedCoords(latStr, lonStr)
    if (!coords.ok) {
      setFormError(coords.error)
      return
    }

    const message = buildSuggestShelterMessage({
      name: trimmedName,
      description,
      city,
      signupUrl,
      imageUrl,
      donationUrl,
      species,
      otherSpeciesDetail,
      comment,
      latitude: coords.latitude,
      longitude: coords.longitude,
    })

    if (message.length > SUGGESTION_MAX_MESSAGE_LENGTH) {
      setFormError(
        `Suggestion text is too long (${message.length.toLocaleString()} / ${SUGGESTION_MAX_MESSAGE_LENGTH.toLocaleString()}). Remove optional details and try again.`,
      )
      return
    }

    const contactTrim = contact.trim()
    mutation.mutate({
      message,
      contact: contactTrim || undefined,
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className={shelterFormDialogContentClassName}>
        <DialogHeader className={shelterFormDialogHeaderClassName}>
          <DialogTitle>Suggest shelter</DialogTitle>
        </DialogHeader>
        {showThanks ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4 py-4">
            <div
              role="status"
              aria-live="polite"
              className="animate-in fade-in zoom-in-95 flex items-start gap-3 rounded-lg border border-emerald-500/45 bg-emerald-500/15 px-3 py-3 duration-300 dark:border-emerald-400/40 dark:bg-emerald-500/10"
            >
              <PartyPopper
                className="size-5 shrink-0 text-emerald-700 dark:text-emerald-400"
                aria-hidden
              />
              <p className="font-semibold leading-snug text-emerald-950 dark:text-emerald-50">
                Thanks — we received your suggestion.
              </p>
            </div>
            <DialogFooter className={shelterFormFooterClassName}>
              <Button type="button" onClick={() => onClose()}>
                Close
              </Button>
            </DialogFooter>
          </div>
        ) : draftLocation ? (
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={handleSubmit}
          >
            <div className={shelterFormScrollAreaClassName}>
              <div className="space-y-4">
                {formError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {formError}
                  </p>
                ) : null}
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-name">
                    Shelter name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="suggest-name"
                    name="name"
                    autoComplete="organization"
                    required
                    aria-required
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      mutation.reset()
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-description">Description</Label>
                  <Textarea
                    id="suggest-description"
                    name="description"
                    rows={3}
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value)
                      mutation.reset()
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-city">City</Label>
                  <Input
                    id="suggest-city"
                    name="city"
                    autoComplete="address-level2"
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value)
                      mutation.reset()
                    }}
                  />
                </div>
                <fieldset className="space-y-2">
                  <legend className="text-foreground mb-1.5 text-sm font-medium">
                    Species (optional)
                  </legend>
                  <div className="flex flex-col gap-2">
                    {SPECIES_ORDER.map((tag) => (
                      <label
                        key={tag}
                        htmlFor={`suggest-species-${tag}`}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          id={`suggest-species-${tag}`}
                          type="checkbox"
                          checked={Boolean(species[tag])}
                          onChange={() => toggleSpecies(tag)}
                          className="border-input accent-primary size-4 rounded"
                        />
                        <span>{SPECIES_LABEL[tag]}</span>
                      </label>
                    ))}
                  </div>
                  {species.other ? (
                    <div className="space-y-1.5 pt-1">
                      <Label htmlFor="suggest-species-other-detail">Other (optional)</Label>
                      <Input
                        id="suggest-species-other-detail"
                        name="otherSpeciesDetail"
                        value={otherSpeciesDetail}
                        onChange={(e) => {
                          setOtherSpeciesDetail(e.target.value)
                          mutation.reset()
                        }}
                      />
                    </div>
                  ) : null}
                </fieldset>
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-signup">Signup URL</Label>
                  <Input
                    id="suggest-signup"
                    name="signupUrl"
                    inputMode="url"
                    value={signupUrl}
                    onChange={(e) => {
                      setSignupUrl(e.target.value)
                      mutation.reset()
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-image">Image URL</Label>
                  <Input
                    id="suggest-image"
                    name="imageUrl"
                    inputMode="url"
                    value={imageUrl}
                    onChange={(e) => {
                      setImageUrl(e.target.value)
                      mutation.reset()
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-donate">Donation URL</Label>
                  <Input
                    id="suggest-donate"
                    name="donationUrl"
                    inputMode="url"
                    value={donationUrl}
                    onChange={(e) => {
                      setDonationUrl(e.target.value)
                      mutation.reset()
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-comment">Comment</Label>
                  <Textarea
                    id="suggest-comment"
                    name="comment"
                    rows={2}
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value)
                      mutation.reset()
                    }}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="suggest-contact">Contact</Label>
                  <Input
                    id="suggest-contact"
                    name="contact"
                    type="text"
                    autoComplete="off"
                    value={contact}
                    onChange={(e) => {
                      setContact(e.target.value)
                      mutation.reset()
                    }}
                    maxLength={SUGGESTION_MAX_CONTACT_LENGTH}
                  />
                  <p className="text-muted-foreground text-xs">
                    {contact.length.toLocaleString()} /{' '}
                    {SUGGESTION_MAX_CONTACT_LENGTH.toLocaleString()} characters
                  </p>
                </div>
                <DraftPositionInputs
                  key={`${draftLocation.latitude},${draftLocation.longitude}`}
                  idPrefix="suggest"
                  draftLocation={draftLocation}
                />
                {mutation.isError ? (
                  <p className="text-destructive text-sm" role="alert">
                    {mutation.error instanceof Error
                      ? mutation.error.message
                      : 'Something went wrong.'}
                  </p>
                ) : null}
              </div>
            </div>
            <DialogFooter className={shelterFormFooterClassName}>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitDisabled}>
                {mutation.isPending ? 'Sending…' : 'Send suggestion'}
              </Button>
            </DialogFooter>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
