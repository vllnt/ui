'use client'

import { memo } from 'react'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

export type StepNavigationProps = {
  canNext: boolean
  canPrev: boolean
  className?: string
  currentStep: number
  nextIcon?: ReactNode
  nextLabel?: string
  onNext: () => void
  onPrev: () => void
  previousIcon?: ReactNode
  previousLabel?: string
  stepLabel?: string
  totalSteps: number
}

// eslint-disable-next-line max-lines-per-function -- Complex navigation with icons
function StepNavigationImpl({
  canNext,
  canPrev,
  className,
  currentStep,
  nextIcon,
  nextLabel = 'Next',
  onNext,
  onPrev,
  previousIcon,
  previousLabel = 'Prev',
  stepLabel = 'Section',
  totalSteps,
}: StepNavigationProps): React.ReactNode {
  return (
    <nav
      aria-label="Step navigation"
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'border-t border-neutral-200 bg-white',
        'dark:border-neutral-800 dark:bg-black',
        className,
      )}
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        {/* Previous Button */}
        <button
          aria-label="Previous step"
          className={cn(
            'flex min-h-[44px] min-w-[44px] items-center justify-center',
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-neutral-100 dark:hover:bg-neutral-900',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          disabled={!canPrev}
          onClick={onPrev}
          type="button"
        >
          {previousIcon ?? (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                d="m15 19-7-7 7-7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          )}
          <span className="ml-1">{previousLabel}</span>
        </button>

        {/* Center: Step Counter */}
        <div className="text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
          {stepLabel} {currentStep} / {totalSteps}
        </div>

        {/* Next Button */}
        <button
          aria-label="Next step"
          className={cn(
            'flex min-h-[44px] min-w-[44px] items-center justify-center',
            'rounded-md px-3 py-2 text-sm font-medium transition-colors',
            'hover:bg-neutral-100 dark:hover:bg-neutral-900',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          disabled={!canNext}
          onClick={onNext}
          type="button"
        >
          <span className="mr-1">{nextLabel}</span>
          {nextIcon ?? (
            <svg
              aria-hidden="true"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          )}
        </button>
      </div>
    </nav>
  )
}

export const StepNavigation = memo(StepNavigationImpl)
StepNavigation.displayName = 'StepNavigation'
