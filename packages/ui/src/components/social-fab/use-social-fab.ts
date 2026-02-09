'use client'

import { useCallback, useEffect, useState } from 'react'

export type SocialFabState = {
  isExpanded: boolean
  isMobile: boolean
  showShareMenu: boolean
}

export type UseSocialFabOptions = {
  onAction?: (actionId: string) => void
  onClose?: (trigger: string) => void
  onOpen?: (trigger: string, device: string) => void
}

export type SocialFabHandlers = {
  close: (trigger: string) => void
  handleMouseEnter: () => void
  handleMouseLeave: () => void
  handleShareToggle: () => void
  handleToggle: () => void
}

function useMobileDetect() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => {
      window.removeEventListener('resize', check)
    }
  }, [])
  return isMobile
}

function useExpansion(options: UseSocialFabOptions, isMobile: boolean) {
  const { onClose, onOpen } = options
  const [isExpanded, setIsExpanded] = useState(false)

  const close = useCallback(
    (trigger: string) => {
      setIsExpanded(false)
      onClose?.(trigger)
    },
    [onClose],
  )

  const open = useCallback(
    (trigger: string, device: string) => {
      setIsExpanded(true)
      onOpen?.(trigger, device)
    },
    [onOpen],
  )

  const handleToggle = useCallback(() => {
    const device = isMobile ? 'mobile' : 'desktop'
    if (isExpanded) close('tap_close')
    else open('tap', device)
  }, [isMobile, isExpanded, close, open])

  const handleMouseEnter = useCallback(() => {
    if (!isMobile) open('hover', 'desktop')
  }, [isMobile, open])

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) close('hover_leave')
  }, [isMobile, close])

  return { close, handleMouseEnter, handleMouseLeave, handleToggle, isExpanded }
}

function useShareMenu(onAction?: (actionId: string) => void, isMobile?: boolean) {
  const [showShareMenu, setShowShareMenu] = useState(false)

  const handleShareToggle = useCallback(() => {
    setShowShareMenu((previous) => {
      if (!previous) onAction?.('share')
      return !previous
    })
  }, [onAction])

  const handleShareHover = useCallback(() => {
    if (!isMobile) {
      onAction?.('share')
      setShowShareMenu(true)
    }
  }, [isMobile, onAction])

  const handleShareLeave = useCallback(() => {
    if (!isMobile) {
      setShowShareMenu(false)
    }
  }, [isMobile])

  const reset = useCallback(() => {
    setShowShareMenu(false)
  }, [])

  return { handleShareHover, handleShareLeave, handleShareToggle, reset, showShareMenu }
}

export function useSocialFab(options: UseSocialFabOptions = {}) {
  const isMobile = useMobileDetect()
  const expansion = useExpansion(options, isMobile)
  const shareMenu = useShareMenu(options.onAction, isMobile)

  const close = useCallback(
    (trigger: string) => {
      expansion.close(trigger)
      shareMenu.reset()
    },
    [expansion, shareMenu],
  )

  return {
    close,
    handleMouseEnter: expansion.handleMouseEnter,
    handleMouseLeave: expansion.handleMouseLeave,
    handleShareHover: shareMenu.handleShareHover,
    handleShareLeave: shareMenu.handleShareLeave,
    handleShareToggle: shareMenu.handleShareToggle,
    handleToggle: expansion.handleToggle,
    state: { isExpanded: expansion.isExpanded, isMobile, showShareMenu: shareMenu.showShareMenu },
  }
}
