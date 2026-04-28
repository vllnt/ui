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

const REACT_HOOK_PATTERN =
  /\b(?:[A-Za-z_$][A-Za-z0-9_$]*\s*\.\s*)?use[A-Z][A-Za-z0-9_]*(?:\s*<[^\n(]*>)?\s*\(/

const USE_CLIENT_PATTERN = /^['"]use client['"];?$/

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
 * Replaces a matched template literal with its `${...}` expression contents,
 * blanking the literal text portions while preserving newlines so line
 * counting is unaffected. Hook calls embedded inside expressions remain
 * detectable by downstream scanning.
 */
function stripTemplateLiteral(literal: string): string {
  let out = ''
  let i = 0
  while (i < literal.length) {
    const ch = literal[i]
    if (ch === '\\' && i + 1 < literal.length) {
      out += literal[i + 1] === '\n' ? ' \n' : '  '
      i += 2
      continue
    }
    if (ch === '$' && literal[i + 1] === '{') {
      let depth = 1
      let j = i + 2
      while (j < literal.length && depth > 0) {
        const c = literal[j]
        if (c === '{') depth++
        else if (c === '}') {
          depth--
          if (depth === 0) break
        }
        j++
      }
      out += '  ' + literal.slice(i + 2, j) + ' '
      i = j + 1
      continue
    }
    out += ch === '\n' ? '\n' : ' '
    i++
  }
  return out
}

/**
 * Removes string literals, block comments, and line comments from source so
 * that hook-like text inside those constructs does not trigger false positives.
 * Template literals retain their `${...}` expression contents because hook
 * calls inside interpolations are real code. Order: strings first (prevents
 * `"/* ..."` from being eaten by block-comment regex), then block comments,
 * then line comments.
 */
export function stripNonCode(source: string): string {
  let result = source
  result = result.replace(/`(?:[^`\\]|\\.)*`/g, stripTemplateLiteral)
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
  /(?:function\s+use[A-Z][A-Za-z0-9_]*|(?:const|let|var)\s+use[A-Z][A-Za-z0-9_]*(?:\s*:\s*[^=]+?)?\s*=\s*(?:async\s+)?(?:<[^>]*>\s*)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)(?:\s*:\s*[^=]+?)?\s*=>|(?:const|let|var)\s+use[A-Z][A-Za-z0-9_]*(?:\s*:\s*[^=]+?)?\s*=\s*(?:async\s+)?function)/

/**
 * Matches arrow hook definitions whose expression body is on the same line
 * (e.g. `const useFoo = () => useBar()`). Used to avoid leaving the parser
 * in a "waiting for body" state after a complete one-line definition.
 */
const ARROW_INLINE_BODY_PATTERN = /=>\s*[^\s{]/
const SPLIT_HOOK_ASSIGNMENT_PATTERN =
  /(?:const|let|var)\s+use[A-Z][A-Za-z0-9_]*(?:\s*:\s*[^=]+?)?\s*=\s*$/
const HOOK_DEF_CONTINUATION_PATTERN =
  /^(?:async\s+)?(?:<[^>]*>\s*)?(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)(?:\s*:\s*[^=]+?)?\s*=>|^(?:async\s+)?function\b/

/**
 * Collapses newlines inside the type-argument list of a hook call (e.g.
 * `useState<\n  "left" | "right" | null\n>(null)`) onto a single line so
 * the per-line scanner can match it via `REACT_HOOK_PATTERN`. Preserves
 * total newline count by appending the elided newlines after the call so
 * downstream depth tracking and line numbers remain consistent. The
 * `[^()]` inner class purposefully excludes parens so only the type-arg
 * span is collapsed; surrounding code is untouched.
 */
export function collapseMultilineGenericHookCalls(source: string): string {
  return source.replace(
    /(\b(?:[A-Za-z_$][A-Za-z0-9_$]*\s*\.\s*)?use[A-Z][A-Za-z0-9_]*\s*<)([^()]*?)(>\s*\()/g,
    (match, prefix: string, inner: string, suffix: string) => {
      if (!inner.includes('\n')) return match
      const newlines = inner.match(/\n/g)?.length ?? 0
      return prefix + inner.replace(/\n/g, ' ') + suffix + '\n'.repeat(newlines)
    },
  )
}

/**
 * Returns true when the source file contains actual React hook *calls*,
 * excluding hook function/variable *definitions* and text in
 * comments or string literals.
 */
export function fileUsesHooks(source: string): boolean {
  const stripped = collapseMultilineGenericHookCalls(stripNonCode(source))
  let depth = 0
  let hookBodyDepth = -1
  let pendingHookDef = false
  let pendingArrowHookDef = false
  let pendingHookAssignment = false

  for (const line of stripped.split(/\r?\n/)) {
    const trimmed = line.trim()
    const opens = (line.match(/\{/g) ?? []).length
    const closes = (line.match(/\}/g) ?? []).length

    if (hookBodyDepth >= 0) {
      depth += opens - closes
      if (depth <= hookBodyDepth) hookBodyDepth = -1
      continue
    }

    if (pendingHookAssignment) {
      if (trimmed.length === 0) continue
      pendingHookAssignment = false
      if (HOOK_DEF_CONTINUATION_PATTERN.test(trimmed)) {
        pendingHookDef = true
        pendingArrowHookDef = trimmed.includes('=>')
      }
    }

    if (pendingHookDef) {
      if (opens > closes) {
        hookBodyDepth = depth
        pendingHookDef = false
        pendingArrowHookDef = false
        depth += opens - closes
      } else {
        depth += opens - closes
        if (opens > 0 && opens === closes && trimmed.length > 0) {
          pendingHookDef = false
          pendingArrowHookDef = false
        } else if (pendingArrowHookDef && trimmed.length > 0) {
          pendingHookDef = false
          pendingArrowHookDef = false
        }
      }
      continue
    }

    if (HOOK_DEF_LINE_PATTERN.test(line)) {
      const inlineBody = ARROW_INLINE_BODY_PATTERN.test(line)
      const isArrowHookDef = line.includes('=>')
      const balancedBraces = opens > 0 && opens === closes
      if (opens > closes) {
        hookBodyDepth = depth
      } else if (!inlineBody && !balancedBraces) {
        pendingHookDef = true
        pendingArrowHookDef = isArrowHookDef
      }
      depth += opens - closes
      continue
    }

    if (SPLIT_HOOK_ASSIGNMENT_PATTERN.test(trimmed)) {
      pendingHookAssignment = true
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
    let trimmed = raw.trim()
    if (trimmed.length === 0) continue

    if (inBlockComment) {
      const blockEnd = trimmed.indexOf('*/')
      if (blockEnd === -1) continue
      inBlockComment = false
      trimmed = trimmed.slice(blockEnd + 2).trim()
      if (trimmed.length === 0) continue
    }

    if (trimmed.startsWith('//')) continue

    while (trimmed.startsWith('/*')) {
      const blockEnd = trimmed.indexOf('*/')
      if (blockEnd === -1) {
        inBlockComment = true
        trimmed = ''
        break
      }
      trimmed = trimmed.slice(blockEnd + 2).trim()
      if (trimmed.length === 0) break
    }

    if (trimmed.length === 0) continue

    const directiveCandidate = trimmed
      .replace(/\s*\/\/.*$/, '')
      .replace(/\s*\/\*.*\*\/\s*$/, '')
      .trim()
    return USE_CLIENT_PATTERN.test(directiveCandidate)
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
