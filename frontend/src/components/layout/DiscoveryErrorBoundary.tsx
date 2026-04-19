import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  children: ReactNode
}

type State = {
  hasError: boolean
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
        <div
          className="border-destructive/40 bg-destructive/5 flex min-h-[12rem] flex-col items-center justify-center gap-4 rounded-lg border p-6 text-center"
          role="alert"
        >
          <p className="text-foreground max-w-md text-sm leading-relaxed">
            Something went wrong while loading the map or directory. You can try again or reload
            the page.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </Button>
            <Button type="button" size="sm" onClick={() => window.location.reload()}>
              Reload page
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
