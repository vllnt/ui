/**
 * Functional stubs for next/* modules used in Storybook.
 *
 * Tiered approach:
 * - Passive (Link): renders a native anchor (next/image lives in next-image-stub.ts)
 * - Active (useRouter, usePathname, useSearchParams): return functional mock objects
 *
 * This file is aliased via Vite resolve in main.ts:
 *   next/link -> ./next-stubs.ts
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

/* ---------- next/navigation ---------- */

/** Set via `setMockPathname()` to test active-link states on non-root routes. */
let _mockPathname = '/'

function setMockPathname(path: string): void {
  _mockPathname = path
}

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
  return _mockPathname
}

function useSearchParams(): URLSearchParams {
  return new URLSearchParams()
}

/* ---------- exports ---------- */
export default Link
export { Link, useRouter, usePathname, useSearchParams, setMockPathname }
