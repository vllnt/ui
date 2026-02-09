import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

export type CalloutVariant = 'danger' | 'info' | 'note' | 'success' | 'tip' | 'warning'

export type CalloutProps = {
  children: ReactNode
  className?: string
  icon?: ReactNode
  title?: string
  variant?: CalloutVariant
}

const variantStyles: Record<CalloutVariant, { className: string; defaultTitle: string }> = {
  danger: {
    className: 'border-red-500/50 bg-red-500/10 text-red-700 dark:text-red-300',
    defaultTitle: 'Danger',
  },
  info: {
    className: 'border-blue-500/50 bg-blue-500/10 text-blue-700 dark:text-blue-300',
    defaultTitle: 'Info',
  },
  note: {
    className: 'border-gray-500/50 bg-gray-500/10 text-gray-700 dark:text-gray-300',
    defaultTitle: 'Note',
  },
  success: {
    className: 'border-green-500/50 bg-green-500/10 text-green-700 dark:text-green-300',
    defaultTitle: 'Success',
  },
  tip: {
    className: 'border-amber-500/50 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    defaultTitle: 'Tip',
  },
  warning: {
    className: 'border-orange-500/50 bg-orange-500/10 text-orange-700 dark:text-orange-300',
    defaultTitle: 'Warning',
  },
}

export function Callout({
  children,
  className,
  icon,
  title,
  variant = 'info',
}: CalloutProps): React.ReactNode {
  const config = variantStyles[variant]
  const displayTitle = title ?? config.defaultTitle

  return (
    <div className={cn('my-6 rounded-lg border-l-4 p-4', config.className, className)} role="alert">
      <div className="flex items-start gap-3">
        {icon ? <span className="h-5 w-5 flex-shrink-0 mt-0.5">{icon}</span> : null}
        <div className="flex-1 min-w-0">
          {displayTitle ? <p className="font-semibold mb-1">{displayTitle}</p> : null}
          <div className="text-sm [&>p]:mb-0 [&>p:last-child]:mb-0">{children}</div>
        </div>
      </div>
    </div>
  )
}
