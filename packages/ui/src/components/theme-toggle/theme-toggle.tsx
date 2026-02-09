'use client'
import { useCallback, useEffect, useRef, useState } from 'react'

import { useTheme } from 'next-themes'

import { Button } from '../button/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu/dropdown-menu'

type ThemeToggleProps = {
  dict: {
    theme: {
      dark: string
      light: string
      system: string
      toggle_theme: string
    }
  }
}

type ThemeButtonProps = {
  ariaLabel: string
  children?: React.ReactNode
  icon: string
} & React.ButtonHTMLAttributes<HTMLButtonElement>

function ThemeButton({ ariaLabel, children, icon, ...props }: ThemeButtonProps) {
  return (
    <Button
      aria-label={ariaLabel}
      className="bg-background text-foreground border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
      size="icon"
      variant="outline"
      {...props}
    >
      <span className="text-sm font-mono">{icon}</span>
      <span className="sr-only">{ariaLabel}</span>
      {children}
    </Button>
  )
}

function ThemeMenuItem({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  return (
    <DropdownMenuItem className="hover:bg-accent cursor-pointer" onClick={onClick}>
      {icon} {label}
    </DropdownMenuItem>
  )
}

// eslint-disable-next-line max-lines-per-function
export function ThemeToggle({ dict }: ThemeToggleProps) {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const closeTimerReference = useRef<null | number>(null)
  const isHoveringOverMenuAreaReference = useRef(false)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerReference.current !== null) {
      window.clearTimeout(closeTimerReference.current)
      closeTimerReference.current = null
    }
  }, [])

  const scheduleClose = useCallback(() => {
    clearCloseTimer()
    closeTimerReference.current = window.setTimeout(() => {
      setOpen(false)
    }, 250)
  }, [clearCloseTimer])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!nextOpen && isHoveringOverMenuAreaReference.current) {
      return
    }
    setOpen(nextOpen)
  }, [])

  useEffect(() => {
    setMounted(true)
  }, [])

  const getThemeIcon = useCallback(() => {
    if (!mounted) return '☀'

    switch (theme) {
      case 'light':
        return '☀'
      case 'dark':
        return '☾'
      case 'system':
        return '⚙'
      case undefined:
        return '⚙'
      default:
        return '⚙'
    }
  }, [theme, mounted])

  const themeIcon = getThemeIcon()

  const handleThemeChange = useCallback(
    (newTheme: string) => {
      setTheme(newTheme)
    },
    [setTheme],
  )

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return <ThemeButton ariaLabel={dict.theme.toggle_theme} icon="☀" />
  }

  return (
    <DropdownMenu modal={false} onOpenChange={handleOpenChange} open={open}>
      <DropdownMenuTrigger asChild>
        <ThemeButton
          ariaLabel={dict.theme.toggle_theme}
          icon={themeIcon}
          onMouseEnter={() => {
            isHoveringOverMenuAreaReference.current = true
            clearCloseTimer()
            setOpen(true)
          }}
          onMouseLeave={() => {
            isHoveringOverMenuAreaReference.current = false
            scheduleClose()
          }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-background border border-gray-300 dark:border-gray-600"
        onMouseEnter={() => {
          isHoveringOverMenuAreaReference.current = true
          clearCloseTimer()
        }}
        onMouseLeave={() => {
          isHoveringOverMenuAreaReference.current = false
          scheduleClose()
        }}
      >
        <ThemeMenuItem
          icon="☀"
          label={dict.theme.light}
          onClick={() => {
            handleThemeChange('light')
          }}
        />
        <ThemeMenuItem
          icon="☾"
          label={dict.theme.dark}
          onClick={() => {
            handleThemeChange('dark')
          }}
        />
        <ThemeMenuItem
          icon="⚙"
          label={dict.theme.system}
          onClick={() => {
            handleThemeChange('system')
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
