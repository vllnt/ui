/**
 * Story Generator Script
 *
 * Generates Storybook story files (.stories.tsx) for all components.
 * Extracts CVA variants automatically to create Controls.
 *
 * Usage: pnpm -F @vllnt/ui storybook:generate
 *
 * Options:
 *   --force  Overwrite existing stories (skips files with "// manual" header)
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENTS_DIR = join(__dirname, '../src/components')
const REGISTRY_PATH = join(__dirname, '../../../apps/registry/registry.json')

function loadCategoryMap(): Record<string, string> {
  try {
    const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as { items: { name: string; category?: string; type: string }[] }
    const map: Record<string, string> = {}
    for (const item of raw.items) {
      if (item.type === 'registry:component' && item.category) {
        map[item.name] = item.category.charAt(0).toUpperCase() + item.category.slice(1)
      }
    }
    return map
  } catch {
    return {}
  }
}

const CATEGORY_MAP = loadCategoryMap()

interface VariantInfo {
  name: string
  values: string[]
  defaultValue?: string
}

interface ComponentInfo {
  name: string
  fileName: string
  dirName: string
  filePath: string
  hasVariants: boolean
  variants: VariantInfo[]
  exports: string[]
  needsChildren: boolean
}

function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

function extractVariants(source: string): VariantInfo[] {
  const variants: VariantInfo[] = []
  if (!source.includes('cva(')) return variants

  const defaultsMatch = source.match(/defaultVariants\s*:\s*\{([^}]+)\}/s)
  const defaults: Record<string, string> = {}
  if (defaultsMatch?.[1]) {
    const defaultsStr = defaultsMatch[1]
    const defaultPairs = defaultsStr.matchAll(/(\w+)\s*:\s*['"](\w+)['"]/g)
    for (const match of defaultPairs) {
      if (match[1] && match[2]) {
        defaults[match[1]] = match[2]
      }
    }
  }

  const variantsStartMatch = source.match(/variants\s*:\s*\{/)
  if (!variantsStartMatch || variantsStartMatch.index === undefined) return variants

  const variantsStartPos = variantsStartMatch.index + variantsStartMatch[0].length
  let depth = 1
  let variantsEndPos = variantsStartPos

  for (let i = variantsStartPos; i < source.length; i++) {
    if (source[i] === '{') depth++
    if (source[i] === '}') {
      depth--
      if (depth === 0) {
        variantsEndPos = i
        break
      }
    }
  }

  const variantsBlock = source.slice(variantsStartPos, variantsEndPos)
  const variantTypeRegex = /(\w+)\s*:\s*\{/g
  let typeMatch

  while ((typeMatch = variantTypeRegex.exec(variantsBlock)) !== null) {
    const variantName = typeMatch[1]
    const typeStartPos = typeMatch.index + typeMatch[0].length
    let typeDepth = 1
    let typeEndPos = typeStartPos

    for (let i = typeStartPos; i < variantsBlock.length; i++) {
      if (variantsBlock[i] === '{') typeDepth++
      if (variantsBlock[i] === '}') {
        typeDepth--
        if (typeDepth === 0) {
          typeEndPos = i
          break
        }
      }
    }

    const typeContent = variantsBlock.slice(typeStartPos, typeEndPos)
    const values: string[] = []
    const keyRegex = /(\w+)\s*:\s*['"`,]/g
    let keyMatch

    while ((keyMatch = keyRegex.exec(typeContent)) !== null) {
      if (keyMatch[1]) values.push(keyMatch[1])
    }

    if (values.length > 0 && variantName) {
      variants.push({
        name: variantName,
        values,
        defaultValue: defaults[variantName],
      })
    }
  }

  return variants
}

function extractExports(source: string): string[] {
  const exports: string[] = []

  const namedExports = source.matchAll(/export\s*\{\s*([^}]+)\s*\}/g)
  for (const match of namedExports) {
    if (!match[1]) continue
    const names = match[1].split(',').map((n) => n.trim().split(' ')[0] ?? '')
    exports.push(...names.filter((n) => n.length > 0 && /^[A-Z]/.test(n)))
  }

  const constExports = source.matchAll(/export\s+(?:const|function)\s+([A-Z]\w+)/g)
  for (const match of constExports) {
    if (match[1]) exports.push(match[1])
  }

  const defaultExport = source.match(/export\s+default\s+([A-Z]\w+)/)
  if (defaultExport?.[1]) {
    exports.push(defaultExport[1])
  }

  return [...new Set(exports)]
}

const CHILDREN_COMPONENTS = new Set([
  'Button', 'Badge', 'Label', 'Card', 'Accordion', 'Tabs', 'Dialog',
  'DropdownMenu', 'Command', 'Callout', 'ProTip', 'KeyConcept',
  'TldrSection', 'LearningObjectives', 'Checklist', 'StepByStep',
  'Comparison', 'Faq', 'Exercise', 'Quiz', 'Alert', 'AlertDialog',
  'Sheet', 'Popover', 'HoverCard', 'Tooltip', 'ContextMenu',
  'NavigationMenu', 'Menubar', 'ScrollArea', 'Table',
])

function analyzeComponent(dirPath: string): ComponentInfo | null {
  const dirName = basename(dirPath)
  const files = readdirSync(dirPath).filter(
    (f) => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.visual.') && !f.includes('.stories.')
  )

  let mainFile = files.find((f) => f === `${dirName}.tsx`)
  if (!mainFile) mainFile = files.find((f) => f.endsWith('.tsx'))
  if (!mainFile) return null

  const filePath = join(dirPath, mainFile)
  if (!existsSync(filePath)) return null

  const source = readFileSync(filePath, 'utf-8')
  const fileName = mainFile.replace('.tsx', '')
  const name = toPascalCase(fileName)

  return {
    name,
    fileName,
    dirName,
    filePath,
    hasVariants: source.includes('cva('),
    variants: extractVariants(source),
    exports: extractExports(source),
    needsChildren: CHILDREN_COMPONENTS.has(name),
  }
}

function isManualStory(filePath: string): boolean {
  if (!existsSync(filePath)) return false
  const firstLine = readFileSync(filePath, 'utf-8').split('\n')[0] ?? ''
  return firstLine.includes('// manual')
}

function generateStory(component: ComponentInfo): string {
  const { name, fileName, variants, exports, needsChildren } = component
  const primaryExport = exports.find((e) => e === name) || exports[0] || name
  const childContent = needsChildren ? `children: '${name}',` : ''

  const argTypes: string[] = []
  const defaultArgs: string[] = []

  for (const variant of variants) {
    argTypes.push(
      `    ${variant.name}: {\n      control: 'select',\n      options: [${variant.values.map((v) => `'${v}'`).join(', ')}],\n    },`
    )
    if (variant.defaultValue) {
      defaultArgs.push(`    ${variant.name}: '${variant.defaultValue}',`)
    }
  }

  const argTypesBlock = argTypes.length > 0
    ? `\n  argTypes: {\n${argTypes.join('\n')}\n  },`
    : ''

  const argsBlock = (defaultArgs.length > 0 || childContent)
    ? `\n  args: {\n${[...defaultArgs, childContent ? `    ${childContent}` : ''].filter(Boolean).join('\n')}\n  },`
    : ''

  return `import type { Meta, StoryObj } from '@storybook/react-vite'

import { ${primaryExport} } from './${fileName}'

const meta = {
  title: '${CATEGORY_MAP[component.dirName] ?? 'Components'}/${name}',
  component: ${primaryExport},${argTypesBlock}${argsBlock}
} satisfies Meta<typeof ${primaryExport}>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
${variants.length > 0 ? generateVariantStories(variants, name) : ''}
`
}

function generateVariantStories(variants: VariantInfo[], _componentName: string): string {
  const stories: string[] = []

  for (const variant of variants) {
    for (const value of variant.values) {
      if (value === variant.defaultValue) continue
      const storyName = toPascalCase(`${variant.name}-${value}`)
      stories.push(`export const ${storyName}: Story = {
  args: {
    ${variant.name}: '${value}',
  },
}`)
    }
  }

  return stories.length > 0 ? '\n' + stories.join('\n\n') + '\n' : ''
}

async function main(): Promise<void> {
  const forceRegenerate = process.argv.includes('--force')

  console.log('Scanning components...\n')
  if (forceRegenerate) {
    console.log('Force mode: overwriting stories (except // manual files)\n')
  }

  const componentDirs = readdirSync(COMPONENTS_DIR).filter((dir) => {
    const fullPath = join(COMPONENTS_DIR, dir)
    return statSync(fullPath).isDirectory()
  })

  let generated = 0
  let skipped = 0

  for (const dir of componentDirs) {
    const dirPath = join(COMPONENTS_DIR, dir)
    const component = analyzeComponent(dirPath)

    if (!component) {
      console.log(`  SKIP ${dir}: no component file found`)
      skipped++
      continue
    }

    const storyPath = join(dirPath, `${component.fileName}.stories.tsx`)

    if (existsSync(storyPath)) {
      if (isManualStory(storyPath)) {
        console.log(`  SKIP ${component.name}: manual story (preserved)`)
        skipped++
        continue
      }
      if (!forceRegenerate) {
        console.log(`  SKIP ${component.name}: story exists`)
        skipped++
        continue
      }
    }

    const story = generateStory(component)
    writeFileSync(storyPath, story)

    const variantCount = component.variants.reduce((sum, v) => sum + v.values.length, 0)
    console.log(`  GENERATED ${component.name}: ${variantCount} variants`)
    generated++
  }

  console.log(`\nSummary:`)
  console.log(`  Generated: ${generated}`)
  console.log(`  Skipped:   ${skipped}`)
  console.log(`  Total:     ${componentDirs.length}`)
}

main().catch(console.error)
