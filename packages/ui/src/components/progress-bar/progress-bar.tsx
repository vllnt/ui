import { cn } from '../../lib/utils'

export type ProgressBarProps = {
  className?: string
  completedLabel?: string
  currentLabel?: string
  isComplete?: boolean
  isLoading?: boolean
  max: number
  showLabels?: boolean
  value: number
}

export function ProgressBar({
  className,
  completedLabel,
  currentLabel,
  isComplete = false,
  isLoading = false,
  max,
  showLabels = true,
  value,
}: ProgressBarProps): React.ReactNode {
  const percent = max > 0 ? Math.round((value / max) * 100) : 0

  return (
    <div
      className={cn(
        'border rounded-lg p-4 transition-colors',
        isLoading && 'border-border bg-muted/30',
        !isLoading && isComplete && 'border-green-500/50 bg-green-500/5',
        !isLoading && !isComplete && 'border-border bg-muted/30',
        className,
      )}
    >
      {showLabels ? (
        <div className="flex items-center justify-between mb-2 h-5">
          {isLoading ? (
            <>
              <span className="h-5 w-16 bg-muted rounded animate-pulse" />
              <span className="h-5 w-24 bg-muted rounded animate-pulse" />
            </>
          ) : (
            <>
              <span className="text-sm font-medium leading-5">
                {currentLabel ?? (isComplete ? 'Complete' : 'Progress')}
              </span>
              <span className="text-sm text-muted-foreground leading-5">
                {value} / {max} {completedLabel ?? ''}
              </span>
            </>
          )}
        </div>
      ) : null}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn(
            'h-full transition-all duration-300',
            isLoading && 'w-0',
            !isLoading && isComplete && 'bg-green-500',
            !isLoading && !isComplete && 'bg-primary',
          )}
          style={isLoading ? undefined : { width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
