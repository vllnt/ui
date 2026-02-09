'use client'

import { memo, useCallback, useEffect, useState } from 'react'

import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

import { cn } from '../../lib/utils'
import { CompletionDialog } from '../completion-dialog'

export type SlideshowSection = {
  id: string
  title: string
}

export type SlideshowLabels = {
  closeLabel?: string
  closeTocLabel?: string
  exitLabel?: string
  finishLabel?: string
  nextLabel?: string
  openTocLabel?: string
  prevLabel?: string
  sectionsLabel?: string
}

export type SlideshowProps = {
  /** Completed section IDs */
  completedSections: Set<string>
  /** Dialog labels */
  completionDialogTitle?: string
  /** Current section index */
  currentIndex: number
  /** Labels for i18n */
  labels?: SlideshowLabels
  /** Callback when tutorial completes */
  onComplete: () => void
  /** Callback to exit slideshow */
  onExit: () => void
  /** Callback to navigate to section */
  onNavigate: (index: number) => void
  /** Callback to toggle section completion */
  onToggleSection: (sectionId: string) => void
  /** Render function for section content */
  renderContent: (section: SlideshowSection) => ReactNode
  /** Sections to display */
  sections: SlideshowSection[]
  /** Tutorial title */
  title: string
}

const DEFAULT_LABELS: Required<SlideshowLabels> = {
  closeLabel: 'Close',
  closeTocLabel: 'Close table of contents',
  exitLabel: 'Exit',
  finishLabel: 'Finish',
  nextLabel: 'Next',
  openTocLabel: 'Open table of contents',
  prevLabel: 'Prev',
  sectionsLabel: 'Sections',
}

