'use client'

import { Menu, X } from 'lucide-react'

import { cn } from '../../../lib/utils'

export type SidebarToggleProps = {
  className?: string
  /** Called when toggle is clicked. */
  onToggle: () => void
  /** Whether the sidebar is currently open. */
  open: boolean
}

/** Responsive sidebar toggle button that shows Menu/X icons based on state. */
export function SidebarToggle({ className, onToggle, open }: SidebarToggleProps) {
  const buttonClass = cn(
    'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors',
    'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
    'disabled:pointer-events-none disabled:opacity-50',
    'hover:bg-accent hover:text-accent-foreground',
    'h-9 w-9',
    className
  )

  return (
    <>
      {/* Mobile: shows X when open, Menu when closed */}
      <button className={cn(buttonClass, 'lg:hidden')} onClick={onToggle} type="button">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      {/* Desktop: always shows Menu icon */}
      <button className={cn(buttonClass, 'hidden lg:flex')} onClick={onToggle} type="button">
        <Menu className="h-5 w-5" />
      </button>
    </>
  )
}
