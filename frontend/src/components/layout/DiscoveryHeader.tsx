import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CommunityStatsStrip } from '@/components/layout/CommunityStatsStrip'
import type { CommunityStats } from '@/components/layout/CommunityStatsStrip'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MessageSquare, ArrowLeft, Compass, Moon, Sun, Monitor, Info, Menu } from 'lucide-react'
import { useI18n } from '@/i18n/I18nContext'
import { mapNavLinks } from '@/i18n/navLinks'
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
  onShareFeedbackClick?: () => void
}) {
  const { t } = useI18n()
  const bodyClass =
    forModal
      ? 'text-foreground/95 m-0 max-w-none text-[15px] leading-relaxed tracking-tight'
      : 'text-muted-foreground max-w-2xl text-sm leading-relaxed'

  if (forModal && onShareFeedbackClick) {
    return (
      <p className={bodyClass}>
        {t('discovery.intro.modalBeforeLink')}
        <button
          type="button"
          className="text-primary font-medium underline decoration-primary/60 underline-offset-[3px] transition-opacity hover:opacity-90"
          onClick={onShareFeedbackClick}
        >
          {t('discovery.intro.modalLink')}
        </button>
        {t('discovery.intro.modalAfterLink')}
      </p>
    )
  }

  return <p className={bodyClass}>{t('discovery.intro.inline')}</p>
}

function ExploreIntro({ hasMatches }: { hasMatches?: boolean }) {
  const { t } = useI18n()
  if (hasMatches) return null
  return (
    <p className="text-muted-foreground max-w-2xl text-sm leading-relaxed">
      {t('discovery.exploreIntro')}
    </p>
  )
}

function ShareFeedbackButton({ onShareFeedback }: Pick<Props, 'onShareFeedback'>) {
  const { t } = useI18n()
  return (
    <Button type="button" variant="default" className="shrink-0 md:min-w-0" onClick={onShareFeedback}>
      <MessageSquare aria-hidden />
      {t('discovery.shareFeedback')}
    </Button>
  )
}

function ThemeToggleButton({ theme, onCycleTheme }: Pick<Props, 'theme' | 'onCycleTheme'>) {
  const { t } = useI18n()
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onCycleTheme}
      aria-label={t('discovery.themeAria', { theme })}
      className="shrink-0"
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  )
}

export function DiscoveryHeader({
  onShareFeedback,
  appView,
  onGoExplore,
  onGoDirectory,
  hasMatches,
  theme,
  onCycleTheme,
  stats,
}: Props) {
  const { t } = useI18n()
  const [welcomeOpen, setWelcomeOpen] = useState(false)
  const [infoMenuOpen, setInfoMenuOpen] = useState(false)
  const navLinks = useMemo(() => mapNavLinks(t), [t])

  return (
    <header className="border-border border-b px-4 py-3 md:px-6 md:py-4">
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
                aria-label={t('discovery.welcomeAria')}
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
              aria-label={t('discovery.morePagesAria')}
              onClick={() => setInfoMenuOpen(true)}
            >
              <Menu className="size-4" aria-hidden />
            </Button>
            <LocaleSwitcher />
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
              {t('discovery.explore')}
            </Button>
          ) : (
            <Button
              type="button"
              variant="secondary"
              className="w-full md:w-auto"
              onClick={onGoDirectory}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t('discovery.backToMap')}
            </Button>
          )}
        </div>
      </div>

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
                {t('discovery.explore')}
              </Button>
            ) : (
              <Button type="button" variant="secondary" className="md:w-auto" onClick={onGoDirectory}>
                <ArrowLeft className="size-4" aria-hidden />
                {t('discovery.backToMap')}
              </Button>
            )}
            <LocaleSwitcher />
            <ThemeToggleButton theme={theme} onCycleTheme={onCycleTheme} />
            <ShareFeedbackButton onShareFeedback={onShareFeedback} />
          </div>
        </div>
        {appView === 'directory' ? (
          <>
            <DirectoryIntro />
            <CommunityStatsStrip stats={stats} />
          </>
        ) : (
          <ExploreIntro hasMatches={hasMatches} />
        )}
      </div>
      {appView === 'directory' ? (
        <Dialog open={welcomeOpen} onOpenChange={setWelcomeOpen}>
          <DialogContent
            showCloseButton
            className="w-[min(calc(100vw-1.25rem),22rem)] max-w-[calc(100vw-1.25rem)] gap-0 rounded-2xl border-0 p-6 pr-12 pt-5 shadow-xl sm:max-w-sm"
          >
            <DialogTitle className="sr-only">{t('discovery.welcomeAria')}</DialogTitle>
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
        aria-label={t('discovery.footerNavAria')}
      >
        {navLinks
          .filter(({ to }) => to !== '/')
          .map(({ to, label }) => (
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
            <DialogTitle className="text-left">{t('discovery.morePagesTitle')}</DialogTitle>
          </DialogHeader>
          <nav
            id="directory-info-nav-menu"
            className="flex flex-col gap-1 pb-2"
            aria-label={t('discovery.footerNavAria')}
          >
            {navLinks.map(({ to, label }) => (
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
