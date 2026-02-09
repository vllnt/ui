import { cn } from '../../lib/utils'

export type SpinnerProps = {
  size?: 'lg' | 'md' | 'sm'
} & React.HTMLAttributes<HTMLDivElement>

function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-current border-t-transparent',
        {
          'h-4 w-4': size === 'sm',
          'h-6 w-6': size === 'md',
          'h-8 w-8': size === 'lg',
        },
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

export { Spinner }
