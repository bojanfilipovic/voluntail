import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/i18n/I18nContext'
import type { Locale } from '@/i18n/locale'
import { SUPPORTED_LOCALES } from '@/i18n/locale'

/** Regional-indicator pairs for locale menu (NL / EN). */
const LOCALE_FLAGS: Record<Locale, string> = {
  nl: '🇳🇱',
  en: '🇬🇧',
}

export function LocaleSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDocMouseDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDocMouseDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onDocMouseDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const pick = (next: Locale) => {
    setLocale(next)
    setOpen(false)
  }

  const listId = 'locale-switcher-listbox'

  return (
    <div ref={rootRef} className="relative shrink-0">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-9 gap-1.5 px-2 font-normal"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('locale.switcherAria')}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listId}
      >
        <span className="text-[1.15rem] leading-none" aria-hidden>
          {LOCALE_FLAGS[locale]}
        </span>
        <ChevronDown
          className={cn('size-4 opacity-70 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </Button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('locale.dialogTitle')}
          className="border-border bg-popover text-popover-foreground absolute right-0 z-50 mt-1 min-w-[11rem] rounded-md border p-1 shadow-md"
        >
          {SUPPORTED_LOCALES.map((code) => {
            const selected = locale === code
            return (
              <li key={code} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  className={cn(
                    'hover:bg-muted flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm',
                    selected && 'bg-muted',
                  )}
                  onClick={() => pick(code)}
                >
                  <span className="text-[1.15rem] leading-none" aria-hidden>
                    {LOCALE_FLAGS[code]}
                  </span>
                  <span className="min-w-0 flex-1">{code === 'nl' ? t('locale.nl') : t('locale.en')}</span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
