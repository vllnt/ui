/**
 * Story Fixer Script
 *
 * Analyzes component source to extract required props and their types,
 * then patches .stories.tsx files with proper default args.
 *
 * Usage: pnpm -F @vllnt/ui storybook:fix-stories [--dry-run]
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
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

interface TypeDef {
  name: string
  fields: PropInfo[]
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
  for (const line of block.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue
    const m = trimmed.match(/^(\w+)(\??)\s*:\s*(.+?)\s*;?\s*$/)
    if (m?.[1] && m[3]) {
      props.push({ name: m[1], type: m[3].replace(/[;,]$/, '').trim(), required: m[2] !== '?' })
    }
  }
  return props
}

function extractAllTypes(source: string): TypeDef[] {
  const types: TypeDef[] = []
  const re = /(?:export\s+)?type\s+(\w+)\s*=\s*\{/g
  let m
  while ((m = re.exec(source)) !== null) {
    if (!m[1]) continue
    const block = extractTypeBlock(source, m.index + m[0].length - 1)
    if (block) types.push({ name: m[1], fields: parsePropsFromBlock(block) })
  }
  return types
}

function toPascalCase(str: string): string {
  return str.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('')
}

function generateValue(prop: PropInfo, allTypes: TypeDef[], indent: number): string {
  const pad = ' '.repeat(indent)
  const t = prop.type.trim()

  if (t.includes('=>') || t.startsWith('(')) {
    const argsMatch = t.match(/\(([^)]*)\)/)
    if (argsMatch?.[1]) {
      const params = argsMatch[1].trim()
      if (params === '') return '() => {}'
      return `(${params.split(',').map((p) => p.split(':')[0]?.trim() ?? '_').join(', ')}) => {}`
    }
    return '() => {}'
  }

  if (t === 'boolean') return 'false'
  if (t === 'number') return '0'
  if (t === 'string') {
    if (prop.name.includes('title') || prop.name.includes('Title')) return '"Example Title"'
    if (prop.name.includes('label') || prop.name.includes('Label')) return '"Label"'
    if (prop.name.includes('question')) return '"What is this?"'
    if (prop.name.includes('description')) return '"A description"'
    if (prop.name.includes('href') || prop.name.includes('url') || prop.name.includes('Url')) return '"#"'
    if (prop.name.includes('id') || prop.name.includes('Id')) return '"1"'
    if (prop.name.includes('query') || prop.name.includes('Query')) return '""'
    if (prop.name.includes('lang')) return '"en"'
    return `"${prop.name}"`
  }
  if (t === 'ReactNode' || t === 'React.ReactNode') return '"Content"'

  if (t.startsWith('Set<')) return 'new Set()'

  if (t === 'string[]') return '["example"]'
  if (t.startsWith('readonly ') && t.endsWith('[]')) {
    const itemType = t.replace(/^readonly\s+/, '').replace(/\[\]$/, '')
    return generateArrayValue(itemType, allTypes, indent)
  }
  if (t.endsWith('[]')) {
    const itemType = t.replace(/\[\]$/, '')
    return generateArrayValue(itemType, allTypes, indent)
  }

  if (t.includes('|')) {
    const parts = t.split('|').map((p) => p.trim())
    const stringLiteral = parts.find((p) => p.startsWith('"') || p.startsWith("'"))
    if (stringLiteral) return stringLiteral
    const first = parts[0] ?? ''
    if (first === 'string') return '""'
    if (first === 'number') return '0'
    if (first === 'boolean') return 'false'
    return '""'
  }

  const typeDef = allTypes.find((td) => td.name === t)
  if (typeDef) return generateObjectValue(typeDef, allTypes, indent)

  if (/^[A-Z]/.test(t)) {
    return `{} as ${t}`
  }

  return '""'
}

function generateArrayValue(itemType: string, allTypes: TypeDef[], indent: number): string {
  const pad = ' '.repeat(indent)
  const typeDef = allTypes.find((td) => td.name === itemType)
  if (typeDef) {
    const objVal = generateObjectValue(typeDef, allTypes, indent + 2)
    return `[${objVal}]`
  }
  if (itemType === 'string') return '["example"]'
  if (itemType === 'number') return '[0]'
  return '[]'
}

function generateObjectValue(typeDef: TypeDef, allTypes: TypeDef[], indent: number): string {
  const pad = ' '.repeat(indent)
  const innerPad = ' '.repeat(indent + 2)
  const fields: string[] = []

  for (const field of typeDef.fields) {
    if (!field.required && field.name !== 'id' && field.name !== 'label' && field.name !== 'title' && field.name !== 'name') continue
    const val = generateValue(field, allTypes, indent + 2)
    fields.push(`${innerPad}${field.name}: ${val},`)
  }

  if (fields.length === 0) {
    for (const field of typeDef.fields.slice(0, 3)) {
      const val = generateValue(field, allTypes, indent + 2)
      fields.push(`${innerPad}${field.name}: ${val},`)
    }
  }

  return `{\n${fields.join('\n')}\n${pad}}`
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
          (p) => p.required && !['className', 'ref', 'key', 'style', 'children'].includes(p.name)
        )
      }
    }
  }

  return []
}

function extractStoryArgs(storySource: string): Set<string> {
  const args = new Set<string>()
  const metaArgs = storySource.match(/(?:^|\n)\s*args\s*:\s*\{([^}]*)\}/s)
  if (metaArgs?.[1]) {
    for (const k of metaArgs[1].matchAll(/(\w+)\s*:/g)) {
      if (k[1]) args.add(k[1])
    }
  }
  return args
}

function isCrashRisk(prop: PropInfo): boolean {
  const t = prop.type.trim()
  if (t.endsWith('[]') || t.startsWith('Array<') || t.startsWith('readonly ')) return true
  if (t.includes('=>')) return true
  if (t.startsWith('Set<')) return true
  if (/^[A-Z]/.test(t) && !['ReactNode', 'React.ReactNode'].includes(t)) return true
  return false
}

function patchStory(storySource: string, argsToAdd: Record<string, string>): string {
  const argEntries = Object.entries(argsToAdd)
  if (argEntries.length === 0) return storySource

  const argsBlock = argEntries.map(([k, v]) => `    ${k}: ${v},`).join('\n')

  const metaArgsMatch = storySource.match(/(args\s*:\s*\{)([^}]*)(})/s)
  if (metaArgsMatch) {
    const existing = metaArgsMatch[2] ?? ''
    const newArgs = existing.trimEnd() + '\n' + argsBlock + '\n  '
    return storySource.replace(metaArgsMatch[0], `${metaArgsMatch[1]}${newArgs}${metaArgsMatch[3]}`)
  }

  const metaMatch = storySource.match(/(const\s+meta\s*=\s*\{)\s*\n/)
  if (metaMatch?.index !== undefined) {
    const insertPos = metaMatch.index + metaMatch[0].length
    const argsInsert = `  args: {\n${argsBlock}\n  },\n`
    return storySource.slice(0, insertPos) + argsInsert + storySource.slice(insertPos)
  }

  return storySource
}

function main(): void {
  const dryRun = process.argv.includes('--dry-run')
  let fixed = 0
  let skipped = 0

  const componentDirs = readdirSync(COMPONENTS_DIR).filter((dir) =>
    statSync(join(COMPONENTS_DIR, dir)).isDirectory()
  )

  for (const dir of componentDirs) {
    const dirPath = join(COMPONENTS_DIR, dir)
    const name = toPascalCase(dir)
    const files = readdirSync(dirPath)
    const mainFile = files.find((f) => f === `${dir}.tsx`) ?? files.find((f) =>
      f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.visual.') && !f.includes('.stories.')
    )
    const storyFileName = files.find((f) => f.endsWith('.stories.tsx'))
    if (!mainFile || !storyFileName) continue

    const source = readFileSync(join(dirPath, mainFile), 'utf-8')
    const storyPath = join(dirPath, storyFileName)
    const storySource = readFileSync(storyPath, 'utf-8')
    const allTypes = extractAllTypes(source)
    const requiredProps = extractRequiredProps(source, name)
    const providedArgs = extractStoryArgs(storySource)

    const missing = requiredProps.filter((p) => !providedArgs.has(p.name) && isCrashRisk(p))

    if (missing.length === 0) {
      skipped++
      continue
    }

    const argsToAdd: Record<string, string> = {}
    for (const prop of missing) {
      argsToAdd[prop.name] = generateValue(prop, allTypes, 4)
    }

    if (dryRun) {
      console.log(`  WOULD FIX ${name}:`)
      for (const [k, v] of Object.entries(argsToAdd)) {
        console.log(`    + ${k}: ${v}`)
      }
      fixed++
      continue
    }

    const patched = patchStory(storySource, argsToAdd)

    let cleanedArgs = storySource.match(/args\s*:\s*\{[^}]*children\s*:\s*"[^"]*"[^}]*\}/s)
    let finalSource = patched
    if (cleanedArgs) {
      const childrenPropInComponent = requiredProps.some((p) => p.name === 'children') ||
        source.includes('{children}')
      if (!childrenPropInComponent) {
        finalSource = finalSource.replace(/\s*children\s*:\s*"[^"]*",?\n?/g, '\n')
      }
    }

    writeFileSync(storyPath, finalSource)
    console.log(`  FIXED ${name}: added ${Object.keys(argsToAdd).join(', ')}`)
    fixed++
  }

  console.log(`\nSummary: ${fixed} fixed, ${skipped} ok`)
}

main()
