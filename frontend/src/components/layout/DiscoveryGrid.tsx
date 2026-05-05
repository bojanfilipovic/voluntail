import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

/**
 * Responsive discovery layout:
 * - Mobile (<lg): vertical scroll-snap with two positions.
 *   Default: map ~30svh, list remainder. Swipe up: map collapses to 80px, list fills viewport.
 * - Desktop (lg+): side-by-side 50/50 grid (unchanged).
 */
export function DiscoveryGrid({ children }: Props) {
  return (
    <div
      className="
        min-h-0 flex-1
        flex flex-col overflow-y-auto snap-y snap-mandatory overscroll-y-contain
        lg:grid lg:grid-cols-2 lg:grid-rows-[minmax(0,1fr)] lg:gap-4
        lg:snap-none lg:overflow-visible
      "
    >
      {children}
    </div>
  )
}
