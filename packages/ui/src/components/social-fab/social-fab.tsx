'use client'

import { useCallback } from 'react'

import { cn } from '../../lib/utils'

import { useSocialFab, type UseSocialFabOptions } from './use-social-fab'

export type SharePlatformConfig = {
  buildUrl: (pageUrl: string, pageTitle: string) => string
  key: string
  label: string
}

export type SocialFabActionConfig = {
  id: string
  label: string
  onClick: () => void
}

export type SocialFabLabels = {
  close: string
  share: string
}

export type SocialFabProps = {
  actions: SocialFabActionConfig[]
  /** Bottom offset in pixels (default: 24) - use higher value to avoid overlapping fixed bars */
  bottomOffset?: number
  /** Hide the FAB (e.g., when footer is visible) */
  hidden?: boolean
  labels: SocialFabLabels
  /** Main button text (default: ⋯) */
  mainText?: string
  onAction?: (actionId: string) => void
  onClose?: (trigger: string) => void
  onOpen?: (trigger: string, device: string) => void
  /** Right offset in pixels (default: 24) */
  rightOffset?: number
  sharePlatforms?: SharePlatformConfig[]
}

function ShareMenu({
  onPlatformSelect,
  platforms,
}: {
  onPlatformSelect: (key: string) => void
  platforms: SharePlatformConfig[]
}) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-gray-300 bg-background p-1.5 shadow-md dark:border-gray-600">
      {platforms.map((p) => {
        const handleClick = () => {
          onPlatformSelect(p.key)
        }
        return (
          <button
            className="rounded px-3 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            key={p.key}
            onClick={handleClick}
            type="button"
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}

function ActionButton({ action }: { action: SocialFabActionConfig }) {
  const handleClick = action.onClick
  return (
    <button
      className="rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent"
      onClick={handleClick}
      type="button"
    >
      {action.label}
    </button>
  )
}

function ActionPanel({
  actions,
  isMobile,
  onShareHover,
  onShareLeave,
  shareLabel,
}: {
  actions: SocialFabActionConfig[]
  isMobile: boolean
  onShareHover: () => void
  onShareLeave: () => void
  shareLabel: string
}) {
  const shareAction = actions.find((a) => a.id === 'share')
  const otherActions = actions.filter((a) => a.id !== 'share')
  const handleShareClick = shareAction?.onClick
  const handleShareMouseEnter = isMobile ? undefined : onShareHover
  const handleShareMouseLeave = isMobile ? undefined : onShareLeave

  return (
    <div className="flex flex-col gap-0.5 rounded-md border border-gray-300 bg-background p-1.5 shadow-md dark:border-gray-600">
      {shareAction ? (
        <button
          className="rounded px-3 py-1.5 text-left text-sm transition-colors hover:bg-accent"
          onClick={handleShareClick}
          onMouseEnter={handleShareMouseEnter}
          onMouseLeave={handleShareMouseLeave}
          type="button"
        >
          {shareLabel}
        </button>
      ) : null}
      {otherActions.map((action) => (
        <ActionButton action={action} key={action.id} />
      ))}
    </div>
  )
}

function MainFabButton({
  isExpanded,
  isMobile,
  labels,
  mainText,
  onToggle,
}: {
  isExpanded: boolean
  isMobile: boolean
  labels: SocialFabLabels
  mainText: string
  onToggle: () => void
}) {
  const handleClick = onToggle
  return (
    <button
      aria-expanded={isExpanded}
      aria-label={isExpanded ? labels.close : labels.share}
      className={cn(
        'flex size-10 items-center justify-center rounded-md',
        'border border-gray-300 bg-background dark:border-gray-600',
        'transition-all duration-200 ease-out',
        'hover:-translate-y-0.5 hover:border-gray-400 hover:shadow-md dark:hover:border-gray-500',
      )}
      onClick={handleClick}
      type="button"
    >
      <span className="text-sm font-mono">{isMobile && isExpanded ? '✕' : mainText}</span>
    </button>
  )
}

function Backdrop({ onClose }: { onClose: () => void }) {
  return <div aria-hidden="true" className="fixed inset-0 z-40 bg-black/10" onClick={onClose} />
}

function ExpandedPanel({
  actions,
  fab,
  labels,
  onPlatformSelect,
  sharePlatforms,
}: {
  actions: SocialFabActionConfig[]
  fab: ReturnType<typeof useSocialFab>
  labels: SocialFabLabels
  onPlatformSelect: (key: string) => void
  sharePlatforms: SharePlatformConfig[]
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 transition-all duration-200 ease-out',
        fab.state.isExpanded
          ? 'translate-y-0 opacity-100'
          : 'pointer-events-none translate-y-2 opacity-0',
      )}
    >
      {fab.state.showShareMenu && sharePlatforms.length > 0 ? (
        <div onMouseEnter={fab.handleShareHover} onMouseLeave={fab.handleShareLeave}>
          <ShareMenu onPlatformSelect={onPlatformSelect} platforms={sharePlatforms} />
        </div>
      ) : null}
      <ActionPanel
        actions={actions}
        isMobile={fab.state.isMobile}
        onShareHover={fab.handleShareHover}
        onShareLeave={fab.handleShareLeave}
        shareLabel={labels.share}
      />
    </div>
  )
}

export function SocialFAB({
  actions,
  bottomOffset = 24,
  hidden = false,
  labels,
  mainText = '⋯',
  onAction,
  onClose,
  onOpen,
  rightOffset = 24,
  sharePlatforms = [],
}: SocialFabProps) {
  const options: UseSocialFabOptions = { onAction, onClose, onOpen }
  const fab = useSocialFab(options)

  const handleBackdrop = useCallback(() => {
    fab.close('backdrop')
  }, [fab])
  const handlePlatformSelect = useCallback(
    (key: string) => {
      const platform = sharePlatforms.find((p) => p.key === key)
      if (platform) {
        window.open(
          platform.buildUrl(window.location.href, document.title),
          '_blank',
          'noopener,noreferrer',
        )
      }
    },
    [sharePlatforms],
  )

  if (hidden) return null

  return (
    <>
      {fab.state.isMobile && fab.state.isExpanded ? <Backdrop onClose={handleBackdrop} /> : null}
      <div
        className="fixed z-50 flex flex-col items-end gap-2"
        onMouseEnter={fab.handleMouseEnter}
        onMouseLeave={fab.handleMouseLeave}
        style={{ bottom: `${bottomOffset}px`, right: `${rightOffset}px` }}
      >
        <ExpandedPanel
          actions={actions}
          fab={fab}
          labels={labels}
          onPlatformSelect={handlePlatformSelect}
          sharePlatforms={sharePlatforms}
        />
        <MainFabButton
          isExpanded={fab.state.isExpanded}
          isMobile={fab.state.isMobile}
          labels={labels}
          mainText={mainText}
          onToggle={fab.handleToggle}
        />
      </div>
    </>
  )
}
