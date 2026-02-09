'use client'

import { Menu, X } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from '../button'

export type SidebarToggleProps = {
  className?: string
  /** Called when user clicks the toggle. */
  onToggle: () => void
  /** Whether the sidebar is open. */
  open: boolean
}

/** Responsive sidebar toggle button that shows Menu/X icons based on state. */
export function SidebarToggle({ className, onToggle, open }: SidebarToggleProps) {
  return (
    <>
      {/* Mobile: shows X when open, Menu when closed */}
      <Button className={cn('lg:hidden', className)} onClick={onToggle} size="icon" variant="ghost">
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>
      {/* Desktop: always shows Menu icon */}
      <Button
        className={cn('hidden lg:flex', className)}
        onClick={onToggle}
        size="icon"
        variant="ghost"
      >
        <Menu className="h-5 w-5" />
      </Button>
    </>
  )
}
