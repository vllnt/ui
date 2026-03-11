/**
 * MDX Doc Generator Script
 *
 * Generates Storybook MDX documentation files for all components.
 * Pulls metadata from registry.json and extracts props/variants from source.
 *
 * Usage: pnpm -F @vllnt/ui storybook:generate-docs
 *
 * Options:
 *   --force  Overwrite existing docs (skips files with {/* manual *\/} header)
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENTS_DIR = join(__dirname, '../src/components')
const REGISTRY_PATH = join(__dirname, '../../../apps/registry/registry.json')

interface RegistryItem {
  name: string
  type: string
  title?: string
  description?: string
  category?: string
  dependencies?: string[]
  registryDependencies?: string[]
}

interface VariantInfo {
  name: string
  values: string[]
  defaultValue?: string
}

interface PropInfo {
  name: string
  type: string
  required: boolean
}

interface ComponentMeta {
  name: string
  dirName: string
  fileName: string
  title: string
  description: string
  category: string
  dependencies: string[]
  registryDependencies: string[]
  variants: VariantInfo[]
  props: PropInfo[]
  exports: string[]
  hasStories: boolean
  storyExports: string[]
}

function loadRegistry(): RegistryItem[] {
  try {
    const raw = JSON.parse(readFileSync(REGISTRY_PATH, 'utf8')) as { items: RegistryItem[] }
    return raw.items.filter((item) => item.type === 'registry:component')
  } catch {
    return []
  }
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
    const defaultPairs = defaultsMatch[1].matchAll(/(\w+)\s*:\s*['"](\w+)['"]/g)
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
    const keyRegex = /(\w+)\s*:\s*['"`]/g
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

function extractProps(source: string, componentName: string): PropInfo[] {
  const props: PropInfo[] = []

  const typePatterns = [
    new RegExp(`(?:type|interface)\\s+${componentName}Props\\s*=?\\s*\\{([^}]+(?:\\{[^}]*\\}[^}]*)*)\\}`, 's'),
    /(?:type|interface)\s+\w*Props\w*\s*=?\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/s,
  ]

  let propsBlock: string | undefined

  for (const pattern of typePatterns) {
    const match = source.match(pattern)
    if (match?.[1]) {
      propsBlock = match[1]
      break
    }
  }

  if (!propsBlock) return props

  const propRegex = /(\w+)(\??):\s*([^;\n]+)/g
  let propMatch

  while ((propMatch = propRegex.exec(propsBlock)) !== null) {
    const name = propMatch[1]
    const required = propMatch[2] !== '?'
    const type = (propMatch[3] ?? '').trim().replace(/,$/, '')
    if (name && type) {
      props.push({ name, type, required })
    }
  }

  return props
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

  return [...new Set(exports)]
}

function extractStoryExports(storySource: string): string[] {
  const exports: string[] = []
  const storyRegex = /export\s+const\s+(\w+)\s*:\s*Story/g
  let match

  while ((match = storyRegex.exec(storySource)) !== null) {
    if (match[1]) exports.push(match[1])
  }

  return exports
}

function analyzeComponent(dirPath: string, registryItems: RegistryItem[]): ComponentMeta | null {
  const dirName = basename(dirPath)
  const files = readdirSync(dirPath).filter(
    (f) => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.visual.') && !f.includes('.stories.') && !f.includes('.mdx')
  )

  let mainFile = files.find((f) => f === `${dirName}.tsx`)
  if (!mainFile) mainFile = files.find((f) => f.endsWith('.tsx'))
  if (!mainFile) return null

  const filePath = join(dirPath, mainFile)
  if (!existsSync(filePath)) return null

  const source = readFileSync(filePath, 'utf-8')
  const fileName = mainFile.replace('.tsx', '')
  const name = toPascalCase(fileName)

  const registryItem = registryItems.find((item) => item.name === dirName)

  const storyFile = join(dirPath, `${fileName}.stories.tsx`)
  const hasStories = existsSync(storyFile)
  let storyExports: string[] = []
  if (hasStories) {
    const storySource = readFileSync(storyFile, 'utf-8')
    storyExports = extractStoryExports(storySource)
  }

  return {
    name,
    dirName,
    fileName,
    title: registryItem?.title ?? name,
    description: registryItem?.description ?? '',
    category: registryItem?.category
      ? registryItem.category.charAt(0).toUpperCase() + registryItem.category.slice(1)
      : 'Components',
    dependencies: registryItem?.dependencies ?? [],
    registryDependencies: registryItem?.registryDependencies ?? [],
    variants: extractVariants(source),
    props: extractProps(source, name),
    exports: extractExports(source),
    hasStories,
    storyExports,
  }
}

function generateMdx(component: ComponentMeta): string {
  const { name, fileName, title, description, category, variants, props, exports, dependencies, registryDependencies, storyExports, dirName } = component
  const primaryExport = exports.find((e) => e === name) ?? exports[0] ?? name

  const lines: string[] = []

  lines.push(`import { Meta, Primary, Controls, Story, Canvas } from '@storybook/addon-docs/blocks'`)
  lines.push(`import * as Stories from './${fileName}.stories'`)
  lines.push('')
  lines.push(`<Meta of={Stories} />`)
  lines.push('')

  lines.push(`# ${title}`)
  lines.push('')
  if (description) {
    lines.push(description)
    lines.push('')
  }

  lines.push(`<Primary />`)
  lines.push('')

  lines.push(`## Installation`)
  lines.push('')
  lines.push('```bash')
  lines.push(`pnpm dlx shadcn@latest add https://ui.vllnt.com/r/${dirName}.json`)
  lines.push('```')
  lines.push('')

  lines.push(`## Import`)
  lines.push('')
  lines.push('```tsx')
  if (exports.length > 1) {
    lines.push(`import { ${exports.join(', ')} } from '@vllnt/ui'`)
  } else {
    lines.push(`import { ${primaryExport} } from '@vllnt/ui'`)
  }
  lines.push('```')
  lines.push('')

  if (props.length > 0) {
    lines.push(`## Props`)
    lines.push('')
    lines.push(`<Controls />`)
    lines.push('')

    lines.push(`| Prop | Type | Required | Description |`)
    lines.push(`| ---- | ---- | -------- | ----------- |`)
    for (const prop of props) {
      const cleanType = prop.type.replace(/\|/g, '\\|').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      lines.push(`| \`${prop.name}\` | \`${cleanType}\` | ${prop.required ? 'Yes' : 'No'} | - |`)
    }
    lines.push('')
  } else {
    lines.push(`## Controls`)
    lines.push('')
    lines.push(`<Controls />`)
    lines.push('')
  }

  if (variants.length > 0) {
    lines.push(`## Variants`)
    lines.push('')
    for (const variant of variants) {
      lines.push(`### ${variant.name}`)
      lines.push('')
      lines.push(`| Value | Default |`)
      lines.push(`| ----- | ------- |`)
      for (const value of variant.values) {
        lines.push(`| \`${value}\` | ${value === variant.defaultValue ? 'Yes' : '-'} |`)
      }
      lines.push('')

      const variantStories = storyExports.filter((s) => {
        const lower = s.toLowerCase()
        return lower.startsWith(variant.name.toLowerCase())
      })
      if (variantStories.length > 0) {
        for (const storyName of variantStories) {
          lines.push(`<Canvas of={Stories.${storyName}} />`)
          lines.push('')
        }
      }
    }
  }

  const shownStories = new Set<string>()
  if (variants.length > 0) {
    for (const variant of variants) {
      for (const storyName of storyExports) {
        if (storyName.toLowerCase().startsWith(variant.name.toLowerCase())) {
          shownStories.add(storyName)
        }
      }
    }
  }

  const remainingStories = storyExports.filter((s) => s !== 'Default' && !shownStories.has(s))
  if (remainingStories.length > 0) {
    lines.push(`## Stories`)
    lines.push('')
    for (const storyName of remainingStories) {
      lines.push(`### ${storyName.replace(/([A-Z])/g, ' $1').trim()}`)
      lines.push('')
      lines.push(`<Canvas of={Stories.${storyName}} />`)
      lines.push('')
    }
  }

  if (dependencies.length > 0 || registryDependencies.length > 0) {
    lines.push(`## Dependencies`)
    lines.push('')
    if (dependencies.length > 0) {
      lines.push(`**npm packages:**`)
      for (const dep of dependencies) {
        lines.push(`- \`${dep}\``)
      }
      lines.push('')
    }
    if (registryDependencies.length > 0) {
      lines.push(`**Registry components:**`)
      for (const dep of registryDependencies) {
        lines.push(`- \`${dep}\``)
      }
      lines.push('')
    }
  }

  return lines.join('\n') + '\n'
}

function isManualDoc(filePath: string): boolean {
  if (!existsSync(filePath)) return false
  const firstLine = readFileSync(filePath, 'utf-8').split('\n')[0] ?? ''
  return firstLine.includes('{/* manual */}')
}

