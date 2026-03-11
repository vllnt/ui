/**
 * MDX Doc Generator Script
 *
 * Generates Storybook MDX documentation files for all components.
 * Pulls metadata from registry.json and extracts props/variants from source.
 *
 * Features:
 * - Deep prop extraction: arrays, callbacks, ReactNode, unions, complex objects
 * - Inline type definitions for array items and object shapes
 * - Compound component support (Accordion.Item, FAQ.Item, etc.)
 * - Code preview examples with Canvas sourceState="shown"
 * - CVA variant tables with story canvases
 *
 * Usage: pnpm -F @vllnt/ui storybook:generate-docs [--force]
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
  description: string
}

interface TypeDefinition {
  name: string
  fields: PropInfo[]
  source: string
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
  subComponents: SubComponentInfo[]
  typeDefinitions: TypeDefinition[]
  source: string
}

interface SubComponentInfo {
  name: string
  props: PropInfo[]
  description: string
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

function toKebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
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

function classifyType(rawType: string): string {
  const t = rawType.trim()
  if (t.includes('=>') || t.startsWith('(')) return 'callback'
  if (t === 'ReactNode' || t === 'React.ReactNode') return 'reactnode'
  if (t.includes('|')) return 'union'
  if (t.endsWith('[]') || t.startsWith('Array<')) return 'array'
  if (t === 'boolean') return 'boolean'
  if (t === 'string' || t === 'number') return 'primitive'
  if (/^[A-Z]/.test(t)) return 'object'
  return 'other'
}

function describeType(prop: PropInfo, typeDefinitions: TypeDefinition[]): string {
  const t = prop.type.trim()
  const kind = classifyType(t)

  switch (kind) {
    case 'array': {
      const itemType = t.replace('[]', '').replace(/^Array<(.+)>$/, '$1').trim()
      const typeDef = typeDefinitions.find((td) => td.name === itemType)
      if (typeDef) {
        return `Array of \`${itemType}\` objects`
      }
      return `Array of \`${itemType}\``
    }
    case 'callback': {
      const argsMatch = t.match(/\(([^)]*)\)/)
      if (argsMatch?.[1]) {
        const params = argsMatch[1].trim()
        if (params === '') return 'Callback with no arguments'
        return `Callback: \`${t}\``
      }
      return `Callback function`
    }
    case 'reactnode':
      return 'React content (JSX, string, number, etc.)'
    case 'union': {
      const parts = t.split('|').map((p) => p.trim())
      const allStrings = parts.every((p) => p.startsWith('"') || p.startsWith("'"))
      if (allStrings) {
        return parts.map((p) => `\`${p.replace(/['"]/g, '')}\``).join(', ')
      }
      return parts.map((p) => `\`${p}\``).join(' or ')
    }
    case 'boolean':
      return `\`true\` or \`false\``
    case 'object': {
      const typeDef = typeDefinitions.find((td) => td.name === t)
      if (typeDef) return `\`${t}\` object`
      return `-`
    }
    default:
      return '-'
  }
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
      if (depth === 0) {
        return source.slice(blockStart, i)
      }
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

    const propMatch = trimmed.match(/^(\w+)(\??)\s*:\s*(.+?)\s*;?\s*$/)
    if (propMatch) {
      const name = propMatch[1] ?? ''
      const required = propMatch[2] !== '?'
      let type = (propMatch[3] ?? '').trim().replace(/;$/, '').replace(/,$/, '')

      if (!name || !type) continue
      if (['children', 'className', 'ref', 'key', 'style'].includes(name) && type === 'ReactNode') continue

      props.push({ name, type, required, description: '' })
    }
  }

  return props
}

function extractAllTypes(source: string): TypeDefinition[] {
  const types: TypeDefinition[] = []

  const typeRegex = /(?:export\s+)?type\s+(\w+)\s*=\s*\{/g
  let match
  while ((match = typeRegex.exec(source)) !== null) {
    const name = match[1]
    if (!name) continue
    const block = extractTypeBlock(source, match.index + match[0].length - 1)
    if (block) {
      const fields = parsePropsFromBlock(block)
      types.push({ name, fields, source: block })
    }
  }

  const interfaceRegex = /(?:export\s+)?interface\s+(\w+)\s*(?:extends\s+[^{]+)?\{/g
  while ((match = interfaceRegex.exec(source)) !== null) {
    const name = match[1]
    if (!name) continue
    const block = extractTypeBlock(source, match.index + match[0].length - 1)
    if (block) {
      const fields = parsePropsFromBlock(block)
      types.push({ name, fields, source: block })
    }
  }

  return types
}

function extractProps(source: string, componentName: string, allTypes: TypeDefinition[]): PropInfo[] {
  const propsTypeName = `${componentName}Props`
  const typeDef = allTypes.find((t) => t.name === propsTypeName)
  if (typeDef) return typeDef.fields

  const typePatterns = [
    new RegExp(`(?:type|interface)\\s+${propsTypeName}\\s*=?\\s*\\{`, 's'),
    /(?:type|interface)\s+\w*Props\w*\s*=?\s*\{/s,
  ]

  for (const pattern of typePatterns) {
    const match = source.match(pattern)
    if (match?.index !== undefined) {
      const block = extractTypeBlock(source, match.index + match[0].length - 1)
      if (block) return parsePropsFromBlock(block)
    }
  }

  return []
}

function extractExports(source: string): string[] {
  const exports: string[] = []

  const namedExports = source.matchAll(/export\s*\{\s*([^}]+)\s*\}/g)
  for (const match of namedExports) {
    if (!match[1]) continue
    const names = match[1]
      .split(',')
      .map((n) => n.trim())
      .filter((n) => !n.startsWith('type '))
      .map((n) => n.split(/\s+as\s+/)[0]?.trim() ?? '')
      .filter((n) => n.length > 0 && /^[A-Z]/.test(n))
    exports.push(...names)
  }

  const constExports = source.matchAll(/export\s+(?:const|function)\s+([A-Z]\w+)/g)
  for (const match of constExports) {
    if (match[1]) exports.push(match[1])
  }

  return [...new Set(exports)]
}

function extractStoryExports(storySource: string): string[] {
  const exports: string[] = []
  const storyRegex = /export\s+const\s+(\w+)\s*[=:]/g
  let match

  while ((match = storyRegex.exec(storySource)) !== null) {
    const name = match[1]
    if (name && name !== 'default') exports.push(name)
  }

  return exports
}

function extractSubComponents(source: string, mainName: string, allTypes: TypeDefinition[]): SubComponentInfo[] {
  const subComponents: SubComponentInfo[] = []
  const attachedImplNames = new Set<string>()

  const attachRegex = new RegExp(`${mainName}\\.(\\w+)\\s*=\\s*(\\w+)`, 'g')
  let match
  while ((match = attachRegex.exec(source)) !== null) {
    const implName = match[2]
    if (!implName) continue
    attachedImplNames.add(implName)
    const propsTypeName = `${implName}Props`
    const typeDef = allTypes.find((t) => t.name === propsTypeName)
    subComponents.push({
      name: `${mainName}.${match[1]}`,
      props: typeDef?.fields ?? [],
      description: '',
    })
  }

  const subCompRegex = /(?:const|function)\s+([A-Z]\w+)\s*(?:=\s*forwardRef|[\(:])/g
  while ((match = subCompRegex.exec(source)) !== null) {
    const name = match[1]
    if (!name || name === mainName) continue
    if (attachedImplNames.has(name)) continue

    if (name.startsWith(mainName)) {
      const propsTypeName = `${name}Props`
      const typeDef = allTypes.find((t) => t.name === propsTypeName)
      if (typeDef && typeDef.fields.length > 0) {
        subComponents.push({
          name,
          props: typeDef.fields,
          description: '',
        })
      }
    }
  }

  return subComponents
}

function extractStoryArgs(storySource: string, storyName: string): Record<string, string> | null {
  const regex = new RegExp(`export\\s+const\\s+${storyName}\\s*:\\s*Story\\s*=\\s*\\{([^}]*)\\}`, 's')
  const match = storySource.match(regex)
  if (!match?.[1]) return null

  const argsMatch = match[1].match(/args\s*:\s*\{([^}]*)\}/s)
  if (!argsMatch?.[1]) return null

  const args: Record<string, string> = {}
  const argRegex = /(\w+)\s*:\s*(?:"([^"]*)"|([\w.]+)|\[([^\]]*)\])/g
  let argMatch
  while ((argMatch = argRegex.exec(argsMatch[1])) !== null) {
    const key = argMatch[1] ?? ''
    const value = argMatch[2] ?? argMatch[3] ?? (argMatch[4] !== undefined ? `[${argMatch[4]}]` : '')
    if (key) args[key] = value
  }

  return Object.keys(args).length > 0 ? args : null
}

function generateUsageExample(component: ComponentMeta): string {
  const { name, exports, props, subComponents, typeDefinitions, source } = component
  const lines: string[] = []

  const hasArrayProps = props.some((p) => classifyType(p.type) === 'array')
  const hasCallbackProps = props.some((p) => classifyType(p.type) === 'callback')
  const isCompound = subComponents.length > 0

  if (hasArrayProps) {
    return generateArrayPropsExample(component)
  }

  if (isCompound) {
    return generateCompoundExample(component)
  }

  lines.push(`<${name}`)

  const nonTrivialProps = props.filter(
    (p) => p.required && !['className', 'children', 'ref', 'key', 'style'].includes(p.name)
  )

  for (const prop of nonTrivialProps) {
    const kind = classifyType(prop.type)
    switch (kind) {
      case 'primitive':
        lines.push(`  ${prop.name}="${exampleValue(prop)}"`)
        break
      case 'boolean':
        lines.push(`  ${prop.name}`)
        break
      case 'callback':
        lines.push(`  ${prop.name}={${exampleCallback(prop)}}`)
        break
      case 'union': {
        const parts = prop.type.split('|').map((p) => p.trim())
        const allStrings = parts.every((p) => p.startsWith('"') || p.startsWith("'"))
        if (allStrings) {
          const firstVal = parts[0]?.replace(/['"]/g, '') ?? ''
          lines.push(`  ${prop.name}="${firstVal}"`)
        }
        break
      }
      default:
        break
    }
  }

  const hasChildren = source.includes('{children}') || source.includes('...props') || /\bchildren\b/.test(source)

  if (hasChildren) {
    if (lines.length > 1) {
      lines.push(`>`)
      lines.push(`  ${exampleChildren(name)}`)
      lines.push(`</${name}>`)
    } else {
      lines[0] = `<${name}>${exampleChildren(name)}</${name}>`
    }
  } else {
    if (lines.length > 1) {
      lines.push(`/>`)
    } else {
      lines[0] = `<${name} />`
    }
  }

  return lines.join('\n')
}

function generateCompoundExample(component: ComponentMeta): string {
  const { name, subComponents, props } = component
  const lines: string[] = []

  const mainProps = props.filter(
    (p) => p.required && !['children', 'className', 'ref', 'key', 'style'].includes(p.name)
  )
  const mainPropsStr = mainProps.map((p) => {
    const kind = classifyType(p.type)
    if (kind === 'union') {
      const first = p.type.split('|')[0]?.trim().replace(/['"]/g, '') ?? ''
      return `${p.name}="${first}"`
    }
    return `${p.name}="${exampleValue(p)}"`
  }).join(' ')

  lines.push(`<${name}${mainPropsStr ? ` ${mainPropsStr}` : ''}>`)

  const hasDotSubs = subComponents.some((sc) => sc.name.includes('.'))
  const subs = hasDotSubs
    ? subComponents.filter((sc) => sc.name.includes('.'))
    : subComponents

  for (const sub of subs) {
    const hasValue = sub.props.some((p) => p.name === 'value')
    const hasChildren = sub.props.some((p) => p.name === 'children')
    const hasQuestion = sub.props.some((p) => p.name === 'question')

    const requiredProps = sub.props.filter(
      (p) => p.required && !['children', 'className', 'ref', 'key', 'style'].includes(p.name)
    )
    const propsStr = requiredProps.map((p) => {
      if (p.name === 'value') return `value="item-1"`
      if (p.name === 'question') return `question="A question?"`
      return `${p.name}="${exampleValue(p)}"`
    }).join(' ')

    if (hasChildren || hasQuestion) {
      lines.push(`  <${sub.name}${propsStr ? ` ${propsStr}` : ''}>`)
      lines.push(`    Content here`)
      lines.push(`  </${sub.name}>`)
    } else {
      lines.push(`  <${sub.name}${propsStr ? ` ${propsStr}` : ''} />`)
    }
  }

  lines.push(`</${name}>`)
  return lines.join('\n')
}

function generateArrayPropsExample(component: ComponentMeta): string {
  const { name, props, typeDefinitions } = component
  const lines: string[] = []

  const arrayProp = props.find((p) => classifyType(p.type) === 'array')
  if (!arrayProp) return `<${name} />`

  const itemType = arrayProp.type.replace('[]', '').replace(/^Array<(.+)>$/, '$1').trim()
  const typeDef = typeDefinitions.find((td) => td.name === itemType)

  if (typeDef) {
    lines.push(`const ${arrayProp.name} = [`)
    lines.push(`  {`)
    for (const field of typeDef.fields) {
      lines.push(`    ${field.name}: ${exampleFieldValue(field)},`)
    }
    lines.push(`  },`)
    lines.push(`]`)
    lines.push(``)
  }

  lines.push(`<${name}`)
  for (const prop of props) {
    if (prop.name === arrayProp.name) {
      lines.push(`  ${prop.name}={${arrayProp.name}}`)
    } else if (prop.required && prop.name !== 'className' && prop.name !== 'children') {
      const kind = classifyType(prop.type)
      if (kind === 'primitive') {
        lines.push(`  ${prop.name}="${exampleValue(prop)}"`)
      } else if (kind === 'callback') {
        lines.push(`  ${prop.name}={${exampleCallback(prop)}}`)
      }
    }
  }
  lines.push(`/>`)

  return lines.join('\n')
}

function exampleValue(prop: PropInfo): string {
  if (prop.name.includes('title') || prop.name.includes('Title')) return 'My Title'
  if (prop.name.includes('label') || prop.name.includes('Label')) return 'Label'
  if (prop.name.includes('question')) return 'What is React?'
  if (prop.name.includes('description') || prop.name.includes('Description')) return 'A short description'
  if (prop.name.includes('name') || prop.name.includes('Name')) return 'example'
  if (prop.name.includes('href') || prop.name.includes('url') || prop.name.includes('Url')) return '/example'
  if (prop.name.includes('placeholder')) return 'Type here...'
  if (prop.name.includes('key') || prop.name.includes('Key') || prop.name.includes('id') || prop.name.includes('Id')) return 'unique-id'
  if (prop.type === 'number') return '0'
  return 'value'
}

function exampleCallback(prop: PropInfo): string {
  const argsMatch = prop.type.match(/\(([^)]*)\)/)
  if (argsMatch?.[1]) {
    const params = argsMatch[1].trim()
    if (params === '') return '() => {}'
    const paramNames = params.split(',').map((p) => p.split(':')[0]?.trim() ?? 'v')
    return `(${paramNames.join(', ')}) => console.log(${paramNames.join(', ')})`
  }
  return '() => {}'
}

function exampleFieldValue(field: PropInfo): string {
  const kind = classifyType(field.type)
  if (field.name === 'id') return `"1"`
  if (field.name === 'label' || field.name === 'title') return `"Example item"`
  if (field.name === 'description') return `"A description"`
  if (field.name === 'correct') return `true`
  if (field.name === 'explanation') return `"Explanation text"`
  if (field.name === 'href' || field.name === 'url') return `"/example"`
  if (field.name === 'slug') return `"example-slug"`
  if (field.name === 'question') return `"A question?"`
  if (kind === 'primitive') {
    if (field.type === 'string') return `"value"`
    if (field.type === 'number') return `0`
    return `"value"`
  }
  if (kind === 'boolean') return `false`
  if (kind === 'reactnode') return `"Content"`
  if (kind === 'array') return `[]`
  return `"value"`
}

function exampleChildren(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('button')) return 'Click me'
  if (lower.includes('badge')) return 'Badge'
  if (lower.includes('alert')) return 'This is an alert message.'
  if (lower.includes('card')) return '...'
  if (lower.includes('dialog')) return '...'
  if (lower.includes('tooltip')) return 'Hover me'
  return `${name} content`
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

  const allTypes = extractAllTypes(source)
  const exports = extractExports(source)
  const props = extractProps(source, name, allTypes)
  const subComponents = extractSubComponents(source, name, allTypes)

  const propsTypeNames = new Set<string>([`${name}Props`])
  for (const sc of subComponents) {
    const scName = sc.name.includes('.') ? sc.name.split('.').pop() ?? '' : sc.name
    propsTypeNames.add(`${scName}Props`)
  }
  const attachRegex2 = new RegExp(`${name}\\.(\\w+)\\s*=\\s*(\\w+)`, 'g')
  let m2
  while ((m2 = attachRegex2.exec(source)) !== null) {
    if (m2[2]) propsTypeNames.add(`${m2[2]}Props`)
  }

  const typeDefinitions = allTypes.filter(
    (t) => !propsTypeNames.has(t.name) && !t.name.includes('Context') && t.fields.length > 0
  )

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
    props,
    exports,
    hasStories,
    storyExports,
    subComponents,
    typeDefinitions,
    source,
  }
}

function escapeForMdx(str: string): string {
  return str
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
}

function escapeForMdxTable(str: string): string {
  return str
    .replace(/\|/g, '\\|')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function generateMdx(component: ComponentMeta): string {
  const {
    name,
    fileName,
    title,
    description,
    variants,
    props,
    exports,
    dependencies,
    registryDependencies,
    storyExports,
    dirName,
    subComponents,
    typeDefinitions,
  } = component

  const lines: string[] = []

  lines.push(`import { Meta, Primary, Controls, Story, Canvas, Source } from '@storybook/addon-docs/blocks'`)
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
  const allExports = [...exports]
  for (const sub of subComponents) {
    const subExportName = sub.name.includes('.') ? '' : sub.name
    if (subExportName && !allExports.includes(subExportName)) {
      allExports.push(subExportName)
    }
  }
  if (allExports.length > 3) {
    lines.push(`import {`)
    for (const exp of allExports) {
      lines.push(`  ${exp},`)
    }
    lines.push(`} from '@vllnt/ui'`)
  } else if (allExports.length > 0) {
    lines.push(`import { ${allExports.join(', ')} } from '@vllnt/ui'`)
  } else {
    lines.push(`import { ${name} } from '@vllnt/ui'`)
  }
  lines.push('```')
  lines.push('')

  const usageExample = generateUsageExample(component)
  lines.push(`## Usage`)
  lines.push('')
  lines.push('```tsx')
  lines.push(usageExample)
  lines.push('```')
  lines.push('')

  if (storyExports.includes('Default')) {
    lines.push(`<Canvas of={Stories.Default} sourceState="shown" />`)
    lines.push('')
  }

  lines.push(`## API Reference`)
  lines.push('')

  if (props.length > 0) {
    if (subComponents.length > 0) {
      lines.push(`### ${name}`)
      lines.push('')
    }

    lines.push(`<Controls />`)
    lines.push('')

    const nonTrivialProps = props.filter(
      (p) => !['className', 'ref', 'key', 'style'].includes(p.name)
    )

    if (nonTrivialProps.length > 0) {
      lines.push(`| Prop | Type | Required | Description |`)
      lines.push(`| ---- | ---- | -------- | ----------- |`)
      for (const prop of nonTrivialProps) {
        const cleanType = escapeForMdxTable(prop.type)
        const desc = describeType(prop, typeDefinitions)
        lines.push(`| \`${prop.name}\` | \`${cleanType}\` | ${prop.required ? 'Yes' : 'No'} | ${desc} |`)
      }
      lines.push('')
    }
  } else {
    lines.push(`<Controls />`)
    lines.push('')
  }

  if (subComponents.length > 0) {
    for (const sub of subComponents) {
      lines.push(`### ${sub.name}`)
      lines.push('')
      if (sub.props.length > 0) {
        const nonTrivialProps = sub.props.filter(
          (p) => !['className', 'ref', 'key', 'style'].includes(p.name)
        )
        if (nonTrivialProps.length > 0) {
          lines.push(`| Prop | Type | Required | Description |`)
          lines.push(`| ---- | ---- | -------- | ----------- |`)
          for (const prop of nonTrivialProps) {
            const cleanType = escapeForMdxTable(prop.type)
            const desc = describeType(prop, typeDefinitions)
            lines.push(`| \`${prop.name}\` | \`${cleanType}\` | ${prop.required ? 'Yes' : 'No'} | ${desc} |`)
          }
          lines.push('')
        }
      }
    }
  }

  if (typeDefinitions.length > 0) {
    lines.push(`## Type Definitions`)
    lines.push('')
    for (const typeDef of typeDefinitions) {
      lines.push(`### ${typeDef.name}`)
      lines.push('')
      lines.push('```tsx')
      lines.push(`type ${typeDef.name} = {`)
      for (const field of typeDef.fields) {
        const opt = field.required ? '' : '?'
        lines.push(`  ${field.name}${opt}: ${field.type}`)
      }
      lines.push(`}`)
      lines.push('```')
      lines.push('')

      if (typeDef.fields.length > 0) {
        lines.push(`| Field | Type | Required | Description |`)
        lines.push(`| ----- | ---- | -------- | ----------- |`)
        for (const field of typeDef.fields) {
          const cleanType = escapeForMdxTable(field.type)
          const desc = describeType(field, typeDefinitions)
          lines.push(`| \`${field.name}\` | \`${cleanType}\` | ${field.required ? 'Yes' : 'No'} | ${desc} |`)
        }
        lines.push('')
      }
    }
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
          lines.push(`<Canvas of={Stories.${storyName}} sourceState="shown" />`)
          lines.push('')
        }
      }
    }
  }

  const shownStories = new Set<string>(['Default'])
  if (variants.length > 0) {
    for (const variant of variants) {
      for (const storyName of storyExports) {
        if (storyName.toLowerCase().startsWith(variant.name.toLowerCase())) {
          shownStories.add(storyName)
        }
      }
    }
  }

  const remainingStories = storyExports.filter((s) => !shownStories.has(s))
  if (remainingStories.length > 0) {
    lines.push(`## Examples`)
    lines.push('')
    for (const storyName of remainingStories) {
      const displayName = storyName.replace(/([A-Z])/g, ' $1').trim()
      lines.push(`### ${displayName}`)
      lines.push('')
      lines.push(`<Canvas of={Stories.${storyName}} sourceState="shown" />`)
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
  const stats = { withTypes: 0, withSubComponents: 0, withVariants: 0, withArrayProps: 0 }

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
        console.log(`  SKIP ${component.name}: doc exists (use --force to overwrite)`)
        skipped++
        continue
      }
    }

    const mdx = generateMdx(component)
    writeFileSync(docPath, mdx)

    if (component.typeDefinitions.length > 0) stats.withTypes++
    if (component.subComponents.length > 0) stats.withSubComponents++
    if (component.variants.length > 0) stats.withVariants++
    if (component.props.some((p) => classifyType(p.type) === 'array')) stats.withArrayProps++

    const features = [
      `${component.variants.length}v`,
      `${component.props.length}p`,
      `${component.subComponents.length}sub`,
      `${component.typeDefinitions.length}types`,
      `${component.storyExports.length}stories`,
    ].join(' ')

    console.log(`  GEN ${component.name}: ${features}`)
    generated++
  }

  console.log(`\nSummary:`)
  console.log(`  Generated: ${generated}`)
  console.log(`  Skipped:   ${skipped}`)
  console.log(`  Total:     ${componentDirs.length}`)
  console.log(`\nFeatures:`)
  console.log(`  With type definitions: ${stats.withTypes}`)
  console.log(`  With sub-components:   ${stats.withSubComponents}`)
  console.log(`  With CVA variants:     ${stats.withVariants}`)
  console.log(`  With array props:      ${stats.withArrayProps}`)
}

main().catch(console.error)
