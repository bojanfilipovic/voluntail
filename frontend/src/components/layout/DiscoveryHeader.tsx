import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CommunityStatsStrip } from '@/components/layout/CommunityStatsStrip'
import type { CommunityStats } from '@/components/layout/CommunityStatsStrip'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageSquare, ArrowLeft, Compass, Moon, Sun, Monitor, Info, Menu } from 'lucide-react'
import { INFO_NAV_LINKS } from '@/marketing/navLinks'
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
  stats?: CommunityStats
}

/** New element each call — safe for two responsive branches both mounted in the DOM. */
function DirectoryIntro({
  forModal = false,
  onShareFeedbackClick,
}: {
  forModal?: boolean
  /** When set (e.g. in welcome modal), "Share Feedback" in the sentence opens feedback. */
  onShareFeedbackClick?: () => void
}) {
  const bodyClass =
    forModal
      ? 'text-foreground/95 m-0 max-w-none text-[15px] leading-relaxed tracking-tight'
      : 'text-muted-foreground max-w-2xl text-sm leading-relaxed'

  if (forModal && onShareFeedbackClick) {
    return (
      <p className={bodyClass}>
        Please use{' '}
        <button
          type="button"
          className="text-primary font-medium underline decoration-primary/60 underline-offset-[3px] transition-opacity hover:opacity-90"
          onClick={onShareFeedbackClick}
        >
          Share Feedback
        </button>
        {' '}
        so I can learn what works and what you&apos;d like me to add to this. Love, Bojan 🫶
      </p>
    )
  }

  return (
    <p className={bodyClass}>
      Please use Share Feedback so I can learn what works and what you&apos;d like me to add to
      this. Love, Bojan 🫶
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

export function DiscoveryHeader({ onShareFeedback, appView, onGoExplore, onGoDirectory, hasMatches, theme, onCycleTheme, stats }: Props) {
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [infoMenuOpen, setInfoMenuOpen] = useState(false)

  return (
    <header className="border-border border-b px-4 py-3 md:px-6 md:py-4">
      {/* Mobile & narrow: Voluntail + Share, then intro, then Explore / Back */}
      <div className="flex flex-col gap-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold tracking-tight">
            <Link to="/" className="underline-offset-4 hover:underline">
              Voluntail
            </Link>
          </h1>
          <div className="flex items-center gap-1">
            {appView === 'directory' ? (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setWelcomeOpen(true)}
                className="shrink-0"
                aria-label="Welcome message"
              >
                <Info className="size-4" aria-hidden />
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
              aria-expanded={infoMenuOpen}
              aria-controls="directory-info-nav-menu"
              aria-label="Meer pagina&apos;s"
              onClick={() => setInfoMenuOpen(true)}
            >
              <Menu className="size-4" aria-hidden />
            </Button>
            <ThemeToggleButton theme={theme} onCycleTheme={onCycleTheme} />
            <ShareFeedbackButton onShareFeedback={onShareFeedback} />
          </div>
        </div>
        {appView === 'directory' ? null : <ExploreIntro hasMatches={hasMatches} />}
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
          <h1 className="text-lg font-semibold tracking-tight">
            <Link to="/" className="underline-offset-4 hover:underline">
              Voluntail
            </Link>
          </h1>
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
        {appView === 'directory' ? <><DirectoryIntro /><CommunityStatsStrip stats={stats} /></> : <ExploreIntro hasMatches={hasMatches} />}
      </div>
      {appView === 'directory' ? (
        <Dialog open={welcomeOpen} onOpenChange={setWelcomeOpen}>
          <DialogContent
            showCloseButton
            className="w-[min(calc(100vw-1.25rem),22rem)] max-w-[calc(100vw-1.25rem)] gap-0 rounded-2xl border-0 p-6 pr-12 pt-5 shadow-xl sm:max-w-sm"
          >
            <DialogTitle className="sr-only">Welcome message</DialogTitle>
            <DirectoryIntro
              forModal
              onShareFeedbackClick={() => {
                setWelcomeOpen(false)
                onShareFeedback()
              }}
            />
            {stats != null && stats.shelters !== undefined ? (
              <div className="border-border/60 mt-4 border-t pt-4">
                <CommunityStatsStrip stats={stats} />
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      ) : null}
      <nav
        className="border-border mt-3 hidden flex-wrap gap-x-3 gap-y-1 border-t pt-3 text-xs text-muted-foreground md:mt-4 md:flex md:pt-4"
        aria-label="Informatiepagina&apos;s"
      >
        {INFO_NAV_LINKS.filter(({ to }) => to !== '/').map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className="underline-offset-2 hover:text-foreground hover:underline"
          >
            {label}
          </Link>
        ))}
      </nav>
      <Dialog open={infoMenuOpen} onOpenChange={setInfoMenuOpen}>
        <DialogContent
          className="top-auto bottom-0 left-1/2 max-h-[min(85dvh,calc(100%-2rem))] max-w-none translate-x-[-50%] translate-y-0 rounded-b-none rounded-t-2xl border-x-0 border-b-0 sm:max-w-sm"
          showCloseButton
        >
          <DialogHeader>
            <DialogTitle className="text-left">Meer pagina&apos;s</DialogTitle>
          </DialogHeader>
          <nav
            id="directory-info-nav-menu"
            className="flex flex-col gap-1 pb-2"
            aria-label="Informatiepagina&apos;s"
          >
            {INFO_NAV_LINKS.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setInfoMenuOpen(false)}
                className="text-foreground hover:bg-muted rounded-lg px-3 py-3 text-base font-medium"
              >
                {label}
              </Link>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  )
}
