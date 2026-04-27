/**
 * 'use client' Directive Check
 *
 * Verifies every component source file that uses React hooks starts with a
 * `'use client'` directive. Components without the directive crash Next.js
 * App Router consumers at SSR time (React Server Components cannot use hooks).
 *
 * Scans `src/components/**\/*.tsx` (excluding stories/tests/visual stubs) and
 * fails with exit code 1 if any file references a React hook without the
 * directive in its prologue (before any imports).
 *
 * Usage: pnpm -F @vllnt/ui check:use-client
 */

import { readFileSync, readdirSync, statSync } from 'fs'
import { dirname, join, relative } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PACKAGE_ROOT = join(__dirname, '..')
const COMPONENTS_DIR = join(PACKAGE_ROOT, 'src/components')

const REACT_HOOK_PATTERN = /\buse[A-Z][A-Za-z0-9_]*\s*\(/

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

/**
 * Removes string literals, block comments, and line comments from source so
 * that hook-like text inside those constructs does not trigger false positives.
 * Order: strings first (prevents `"/* ..."` from being eaten by block-comment
 * regex), then block comments, then line comments.
 */
export function stripNonCode(source: string): string {
  let result = source
  result = result.replace(/`(?:[^`\\]|\\.)*`/g, '``')
  result = result.replace(/"(?:[^"\\]|\\.)*"/g, '""')
  result = result.replace(/'(?:[^'\\]|\\.)*'/g, "''")
  result = result.replace(/\/\*[\s\S]*?\*\//g, (m) =>
    m.replace(/[^\n]/g, ' '),
  )
  result = result.replace(/\/\/.*/g, '')
  return result
}

/**
 * Matches lines that *start* a custom hook definition (function declaration,
 * arrow function, or function expression) so their bodies can be skipped.
 * Deliberately excludes `const useX = someHookCall(...)` assignments where
 * the RHS is a call expression rather than a function literal.
 */
const HOOK_DEF_LINE_PATTERN =
  /(?:function\s+use[A-Z][A-Za-z0-9_]*|(?:const|let|var)\s+use[A-Z][A-Za-z0-9_]*\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>|(?:const|let|var)\s+use[A-Z][A-Za-z0-9_]*\s*=\s*(?:async\s+)?function)/

/**
 * Returns true when the source file contains actual React hook *calls*,
 * excluding hook function/variable *definitions* and text in
 * comments or string literals.
 */
export function fileUsesHooks(source: string): boolean {
  const stripped = stripNonCode(source)
  let depth = 0
  let hookBodyDepth = -1
  let pendingHookDef = false

  for (const line of stripped.split(/\r?\n/)) {
    const opens = (line.match(/\{/g) ?? []).length
    const closes = (line.match(/\}/g) ?? []).length

    if (hookBodyDepth >= 0) {
      depth += opens - closes
      if (depth <= hookBodyDepth) hookBodyDepth = -1
      continue
    }

    if (pendingHookDef) {
      if (opens > closes) {
        hookBodyDepth = depth
        pendingHookDef = false
        depth += opens - closes
      } else {
        depth += opens - closes
      }
      continue
    }

    if (HOOK_DEF_LINE_PATTERN.test(line)) {
      if (opens > closes) {
        hookBodyDepth = depth
      } else {
        pendingHookDef = true
      }
      depth += opens - closes
      continue
    }

    depth += opens - closes
    const defMatch = /(?:function|const|let|var)\s+use[A-Z][A-Za-z0-9_]*/.exec(line)
    const checkLine = defMatch ? line.slice(defMatch.index + defMatch[0].length) : line
    if (REACT_HOOK_PATTERN.test(checkLine)) return true
  }

  return false
}

/**
 * Returns true when `'use client'` appears in the directive prologue — i.e.
 * before any import or non-comment code. Leading blank lines, `//` comments,
 * and `/* … *\/` block comments (including those whose body lines lack a
 * leading `*`) are skipped.
 */
export function hasUseClientDirective(source: string): boolean {
  let inBlockComment = false
  for (const raw of source.split(/\r?\n/)) {
    const trimmed = raw.trim()
    if (trimmed.length === 0) continue
    if (inBlockComment) {
      if (trimmed.includes('*/')) inBlockComment = false
      continue
    }
    if (trimmed.startsWith('//')) continue
    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) inBlockComment = true
      continue
    }
    return USE_CLIENT_PATTERN.test(trimmed)
  }
  return false
}

function main(): void {
  const files = collectTsxFiles(COMPONENTS_DIR)
  const missing: string[] = []

  for (const file of files) {
    const source = readFileSync(file, 'utf8')
    if (!fileUsesHooks(source)) continue
    if (hasUseClientDirective(source)) continue
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

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main()
}
