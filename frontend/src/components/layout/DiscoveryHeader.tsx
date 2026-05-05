import { Button } from '@/components/ui/button'
import { MessageSquare, ArrowLeft, Compass, Moon, Sun, Monitor } from 'lucide-react'
import type { ThemeValue } from '@/lib/theme'

type AppView = 'directory' | 'explore'

type Props = {
  onShareFeedback: () => void
  appView: AppView
  onGoExplore: () => void
  onGoDirectory: () => void
  hasMatches?: boolean
  theme: ThemeValue
  onCycleTheme: () => void
}

/** New element each call — safe for two responsive branches both mounted in the DOM. */
function DirectoryIntro() {
  return (
    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
      Please use Share Feedback so I can learn what works and what you&apos;d like me to add to
      this. Love, B 🫶
    </p>
  )
}

function ExploreIntro({ hasMatches }: { hasMatches?: boolean }) {
  if (hasMatches) return null
  return (
    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
      Swipe through animals that are listed as available and see if you land a match!{' '}
      {'<3'}
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

function ThemeToggleButton({ theme, onCycleTheme }: Pick<Props, 'theme' | 'onCycleTheme'>) {
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  return (
    <Button type="button" variant="outline" size="icon" onClick={onCycleTheme} aria-label={`Theme: ${theme}`} className="shrink-0">
      <Icon className="size-4" aria-hidden />
    </Button>
  )
}

export function DiscoveryHeader({ onShareFeedback, appView, onGoExplore, onGoDirectory, hasMatches, theme, onCycleTheme }: Props) {
  return (
    <header className="border-border border-b px-4 py-3 md:px-6 md:py-4">
      {/* Mobile & narrow: Voluntail + Share, then intro, then Explore / Back */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight">Voluntail</h1>
          <div className="flex items-center gap-1">
            <ThemeToggleButton theme={theme} onCycleTheme={onCycleTheme} />
            <ShareFeedbackButton onShareFeedback={onShareFeedback} />
          </div>
        </div>
        {appView === 'directory' ? <DirectoryIntro /> : <ExploreIntro hasMatches={hasMatches} />}
        <div className="w-full">
          {appView === 'directory' ? (
            <Button
              type="button"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700 md:w-auto"
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
              <Button
                type="button"
                className="bg-emerald-600 text-white hover:bg-emerald-700 md:w-auto"
                onClick={onGoExplore}
              >
                <Compass className="size-4" aria-hidden />
                Explore
              </Button>
            ) : (
              <Button type="button" variant="secondary" className="md:w-auto" onClick={onGoDirectory}>
                <ArrowLeft className="size-4" aria-hidden />
                Back to map
              </Button>
            )}
            <ThemeToggleButton theme={theme} onCycleTheme={onCycleTheme} />
            <ShareFeedbackButton onShareFeedback={onShareFeedback} />
          </div>
        </div>
        {appView === 'directory' ? <DirectoryIntro /> : <ExploreIntro hasMatches={hasMatches} />}
      </div>
    </header>
  )
}
