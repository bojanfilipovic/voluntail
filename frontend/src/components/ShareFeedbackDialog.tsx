import { useMutation } from '@tanstack/react-query'
import { type FormEvent, useState } from 'react'
import { postSuggestion } from '@/api/suggestions'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { PartyPopper } from 'lucide-react'

const MAX_MESSAGE_LENGTH = 8000

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareFeedbackDialog({ open, onOpenChange }: Props) {
  const [message, setMessage] = useState('')
  const mutation = useMutation({
    mutationFn: postSuggestion,
    onSuccess: () => setMessage(''),
  })

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setMessage('')
      mutation.reset()
    }
    onOpenChange(next)
  }

  const trimmed = message.trim()
  const tooLong = message.length > MAX_MESSAGE_LENGTH
  const submitDisabled =
    mutation.isPending || trimmed.length === 0 || tooLong

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitDisabled) return
    mutation.mutate(trimmed)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,calc(100dvh-2rem))] w-[calc(100vw-2rem)] max-w-lg flex-col gap-0 overflow-hidden p-5 pt-6 sm:p-6">
        <DialogHeader className="border-border shrink-0 border-b pb-4 pr-10">
          <DialogTitle>Pilot feedback</DialogTitle>
          <DialogDescription>
            Share what works, what doesn&apos;t, and what you&apos;d like next.
          </DialogDescription>
        </DialogHeader>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={handleSubmit}
        >
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4 [-webkit-overflow-scrolling:touch]">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="peer-feedback-modal-message">Your message</Label>
                <Textarea
                  id="peer-feedback-modal-message"
                  name="message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    mutation.reset()
                  }}
                  placeholder="Your thoughts…"
                  rows={5}
                  maxLength={MAX_MESSAGE_LENGTH}
                  aria-invalid={tooLong || undefined}
                  aria-describedby={
                    tooLong ? 'peer-feedback-modal-too-long' : 'peer-feedback-modal-counter'
                  }
                  className="min-h-[120px] resize-y"
                />
              </div>
              {tooLong ? (
                <p id="peer-feedback-modal-too-long" className="text-destructive text-xs" role="alert">
                  Message exceeds {MAX_MESSAGE_LENGTH.toLocaleString()} characters.
                </p>
              ) : (
                <p id="peer-feedback-modal-counter" className="text-muted-foreground text-xs">
                  {message.length.toLocaleString()} / {MAX_MESSAGE_LENGTH.toLocaleString()} characters
                </p>
              )}
              {mutation.isError ? (
                <p className="text-destructive text-sm" role="alert">
                  {mutation.error instanceof Error
                    ? mutation.error.message
                    : 'Something went wrong.'}
                </p>
              ) : null}
              {mutation.isSuccess ? (
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
                    Thanks — we got your feedback!
                  </p>
                </div>
              ) : null}
            </div>
          </div>
          <DialogFooter className="mt-0 shrink-0 border-t bg-muted/50 pt-4">
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {mutation.isPending ? 'Sending…' : 'Send feedback'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
