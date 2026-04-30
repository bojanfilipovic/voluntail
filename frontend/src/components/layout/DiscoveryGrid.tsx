import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
}

/**
 * Viewport shell is fixed (see index.css). Grid must not grow with list intrinsic height:
 * - lg: one row minmax(0,1fr) → map + list share viewport height; list scrolls inside.
 * - stacked: capped map row + remainder to list so the map cannot push the page.
 */
export function DiscoveryGrid({ children }: Props) {
  return (
    <div
      className="
        grid min-h-0 flex-1 gap-3 lg:gap-4
        grid-cols-1
        grid-rows-[minmax(220px,min(40svh,420px))_minmax(0,1fr)]
        lg:grid-cols-2
        lg:grid-rows-[minmax(0,1fr)]
      "
    >
      {children}
    </div>
  )
}
