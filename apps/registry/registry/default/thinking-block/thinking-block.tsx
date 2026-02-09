'use client'

import { useCallback, useEffect, useId, useState } from 'react'

import { ChevronDown, ChevronRight } from 'lucide-react'

import { cn } from '../../../lib/utils'

export type ThinkingBlockProps = {
  className?: string
  /** Whether the content is still being streamed. */
  isStreaming?: boolean
  /** The thinking text content to display. */
  thinking: string
}

/** Collapsible thinking block with streaming support. */
export function ThinkingBlock({ className, isStreaming = false, thinking }: ThinkingBlockProps) {
  const [isExpanded, setIsExpanded] = useState(isStreaming)
  const contentId = useId()

  // Auto-open when streaming starts
  useEffect(() => {
    if (isStreaming) setIsExpanded(true)
  }, [isStreaming])

  const toggleExpanded = useCallback(() => {
    setIsExpanded((previous) => !previous)
  }, [])

  return (
    <div className={cn('mb-2', className)}>
      <button
        aria-controls={contentId}
        aria-expanded={isExpanded}
        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        onClick={toggleExpanded}
        type="button"
      >
        {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        <span>
          Thinking
          {isStreaming ? <span className="ml-1 animate-pulse">...</span> : null}
        </span>
      </button>
      {isExpanded ? (
        <div
          className="mt-2 p-3 bg-muted/50 rounded text-xs text-muted-foreground whitespace-pre-wrap border-l-2 border-muted-foreground/30 max-h-48 overflow-y-auto"
          id={contentId}
        >
          {thinking}
          {isStreaming ? <span className="animate-pulse">|</span> : null}
        </div>
      ) : null}
    </div>
  )
}
