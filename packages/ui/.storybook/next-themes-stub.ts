/**
 * Stub for next-themes used in Storybook.
 * Provides a functional useTheme hook and ThemeProvider wrapper.
 *
 * Aliased via Vite resolve in main.ts:
 *   next-themes -> ./next-themes-stub.ts
 */
import * as React from 'react'

function useTheme() {
  return {
    theme: 'light',
    setTheme: (theme: string) => console.log('[storybook] setTheme:', theme),
    resolvedTheme: 'light',
    themes: ['light', 'dark', 'system'],
    systemTheme: 'light' as const,
  }
}

function ThemeProvider({ children }: { children?: React.ReactNode }) {
  return React.createElement(React.Fragment, null, children)
}

export { useTheme, ThemeProvider }
