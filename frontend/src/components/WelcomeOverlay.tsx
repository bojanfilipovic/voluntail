import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Compass, MapPin, MessageSquare } from 'lucide-react'

const STORAGE_KEY = 'voluntail.welcomed.v1'

function hasBeenWelcomed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

function markWelcomed() {
  try {
    localStorage.setItem(STORAGE_KEY, '1')
  } catch { /* noop */ }
}

type Props = {
  onGoExplore: () => void
}

export function WelcomeOverlay({ onGoExplore }: Props) {
  const [open, setOpen] = useState(() => !hasBeenWelcomed())

  if (!open) return null

  const handleDismiss = () => {
    markWelcomed()
    setOpen(false)
  }

  const handleExplore = () => {
    markWelcomed()
    setOpen(false)
    onGoExplore()
  }

  return (
    <Dialog open onOpenChange={(o) => { if (!o) handleDismiss() }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Welcome to Voluntail</DialogTitle>
          <DialogDescription>
            Discover animal shelters in the Netherlands and find ways to help.
          </DialogDescription>
        </DialogHeader>
        <ul className="space-y-3 py-2 text-sm">
          <li className="flex items-start gap-3">
            <MapPin className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Browse shelters on the map — find volunteer signups and donation links</span>
          </li>
          <li className="flex items-start gap-3">
            <Compass className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Try <strong>Explore</strong> — swipe through available animals and build a shortlist</span>
          </li>
          <li className="flex items-start gap-3">
            <MessageSquare className="text-muted-foreground mt-0.5 size-4 shrink-0" aria-hidden />
            <span>Share feedback anytime — this is a pilot and your input shapes what comes next</span>
          </li>
        </ul>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={handleDismiss}>
            Go to map
          </Button>
          <Button className="bg-emerald-600 text-white hover:bg-emerald-700" onClick={handleExplore}>
            <Compass className="size-4" aria-hidden />
            Try Explore
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
