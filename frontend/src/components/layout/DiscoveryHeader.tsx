import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'

type Props = {
  onShareFeedback: () => void
}

export function DiscoveryHeader({ onShareFeedback }: Props) {
  return (
    <header className="border-border border-b px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="min-w-0 md:w-2/3">
          <h1 className="text-lg font-semibold tracking-tight">Voluntail</h1>
          <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
            Discover animal shelters in the Netherlands—explore the map or list, then open a
            shelter for volunteer signup and donation links. Info here is curated; always confirm
            details on the shelter&apos;s official site.
          </p>
        </div>
        <div className="flex shrink-0 md:mt-0 md:w-1/3 md:justify-end">
          <Button
            type="button"
            variant="default"
            className="w-full md:w-auto"
            onClick={onShareFeedback}
          >
            <MessageSquare aria-hidden />
            Share feedback
          </Button>
        </div>
      </div>
    </header>
  )
}
