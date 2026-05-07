import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Props = {
  children: ReactNode
  className?: string
}

/**
 * Vertical-stack footer shell for detail dialogs.
 *
 * Bypasses shadcn `DialogFooter`, which defaults to `sm:flex-row sm:justify-end`
 * and corrupts multi-row footers on >=sm screens (each row collapses into a column).
 * Use this whenever a dialog footer needs more than one row.
 */
export function DialogFooterStack({ children, className }: Props) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'border-border/50 flex flex-col gap-3 rounded-b-xl border-t bg-muted/40 px-4 py-3 pb-4',
        className,
      )}
    >
      {children}
    </div>
  )
}
