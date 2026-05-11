import { Link, useLocation } from 'react-router-dom'

import { SeoHelmet } from '@/components/SeoHelmet'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function NotFoundPage() {
  const location = useLocation()

  return (
    <div className="bg-background text-foreground flex min-h-0 flex-1 flex-col overflow-y-auto">
      <SeoHelmet
        title="Pagina niet gevonden — Voluntail"
        description="Deze pagina bestaat niet op Voluntail."
        path={location.pathname}
        index={false}
        canonical={false}
      />
      <div className="flex flex-col items-center justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold">Pagina niet gevonden</h1>
        <p className="text-muted-foreground text-sm">Deze URL hoort niet bij Voluntail.</p>
        <Link
          to="/"
          className={cn(
            buttonVariants(),
            'bg-emerald-600 text-white hover:bg-emerald-700',
          )}
        >
          Terug naar Voluntail
        </Link>
      </div>
    </div>
  )
}
