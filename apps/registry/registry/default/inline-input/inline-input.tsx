'use client'

import type { KeyboardEvent } from 'react'

import { cn } from '../../../lib/utils'

export type InlineInputProps = {
  className?: string
  /** Called when editing is cancelled (Escape key or blur without changes). */
  onCancel?: () => void
  /** Called when editing is committed (Enter key or blur with changes). */
  onCommit: (value: string) => void
  /** Called when the input value changes. */
  onChange: (value: string) => void
  /** Current input value. */
  value: string
}

/**
 * Inline input for editing text with keyboard support.
 * - Enter: commits the value
 * - Escape: cancels editing
 * - Blur: commits the value
 */
export function InlineInput({
  className,
  onCancel,
  onChange,
  onCommit,
  value,
}: InlineInputProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      onCommit(value)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      onCancel?.()
    }
  }

  return (
    <input
      autoFocus // eslint-disable-line jsx-a11y/no-autofocus
      className={cn(
        'flex h-7 flex-1 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors',
        'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
      onBlur={() => {
        onCommit(value)
      }}
      onChange={(event) => {
        onChange(event.target.value)
      }}
      onClick={(event) => {
        event.stopPropagation()
      }}
      onKeyDown={handleKeyDown}
      value={value}
    />
  )
}
