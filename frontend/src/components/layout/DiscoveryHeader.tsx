import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Compass } from 'lucide-react'

type AppView = 'directory' | 'explore'

type Props = {
  onShareFeedback: () => void
  appView: AppView
  onGoExplore: () => void
  onGoDirectory: () => void
}

/** New element each call — safe for two responsive branches both mounted in the DOM. */
function DirectoryIntro() {
  return (
    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
      Try <span className="font-medium text-foreground">Explore</span> for a quick swipe through
      animals. Please use Share Feedback so I can learn what works or what you&apos;d like me to add
      to this. Love, B
    </p>
  )
}

function ExploreIntro() {
  return (
    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
      Browsing the shelter animal list for fun. Rolled matches are stored in this browser only.
    </p>
  )
}

function ShareFeedbackButton({ onShareFeedback }: Pick<Props, 'onShareFeedback'>) {
  return (
    <Button type="button" variant="default" className="shrink-0 md:min-w-0" onClick={onShareFeedback}>
      <MessageSquare aria-hidden />
      Share feedback
    </Button>
  )
}

export function DiscoveryHeader({ onShareFeedback, appView, onGoExplore, onGoDirectory }: Props) {
  return (
    <header className="border-border border-b px-4 py-3 md:px-6 md:py-4">
      {/* Mobile & narrow: Voluntail + Share, then intro, then Explore / Back */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Voluntail</h1>
          <ShareFeedbackButton onShareFeedback={onShareFeedback} />
        </div>
        {appView === 'directory' ? <DirectoryIntro /> : <ExploreIntro />}
        <div className="w-full">
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
        </div>
      </div>

      {/* md+: Voluntail + Explore + Share on one row; intro below */}
      <div className="hidden md:flex md:flex-col md:gap-3">
        <div className="flex items-center justify-between gap-6">
          <h1 className="text-lg font-semibold tracking-tight">Voluntail</h1>
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
            {appView === 'directory' ? (
              <Button type="button" variant="secondary" className="md:w-auto" onClick={onGoExplore}>
                <Compass className="size-4" aria-hidden />
                Explore
              </Button>
            ) : (
              <Button type="button" variant="secondary" className="md:w-auto" onClick={onGoDirectory}>
                <ArrowLeft className="size-4" aria-hidden />
                Back to map
              </Button>
            )}
            <ShareFeedbackButton onShareFeedback={onShareFeedback} />
          </div>
        </div>
        {appView === 'directory' ? <DirectoryIntro /> : <ExploreIntro />}
      </div>
    </header>
  )
}
