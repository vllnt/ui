/**
 * Functional stubs for next/* modules used in Storybook.
 *
 * Tiered approach:
 * - Passive (Link, Image): render native HTML equivalents
 * - Active (useRouter, usePathname, useSearchParams): return functional mock objects
 *
 * This file is aliased via Vite resolve in main.ts:
 *   next/link -> ./next-stubs.ts
 *   next/image -> ./next-stubs.ts
 *   next/navigation -> ./next-stubs.ts
 */
import * as React from 'react'

/* ---------- next/link ---------- */
function Link({
  href,
  children,
  ...props
}: {
  href: string
  children?: React.ReactNode
  [key: string]: unknown
}) {
  return React.createElement('a', { href: String(href), ...props }, children)
}

/* ---------- next/image ---------- */
function Image({
  src,
  alt,
  width,
  height,
  fill,
  ...props
}: {
  src: string
  alt: string
  width?: number
  height?: number
  fill?: boolean
  [key: string]: unknown
}) {
  const style = fill ? { objectFit: 'cover' as const, width: '100%', height: '100%' } : {}
  return React.createElement('img', {
    src: String(src),
    alt,
    width,
    height,
    style,
    ...props,
  })
}

/* ---------- next/navigation ---------- */
function useRouter() {
  return {
    push: (url: string) => console.log('[storybook] router.push:', url),
    replace: (url: string) => console.log('[storybook] router.replace:', url),
    back: () => console.log('[storybook] router.back'),
    forward: () => console.log('[storybook] router.forward'),
    refresh: () => {},
    prefetch: () => {},
  }
}

function usePathname(): string {
  return '/'
}

function useSearchParams(): URLSearchParams {
  return new URLSearchParams()
}

/* ---------- exports ---------- */
export default Link
export { Link, Image, useRouter, usePathname, useSearchParams }
