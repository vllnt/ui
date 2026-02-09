'use client'

import { memo, useCallback, useEffect } from 'react'

import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Button } from '../button'

export type ContentIntroSection = {
  id: string
  title: string
}

export type ContentIntroLabels = {
  continueLabel?: string
  startLabel?: string
  tableOfContentsLabel?: string
}

export type ContentIntroProps = {
  /** Extra content sections (share, profile, etc.) */
  additionalContent?: ReactNode
  /** Completed section IDs */
  completedSections: Set<string>
  /** Estimated time to complete */
  estimatedTime: string
  /** Is loading progress */
  isLoading?: boolean
  /** Labels for i18n */
  labels?: ContentIntroLabels
  /** Callback when navigating to section */
  onGoToSection: (index: number) => void
  /** Callback when starting */
  onStart: () => void
  /** Render function for intro content */
  renderIntroContent: () => ReactNode
  /** Sections for TOC */
  sections: ContentIntroSection[]
  /** Intro section title */
  title: string
}

const DEFAULT_LABELS: Required<ContentIntroLabels> = {
  continueLabel: 'Continue Tutorial',
  startLabel: 'Start Tutorial',
  tableOfContentsLabel: 'Table of Contents',
}

// eslint-disable-next-line max-lines-per-function -- Complex intro with TOC and sticky button
function ContentIntroImpl({
  additionalContent,
  completedSections,
  estimatedTime,
  isLoading = false,
  labels = {},
  onGoToSection,
  onStart,
  renderIntroContent,
  sections,
  title,
}: ContentIntroProps): React.ReactNode {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels }
  const hasProgress = completedSections.size > 0

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        onStart()
      }
    },
    [onStart],
  )

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <>
      <div className="animate-in fade-in-0 duration-500 pb-24">
        {/* Introduction Content */}
        <section className="py-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">{title}</h2>
          <div className={cn('max-w-none', '[&_h2:first-of-type]:hidden')}>
            {renderIntroContent()}
          </div>
        </section>

        {/* Table of Contents */}
        <section className="mt-8 py-6 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">{mergedLabels.tableOfContentsLabel}</h3>
          <ol className="space-y-2">
            {sections.map((section, index) => {
              const isCompleted = !isLoading && completedSections.has(section.id)
              return (
                <li key={`${section.id}-${index}`}>
                  <button
                    className="w-full flex items-center gap-3 p-2 -m-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                    onClick={() => {
                      onGoToSection(index)
                    }}
                    type="button"
                  >
                    <span
                      className={cn(
                        'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium tabular-nums transition-colors',
                        isLoading && 'animate-pulse bg-muted',
                        !isLoading && isCompleted && 'bg-foreground text-background',
                        !isLoading && !isCompleted && 'bg-muted',
                      )}
                    >
                      {isCompleted ? (
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={cn('text-sm', isCompleted && 'line-through text-muted-foreground')}
                    >
                      {section.title}
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>
        </section>

        {/* Extra Content (Share, Profile, etc.) */}
        {additionalContent}
      </div>

      {/* Sticky Start/Continue Button */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/80 backdrop-blur-sm safe-bottom">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground hidden sm:block">
              {hasProgress
                ? `${completedSections.size}/${sections.length} completed`
                : `${sections.length} sections · ${estimatedTime}`}
            </p>
            <Button
              className="flex-1 sm:flex-none px-8 py-6 text-lg font-medium gap-2"
              onClick={onStart}
              size="lg"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M5 3l14 9-14 9V3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
              <span>{hasProgress ? mergedLabels.continueLabel : mergedLabels.startLabel}</span>
              <kbd className="hidden md:inline-flex ml-1 px-1.5 py-0.5 text-xs font-mono bg-primary-foreground/20 rounded">
                ↵
              </kbd>
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

export const ContentIntro = memo(ContentIntroImpl)
ContentIntro.displayName = 'ContentIntro'
