'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

import { AlertTriangle, RefreshCw } from 'lucide-react'

import { cn } from '../../lib/utils'

type FlowErrorBoundaryProps = {
  /** Content to render when no error */
  children: ReactNode
  /** CSS class name for error container */
  className?: string
  /** Fallback content when error occurs */
  fallback?: ReactNode
  /** Container height (matches FlowDiagram height prop) */
  height?: number | string
  /** Callback when the boundary catches an error */
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

type FlowErrorBoundaryState = {
  error: Error | null
  hasError: boolean
}

/**
 * Error boundary specifically for FlowDiagram components.
 * Catches React Flow library errors and displays a friendly fallback.
 *
 * @example
 * ```tsx
 * <FlowErrorBoundary onError={(e) => console.error(e)}>
 *   <FlowDiagram nodes={nodes} edges={edges} />
 * </FlowErrorBoundary>
 * ```
 */
export class FlowErrorBoundary extends Component<FlowErrorBoundaryProps, FlowErrorBoundaryState> {
  constructor(props: FlowErrorBoundaryProps) {
    super(props)
    this.state = { error: null, hasError: false }
  }

  static getDerivedStateFromError(error: Error): FlowErrorBoundaryState {
    return { error, hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[FlowDiagram] Error caught by boundary:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  handleRetry = (): void => {
    this.setState({ error: null, hasError: false })
  }

  render(): ReactNode {
    const { children, className, fallback, height = 400 } = this.props
    const { error, hasError } = this.state

    if (hasError) {
      if (fallback) {
        return fallback
      }

      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-muted/50 p-8 text-center',
            className,
          )}
          style={{ height }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Failed to render diagram</h3>
            <p className="text-sm text-muted-foreground">
              {error?.message ?? 'An unexpected error occurred while rendering the flow diagram.'}
            </p>
          </div>
          <button
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            onClick={this.handleRetry}
            type="button"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      )
    }

    return children
  }
}
