'use client'

import { memo } from 'react'

import { Check, Copy, Loader2, Maximize2, Minus, Move, Plus, X } from 'lucide-react'

import { cn } from '../../lib/utils'

import type { CopyStatus, FlowControlsProps } from './types'

const BUTTON_CLASS =
  'flex h-8 w-8 items-center justify-center rounded hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed'

type ControlButtonProps = {
  disabled?: boolean
  icon: React.ReactNode
  label: string
  onClick: () => void
  title: string
}

function ControlButton({ disabled, icon, label, onClick, title }: ControlButtonProps) {
  return (
    <button
      aria-label={label}
      className={BUTTON_CLASS}
      disabled={disabled}
      onClick={onClick}
      title={title}
      type="button"
    >
      {icon}
    </button>
  )
}

function getCopyIcon(status: CopyStatus | undefined) {
  switch (status) {
    case 'copying':
      return <Loader2 className="h-4 w-4 animate-spin" />
    case 'success':
      return <Check className="h-4 w-4 text-green-500" />
    case 'error':
      return <X className="h-4 w-4 text-destructive" />
    case 'idle':
    case undefined:
      return <Copy className="h-4 w-4" />
  }
}

function getCopyTitle(status: CopyStatus | undefined): string {
  switch (status) {
    case 'copying':
      return 'Copying...'
    case 'success':
      return 'Copied!'
    case 'error':
      return 'Copy failed'
    case 'idle':
    case undefined:
      return 'Copy as image'
  }
}

export const FlowControls = memo(function FlowControls({
  className,
  copyStatus,
  onCopy,
  onFitView,
  onFullscreen,
  onZoomIn,
  onZoomOut,
  showCopy = false,
  showFullscreen = false,
}: FlowControlsProps) {
  return (
    <div
      className={cn(
        'absolute bottom-4 left-4 z-10 flex flex-col gap-1 rounded-md border border-border bg-background/90 p-1 backdrop-blur-sm',
        className,
      )}
    >
      <ControlButton
        icon={<Plus className="h-4 w-4" />}
        label="Zoom in"
        onClick={onZoomIn}
        title="Zoom in"
      />
      <ControlButton
        icon={<Minus className="h-4 w-4" />}
        label="Zoom out"
        onClick={onZoomOut}
        title="Zoom out"
      />
      <div className="h-px bg-border" />
      <ControlButton
        icon={<Move className="h-4 w-4" />}
        label="Fit view"
        onClick={onFitView}
        title="Fit view"
      />
      {showCopy && onCopy ? (
        <>
          <div className="h-px bg-border" />
          <ControlButton
            disabled={copyStatus === 'copying'}
            icon={getCopyIcon(copyStatus)}
            label={getCopyTitle(copyStatus)}
            onClick={onCopy}
            title={getCopyTitle(copyStatus)}
          />
        </>
      ) : null}
      {showFullscreen && onFullscreen ? (
        <>
          <div className="h-px bg-border" />
          <ControlButton
            icon={<Maximize2 className="h-4 w-4" />}
            label="Fullscreen"
            onClick={onFullscreen}
            title="Toggle fullscreen"
          />
        </>
      ) : null}
    </div>
  )
})
