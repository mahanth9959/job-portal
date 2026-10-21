import { Component } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from './ui/Button'
import { LogoMark } from './Brand'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Hireline caught a render error', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="grid min-h-svh place-items-center bg-ground p-6">
          <div className="w-full max-w-md rounded-card border border-line bg-surface p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-accent-soft text-accent">
              <LogoMark size={26} />
            </span>
            <h1 className="mt-5 text-2xl font-bold tracking-[-0.03em] text-ink">
              Something slipped out of view.
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted">
              Hireline hit an unexpected error. Your saved work in this browser is still there.
            </p>
            <Button
              className="mt-6"
              variant="primary"
              onClick={() => window.location.reload()}
            >
              <RefreshCw aria-hidden="true" />
              Reload the workspace
            </Button>
          </div>
        </main>
      )
    }
    return this.props.children
  }
}
