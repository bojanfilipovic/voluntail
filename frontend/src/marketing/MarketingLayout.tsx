import { ArrowLeft, Menu, Moon, Monitor, Sun } from 'lucide-react'
import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'
import { mapNavLinks } from '@/i18n/navLinks'
import { useTheme } from '@/hooks/useTheme'
import type { ThemeValue } from '@/lib/theme'
import { cn } from '@/lib/utils'

function ThemeToggleButton({
  theme,
  onCycleTheme,
  ariaLabel,
}: {
  theme: ThemeValue
  onCycleTheme: () => void
  ariaLabel: string
}) {
  const Icon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={onCycleTheme}
      aria-label={ariaLabel}
      className="shrink-0"
    >
      <Icon className="size-4" aria-hidden />
    </Button>
  )
}

export function MarketingLayout({ children }: { children: ReactNode }) {
  const { theme, cycleTheme } = useTheme()
  const { t } = useI18n()
  const [menuOpen, setMenuOpen] = useState(false)
  const navLinks = useMemo(() => mapNavLinks(t), [t])

  return (
    <div className="bg-background text-foreground flex min-h-0 flex-1 flex-col overflow-y-auto">
      <header className="border-border sticky top-0 z-10 border-b bg-background/95 px-3 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6 md:py-4">
        <div className="mx-auto flex max-w-2xl items-center gap-2 md:gap-3">
          <Link
            to="/"
            className={cn(
              buttonVariants({ variant: 'ghost', size: 'icon' }),
              'shrink-0',
            )}
            aria-label={t('marketing.layout.backAria')}
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Link>
          <Link
            to="/"
            className="text-foreground min-w-0 flex-1 truncate text-center text-lg font-semibold tracking-tight md:text-left"
          >
            Voluntail
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <Dialog open={menuOpen} onOpenChange={setMenuOpen}>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="md:hidden"
                aria-expanded={menuOpen}
                aria-controls="marketing-nav-menu"
                aria-label={t('marketing.layout.menuAria')}
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-4" aria-hidden />
              </Button>
              <DialogContent
                className="top-auto bottom-0 left-1/2 max-h-[min(85dvh,calc(100%-2rem))] max-w-none translate-x-[-50%] translate-y-0 rounded-b-none rounded-t-2xl border-x-0 border-b-0 sm:max-w-sm"
                showCloseButton
              >
                <DialogHeader>
                  <DialogTitle className="text-left">{t('marketing.layout.navTitle')}</DialogTitle>
                </DialogHeader>
                <nav
                  id="marketing-nav-menu"
                  className="flex flex-col gap-1 pb-2"
                  aria-label={t('discovery.footerNavAria')}
                >
                  {navLinks.map(({ to, label }) => (
                    <Link
                      key={to}
                      to={to}
                      onClick={() => setMenuOpen(false)}
                      className="text-foreground hover:bg-muted rounded-lg px-3 py-3 text-base font-medium"
                    >
                      {label}
                    </Link>
                  ))}
                </nav>
              </DialogContent>
            </Dialog>
            <LocaleSwitcher />
            <ThemeToggleButton
              theme={theme}
              onCycleTheme={cycleTheme}
              ariaLabel={t('marketing.themeAria', { theme })}
            />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6 md:px-6 md:py-10">{children}</main>
      <footer
        className="border-border mt-auto hidden border-t px-4 py-6 md:block md:px-6"
        aria-label={t('marketing.layout.footerNavAria')}
      >
        <nav
          className="mx-auto flex max-w-2xl flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground"
          aria-label={t('marketing.layout.footerAria')}
        >
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="underline-offset-4 hover:underline">
              {label}
            </Link>
          ))}
        </nav>
      </footer>
    </div>
  )
}
