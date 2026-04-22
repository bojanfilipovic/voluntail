import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Compass } from 'lucide-react'

type AppView = 'directory' | 'explore'

type Props = {
  onShareFeedback: () => void
  appView: AppView
  onGoExplore: () => void
  onGoDirectory: () => void
}

export function DiscoveryHeader({ onShareFeedback, appView, onGoExplore, onGoDirectory }: Props) {
  return (
    <header className="border-border border-b px-6 py-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <div className="min-w-0 md:w-2/3">
          <h1 className="text-lg font-semibold tracking-tight">Voluntail</h1>
          {appView === 'directory' ? (
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
              Discover animal shelters in the Netherlands—explore the map or list, then open a
              shelter for volunteer signup and donation links. Info here is curated; always confirm
              details on the shelter&apos;s official site.
            </p>
          ) : (
            <p className="text-muted-foreground mt-1 max-w-2xl text-sm leading-relaxed">
              Browsing the shelter animal list for fun. Rolled matches are stored in this browser only.
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:shrink-0 sm:items-center md:mt-0 md:w-1/3 md:justify-end">
          {appView === 'directory' ? (
            <Button
              type="button"
              variant="secondary"
              className="w-full md:w-auto"
              onClick={onGoExplore}
            >
              <Compass className="size-4" aria-hidden />
              Explore
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full md:w-auto"
              onClick={onGoDirectory}
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to map
            </Button>
          )}
          <Button
            type="button"
            variant="default"
            className="w-full sm:w-full md:min-w-0"
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
