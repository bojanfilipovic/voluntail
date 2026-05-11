import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nContext'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
}

function DiscoveryErrorFallback({
  onRetry,
}: {
  onRetry: () => void
}) {
  const { t } = useI18n()
  return (
    <div
      className="border-destructive/40 bg-destructive/5 flex min-h-[12rem] flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center"
      role="alert"
    >
      <p className="text-foreground max-w-md text-sm leading-relaxed">
        {t('errorBoundary.body')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
        >
          {t('errorBoundary.tryAgain')}
        </Button>
        <Button type="button" size="sm" onClick={() => window.location.reload()}>
          {t('errorBoundary.reload')}
        </Button>
      </div>
    </div>
  )
}

/**
 * Limits blast radius when the map/list shell throws (e.g. Mapbox/React edge cases).
 * Header stays outside this boundary in App.
 */
export class DiscoveryErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[Voluntail] discovery shell error', error, info.componentStack)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <DiscoveryErrorFallback onRetry={() => this.setState({ hasError: false })} />
      )
    }
    return this.props.children
  }
}