async function main(): Promise<void> {
  const forceRegenerate = process.argv.includes('--force')

  console.log('Generating MDX docs...\n')
  if (forceRegenerate) {
    console.log('Force mode: overwriting docs (except {/* manual */} files)\n')
  }

  const registryItems = loadRegistry()

  const componentDirs = readdirSync(COMPONENTS_DIR).filter((dir) => {
    const fullPath = join(COMPONENTS_DIR, dir)
    return statSync(fullPath).isDirectory()
  })

  let generated = 0
  let skipped = 0

  for (const dir of componentDirs) {
    const dirPath = join(COMPONENTS_DIR, dir)
    const component = analyzeComponent(dirPath, registryItems)

    if (!component) {
      console.log(`  SKIP ${dir}: no component file found`)
      skipped++
      continue
    }

    if (!component.hasStories) {
      console.log(`  SKIP ${component.name}: no stories file`)
      skipped++
      continue
    }

    const docPath = join(dirPath, `${component.fileName}.mdx`)

    if (existsSync(docPath)) {
      if (isManualDoc(docPath)) {
        console.log(`  SKIP ${component.name}: manual doc (preserved)`)
        skipped++
        continue
      }
      if (!forceRegenerate) {
        console.log(`  SKIP ${component.name}: doc exists`)
        skipped++
        continue
      }
    }

    const mdx = generateMdx(component)
    writeFileSync(docPath, mdx)

    console.log(`  GENERATED ${component.name}: ${component.variants.length} variants, ${component.props.length} props`)
    generated++
  }

  console.log(`\nSummary:`)
  console.log(`  Generated: ${generated}`)
  console.log(`  Skipped:   ${skipped}`)
  console.log(`  Total:     ${componentDirs.length}`)
}

main().catch(console.error)
