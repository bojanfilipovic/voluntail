import type { MessageKey } from '@/i18n/nl'
import type { TranslateFn } from '@/i18n/locale'

export type InfoNavLink = { to: string; labelKey: MessageKey }

/** Route targets shared by directory header and marketing layout (labels via `t`). */
export const INFO_NAV_ROUTE_KEYS = [
  { to: '/', labelKey: 'nav.mapDirectory' },
  { to: '/adopteren', labelKey: 'nav.adopteren' },
  { to: '/vrijwilliger', labelKey: 'nav.volunteer' },
  { to: '/hoe-het-werkt', labelKey: 'nav.howItWorks' },
  { to: '/explore', labelKey: 'nav.explore' },
] as const satisfies readonly InfoNavLink[]

export function mapNavLinks(t: TranslateFn): { to: string; label: string }[] {
  return INFO_NAV_ROUTE_KEYS.map(({ to, labelKey }) => ({
    to,
    label: t(labelKey),
  }))
}
