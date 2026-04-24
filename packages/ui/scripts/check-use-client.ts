/**
 * 'use client' Directive Check
 *
 * Verifies every component source file that uses React hooks starts with a
 * `'use client'` directive. Components without the directive crash Next.js
 * App Router consumers at SSR time (React Server Components cannot use hooks).
 *
 * Scans `src/components/**\/*.tsx` (excluding stories/tests/visual stubs) and
 * fails with exit code 1 if any file references a React hook without the
 * directive on its first non-empty line.
 *
 * Usage: pnpm -F @vllnt/ui check:use-client
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_ROOT = join(__dirname, '..')
const COMPONENTS_DIR = join(PACKAGE_ROOT, 'src/components')

const REACT_HOOK_PATTERN = /\buse[A-Z][A-Za-z0-9_]*\s*\(/;

const USE_CLIENT_PATTERN = /^['"]use client['"];?\s*$/

const EXCLUDED_SUFFIXES = [
  '.stories.tsx',
  '.test.tsx',
  '.visual.tsx',
  '.spec.tsx',
]

function collectTsxFiles(dir: string, acc: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry)
    const entryStat = statSync(fullPath)
    if (entryStat.isDirectory()) {
      collectTsxFiles(fullPath, acc)
      continue
    }
    if (!entry.endsWith('.tsx')) continue
    if (EXCLUDED_SUFFIXES.some((suffix) => entry.endsWith(suffix))) continue
    acc.push(fullPath)
  }
  return acc
}

function firstCodeLine(source: string): string {
  for (const raw of source.split(/\r?\n/)) {
    const trimmed = raw.trim()
    if (trimmed.length === 0) continue
    return trimmed
  }
  return ''
}

function main(): void {
  const files = collectTsxFiles(COMPONENTS_DIR)
  const missing: string[] = []

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    if (!REACT_HOOK_PATTERN.test(source)) continue
    if (USE_CLIENT_PATTERN.test(firstCodeLine(source))) continue
    missing.push(relative(PACKAGE_ROOT, file))
  }

  if (missing.length > 0) {
    console.error(
      `Missing "use client" directive in ${missing.length} component(s) that use React hooks:\n`,
    )
    for (const path of missing) {
      console.error(`  - ${path}`)
    }
    console.error(
      '\nAdd `"use client";` as the first line of each file. See issue #137.',
    )
    process.exit(1)
  }

  console.log(
    `OK: all ${files.length} component file(s) with React hooks declare "use client".`,
  )
}

main()