// eslint-disable-next-line max-lines-per-function -- Complex slideshow with keyboard navigation
function SlideshowImpl({
  completedSections,
  completionDialogTitle = 'Mark section as complete?',
  currentIndex,
  labels = {},
  onComplete,
  onExit,
  onNavigate,
  onToggleSection,
  renderContent,
  sections,
  title,
}: SlideshowProps): React.ReactNode {
  const mergedLabels = { ...DEFAULT_LABELS, ...labels }
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null)
  const [isCompletionDialogOpen, setIsCompletionDialogOpen] = useState(false)
  const [isTocOpen, setIsTocOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const currentSection = sections[currentIndex]
  const isCurrentCompleted = currentSection ? completedSections.has(currentSection.id) : false
  const isLastSection = currentIndex === sections.length - 1
  const canGoNext = currentIndex < sections.length - 1
  const canGoPrevious = currentIndex > 0
  const progress = ((currentIndex + 1) / sections.length) * 100

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const goToSection = useCallback(
    (index: number, direction: 'left' | 'right') => {
      setAnimationDirection(direction)
      setTimeout(() => {
        onNavigate(index)
        setAnimationDirection(null)
      }, 150)
    },
    [onNavigate],
  )

  const handlePrevious = useCallback(() => {
    if (canGoPrevious) goToSection(currentIndex - 1, 'right')
  }, [canGoPrevious, currentIndex, goToSection])

  const handleNext = useCallback(() => {
    if (!canGoNext) {
      if (isCurrentCompleted) onComplete()
      else setIsCompletionDialogOpen(true)
      return
    }
    if (isCurrentCompleted) goToSection(currentIndex + 1, 'left')
    else setIsCompletionDialogOpen(true)
  }, [canGoNext, currentIndex, goToSection, isCurrentCompleted, onComplete])

  const handleMarkComplete = useCallback(() => {
    if (currentSection) onToggleSection(currentSection.id)
    setIsCompletionDialogOpen(false)
    if (isLastSection) onComplete()
    else goToSection(currentIndex + 1, 'left')
  }, [currentSection, onToggleSection, isLastSection, onComplete, goToSection, currentIndex])

  const handleSkip = useCallback(() => {
    setIsCompletionDialogOpen(false)
    if (isLastSection) onComplete()
    else goToSection(currentIndex + 1, 'left')
  }, [isLastSection, onComplete, goToSection, currentIndex])

  const handleTocNavigate = useCallback(
    (index: number) => {
      setIsTocOpen(false)
      goToSection(index, index > currentIndex ? 'left' : 'right')
    },
    [currentIndex, goToSection],
  )

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isCompletionDialogOpen) return
      if (event.key === 'Escape') {
        event.preventDefault()
        if (isTocOpen) setIsTocOpen(false)
        else onExit()
        return
      }
      if (event.key === 't' || event.key === 'T') {
        event.preventDefault()
        setIsTocOpen((p) => !p)
        return
      }
      if (event.key === 'ArrowRight' || event.key === 'j') {
        event.preventDefault()
        handleNext()
        return
      }
      if (event.key === 'ArrowLeft' || event.key === 'k') {
        event.preventDefault()
        handlePrevious()
      }
    }
    document.addEventListener('keydown', handleKeyDown, true)
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true)
    }
  }, [handleNext, handlePrevious, onExit, isTocOpen, isCompletionDialogOpen])

  if (!currentSection || !mounted) return null

  return createPortal(
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted z-10">
        <div
          className="h-full bg-foreground transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 mt-1 border-b border-border bg-background">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            aria-label={isTocOpen ? mergedLabels.closeTocLabel : mergedLabels.openTocLabel}
            className="flex-shrink-0 p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => {
              setIsTocOpen((p) => !p)
            }}
            type="button"
          >
            {isTocOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M6 18L18 6M6 6l12 12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M4 6h16M4 12h16M4 18h16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            )}
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <p className="text-sm font-medium truncate">{currentSection.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
            {currentIndex + 1}/{sections.length}
          </span>
          <button
            aria-label={mergedLabels.exitLabel}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={onExit}
            type="button"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                d="M6 18L18 6M6 6l12 12"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="relative flex-1 overflow-hidden">
        {isTocOpen ? (
          <div
            className="absolute inset-0 z-20 flex animate-in fade-in-0 duration-200"
            onClick={() => {
              setIsTocOpen(false)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') setIsTocOpen(false)
            }}
            role="button"
            tabIndex={0}
          >
            <div className="absolute inset-0 bg-background/40" />
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
            <div
              className="relative w-full sm:max-w-sm bg-background border-r border-border h-full overflow-auto shadow-2xl"
              onClick={(event) => {
                event.stopPropagation()
              }}
              onKeyDown={(event) => {
                event.stopPropagation()
              }}
              role="dialog"
            >
              <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-border bg-background">
                <h3 className="font-semibold">{mergedLabels.sectionsLabel}</h3>
                <button
                  aria-label={mergedLabels.closeLabel}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  onClick={() => {
                    setIsTocOpen(false)
                  }}
                  type="button"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      d="M6 18L18 6M6 6l12 12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                    />
                  </svg>
                </button>
              </div>
              <div className="p-2">
                {sections.map((section, index) => {
                  const isCompleted = completedSections.has(section.id)
                  const isCurrent = index === currentIndex
                  return (
                    <button
                      className={cn(
                        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                        isCurrent ? 'bg-muted' : 'hover:bg-muted/50',
                      )}
                      key={`${section.id}-${index}`}
                      onClick={() => {
                        handleTocNavigate(index)
                      }}
                      type="button"
                    >
                      <div
                        className={cn(
                          'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                          isCompleted
                            ? 'bg-foreground border-foreground'
                            : 'border-muted-foreground',
                        )}
                      >
                        {isCompleted ? (
                          <svg
                            className="h-3 w-3 text-background"
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
                        ) : null}
                      </div>
                      <span
                        className={cn(
                          'flex-1 text-sm truncate',
                          isCompleted && 'line-through opacity-60',
                        )}
                      >
                        {section.title}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        ) : null}

        <div className="h-full overflow-auto px-4 py-8 md:px-8 lg:px-16">
          <div className="mx-auto max-w-3xl">
            <div
              className={cn(
                'transition-all duration-150 ease-out',
                animationDirection === 'left' && 'opacity-0 -translate-x-4',
                animationDirection === 'right' && 'opacity-0 translate-x-4',
                !animationDirection && 'opacity-100 translate-x-0',
              )}
            >
              {renderContent(currentSection)}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="relative z-20 flex items-center justify-between px-4 py-4 border-t border-border bg-background">
        <button
          className="min-w-[100px] gap-1 inline-flex items-center justify-center px-4 py-2 rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none"
          disabled={!canGoPrevious}
          onClick={handlePrevious}
          type="button"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="m15 19-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
          </svg>
          <span>{mergedLabels.prevLabel}</span>
        </button>
        <button
          className="min-w-[100px] gap-1 inline-flex items-center justify-center px-4 py-2 rounded-md bg-foreground text-background hover:bg-foreground/90 transition-colors"
          onClick={handleNext}
          type="button"
        >
          <span>{isLastSection ? mergedLabels.finishLabel : mergedLabels.nextLabel}</span>
          {!isLastSection && (
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
            </svg>
          )}
        </button>
      </div>

      <CompletionDialog
        description={`You're about to ${isLastSection ? 'finish' : 'move to the next section from'}: ${currentSection.title}`}
        isOpen={isCompletionDialogOpen}
        onCancel={handleSkip}
        onClose={() => {
          setIsCompletionDialogOpen(false)
        }}
        onConfirm={handleMarkComplete}
        title={completionDialogTitle}
      />
    </div>,
    document.body,
  )
}

export const Slideshow = memo(SlideshowImpl)
Slideshow.displayName = 'Slideshow'
