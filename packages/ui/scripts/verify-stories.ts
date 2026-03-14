/**
 * Story Verification Script
 *
 * Validates that all .stories.tsx files provide required props in their Default story.
 * Catches runtime crashes before they reach the browser.
 *
 * Usage: pnpm -F @vllnt/ui storybook:verify
 */

import { readdirSync, readFileSync, statSync } from 'fs'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const COMPONENTS_DIR = join(__dirname, '../src/components')

interface PropInfo {
  name: string
  type: string
  required: boolean
}

interface Violation {
  component: string
  story: string
  missingProps: string[]
  crashRisk: string
}

function extractTypeBlock(source: string, startIndex: number): string {
  let depth = 0
  let blockStart = -1
  for (let i = startIndex; i < source.length; i++) {
    if (source[i] === '{') {
      if (depth === 0) blockStart = i + 1
      depth++
    }
    if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(blockStart, i)
    }
  }
  return ''
}

function parsePropsFromBlock(block: string): PropInfo[] {
  const props: PropInfo[] = []
  const lines = block.split('\n')

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue
    const m = trimmed.match(/^(\w+)(\??)\s*:\s*(.+?)\s*;?\s*$/)
    if (m) {
      const name = m[1] ?? ''
      const required = m[2] !== '?'
      const type = (m[3] ?? '').trim().replace(/[;,]$/, '')
      if (name && type) props.push({ name, type, required })
    }
  }

  return props
}

function toPascalCase(str: string): string {
  return str.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

function extractRequiredProps(source: string, componentName: string): PropInfo[] {
  const patterns = [
    new RegExp(`(?:export\\s+)?(?:type|interface)\\s+${componentName}Props\\s*=?\\s*\\{`, 's'),
    /(?:export\s+)?(?:type|interface)\s+\w*Props\s*=?\s*\{/s,
  ]

  for (const pattern of patterns) {
    const match = source.match(pattern)
    if (match?.index !== undefined) {
      const block = extractTypeBlock(source, match.index + match[0].length - 1)
      if (block) {
        return parsePropsFromBlock(block).filter(
          (p) => p.required && !['className', 'ref', 'key', 'style'].includes(p.name)
        )
      }
    }
  }

  return []
}

function extractArgsBlock(source: string): string {
  const argsMatch = source.match(/\bargs\s*:\s*\{/)
  if (!argsMatch || argsMatch.index === undefined) return ''
  const start = argsMatch.index + argsMatch[0].length
  let depth = 1
  for (let i = start; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') {
      depth--
      if (depth === 0) return source.slice(start, i)
    }
  }
  return ''
}

function extractTopLevelKeys(block: string): Set<string> {
  const keys = new Set<string>()
  let depth = 0
  let i = 0
  while (i < block.length) {
    if (block[i] === '{' || block[i] === '[' || block[i] === '(') { depth++; i++; continue }
    if (block[i] === '}' || block[i] === ']' || block[i] === ')') { depth--; i++; continue }
    if (depth === 0) {
      const m = block.slice(i).match(/^(\w+)\s*:/)
      if (m?.[1]) {
        keys.add(m[1])
        i += m[0].length
        continue
      }
    }
    i++
  }
  return keys
}

function extractStoryArgs(storySource: string): Set<string> {
  const metaBlock = extractArgsBlock(storySource)
  return extractTopLevelKeys(metaBlock)
}

function classifyCrashRisk(prop: PropInfo): string {
  const t = prop.type.trim()
  if (t.endsWith('[]') || t.startsWith('Array<') || t.startsWith('readonly ')) return 'CRASH: .map()/.length on undefined'
  if (t.includes('=>')) return 'CRASH: callback invocation on undefined'
  if (t.startsWith('Set<')) return 'CRASH: .has()/.size on undefined'
  if (/^[A-Z]/.test(t) && !['ReactNode', 'React.ReactNode'].includes(t)) return 'CRASH: property access on undefined object'
  if (t === 'string' || t === 'number') return 'WARN: renders undefined text'
  if (t === 'boolean') return 'WARN: falsy default may hide component'
  return 'WARN: missing required prop'
}

function verify(): void {
  const violations: Violation[] = []
  let checked = 0

  const componentDirs = readdirSync(COMPONENTS_DIR).filter((dir) => {
    return statSync(join(COMPONENTS_DIR, dir)).isDirectory()
  })

  for (const dir of componentDirs) {
    const dirPath = join(COMPONENTS_DIR, dir)
    const name = toPascalCase(dir)

    const files = readdirSync(dirPath)
    const mainFile = files.find((f) => f === `${dir}.tsx`) ?? files.find((f) => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.visual.') && !f.includes('.stories.'))
    const storyFile = files.find((f) => f.endsWith('.stories.tsx'))

    if (!mainFile || !storyFile) continue
    checked++

    const source = readFileSync(join(dirPath, mainFile), 'utf-8')
    const storySource = readFileSync(join(dirPath, storyFile), 'utf-8')

    const requiredProps = extractRequiredProps(source, name)
    const providedArgs = extractStoryArgs(storySource)

    const missing = requiredProps.filter((p) => !providedArgs.has(p.name))

    if (missing.length > 0) {
      const crashProps = missing.filter((p) => classifyCrashRisk(p).startsWith('CRASH'))
      if (crashProps.length > 0) {
        violations.push({
          component: name,
          story: `${dir}/${storyFile}`,
          missingProps: crashProps.map((p) => `${p.name}: ${p.type}`),
          crashRisk: crashProps.map((p) => classifyCrashRisk(p)).join('; '),
        })
      }
    }
  }

  console.log(`\nStory Verification Report`)
  console.log(`========================`)
  console.log(`Checked: ${checked} components\n`)

  if (violations.length === 0) {
    console.log('All stories provide required props. No crash risks detected.')
    process.exit(0)
  }

  console.log(`Found ${violations.length} stories with missing required props:\n`)

  for (const v of violations) {
    console.log(`  FAIL ${v.component}`)
    for (const prop of v.missingProps) {
      console.log(`       missing: ${prop}`)
    }
    console.log('')
  }

  process.exit(1)
}

verify()
