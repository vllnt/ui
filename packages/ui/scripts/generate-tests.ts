/**
 * Test Generator Script
 *
 * Generates unit tests (.test.tsx) and visual tests (.visual.tsx) for all components.
 * Extracts CVA variants automatically to create comprehensive test coverage.
 *
 * Usage: pnpm -F @vllnt/ui test:generate
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'fs'
import { basename, dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const COMPONENTS_DIR = join(__dirname, '../src/components')

interface VariantInfo {
  name: string
  values: string[]
  defaultValue?: string
}

interface ComponentInfo {
  name: string // PascalCase name
  fileName: string // kebab-case file name
  dirName: string // directory name
  filePath: string
  hasVariants: boolean
  variants: VariantInfo[]
  hasForwardRef: boolean
  isClientComponent: boolean
  exports: string[]
}

/**
 * Convert kebab-case to PascalCase
 */
function toPascalCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('')
}

/**
 * Extract CVA variants from component source code
 * Uses direct regex matching on the variants object structure
 */
function extractVariants(source: string): VariantInfo[] {
  const variants: VariantInfo[] = []

  // Check if cva is used
  if (!source.includes('cva(')) return variants

  // Extract defaultVariants
  const defaultsMatch = source.match(/defaultVariants\s*:\s*\{([^}]+)\}/s)
  const defaults: Record<string, string> = {}
  if (defaultsMatch) {
    const defaultsStr = defaultsMatch[1]
    const defaultPairs = defaultsStr.matchAll(/(\w+)\s*:\s*['"](\w+)['"]/g)
    for (const match of defaultPairs) {
      defaults[match[1]] = match[2]
    }
  }

  // Find "variants: {" and extract the block using bracket matching
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

  // Parse each variant type (e.g., size: {...}, variant: {...})
  const variantTypeRegex = /(\w+)\s*:\s*\{/g
  let typeMatch

  while ((typeMatch = variantTypeRegex.exec(variantsBlock)) !== null) {
    const variantName = typeMatch[1]
    const typeStartPos = typeMatch.index + typeMatch[0].length

    // Find matching closing brace
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

    // Extract variant values (keys followed by : and a string)
    const values: string[] = []
    const keyRegex = /(\w+)\s*:\s*['"`,]/g
    let keyMatch

    while ((keyMatch = keyRegex.exec(typeContent)) !== null) {
      values.push(keyMatch[1])
    }

    if (values.length > 0) {
      variants.push({
        name: variantName,
        values,
        defaultValue: defaults[variantName],
      })
    }
  }

  return variants
}

/**
 * Extract exported component names from source
 */
function extractExports(source: string): string[] {
  const exports: string[] = []

  // Match: export { ComponentName }
  const namedExports = source.matchAll(/export\s*\{\s*([^}]+)\s*\}/g)
  for (const match of namedExports) {
    const names = match[1].split(',').map((n) => n.trim().split(' ')[0])
    exports.push(...names.filter((n) => n && /^[A-Z]/.test(n)))
  }

  // Match: export const ComponentName
  const constExports = source.matchAll(/export\s+(?:const|function)\s+([A-Z]\w+)/g)
  for (const match of constExports) {
    exports.push(match[1])
  }

  // Match: export default ComponentName
  const defaultExport = source.match(/export\s+default\s+([A-Z]\w+)/)
  if (defaultExport) {
    exports.push(defaultExport[1])
  }

  return [...new Set(exports)]
}

/**
 * Analyze a component file
 */
function analyzeComponent(dirPath: string): ComponentInfo | null {
  const dirName = basename(dirPath)
  const possibleFiles = [
    `${dirName}.tsx`,
    ...readdirSync(dirPath).filter((f) => f.endsWith('.tsx') && !f.includes('.test.') && !f.includes('.visual.')),
  ]

  // Find main component file
  let mainFile = possibleFiles.find((f) => f === `${dirName}.tsx`)
  if (!mainFile) {
    mainFile = possibleFiles.find((f) => f.endsWith('.tsx'))
  }
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
    hasForwardRef: source.includes('forwardRef'),
    isClientComponent: source.includes("'use client'") || source.includes('"use client"'),
    exports: extractExports(source),
  }
}

/**
 * Generate unit test file content
 */
function generateUnitTest(component: ComponentInfo): string {
  const { name, fileName, variants, hasForwardRef, exports } = component

  // Determine primary export to test
  const primaryExport = exports.find((e) => e === name) || exports[0] || name
  const role = getRole(name)
  const hasSemanticRole = role !== null

  // Build variant test cases
  const variantTests: string[] = []
  for (const variant of variants) {
    const nonDefaultValues = variant.values.filter((v) => v !== variant.defaultValue)
    if (nonDefaultValues.length > 0) {
      const selector = hasSemanticRole
        ? `screen.getByRole('${role}')`
        : 'container.firstChild'
      variantTests.push(`
  describe('${variant.name} variants', () => {
    it.each([${variant.values.map((v) => `'${v}'`).join(', ')}] as const)('renders %s ${variant.name}', (${variant.name}) => {
      const { container } = render(<${primaryExport} ${variant.name}={${variant.name}}>${name === 'Button' || name === 'Badge' ? 'Test' : ''}</${primaryExport}>)

      expect(${selector}).toBeInTheDocument()
    })
  })`)
    }
  }

  // Build ref test if forwardRef is used
  const refTest = hasForwardRef
    ? `
  describe('ref forwarding', () => {
    it('forwards ref to DOM element', () => {
      const ref = { current: null }
      render(<${primaryExport} ref={ref}>${needsChildren(name) ? 'Test' : ''}</${primaryExport}>)

      expect(ref.current).toBeInstanceOf(HTMLElement)
    })
  })`
    : ''

  // Generate test based on whether component has semantic role
  if (hasSemanticRole) {
    return `import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ${primaryExport} } from './${fileName}'

describe('${primaryExport}', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      render(<${primaryExport}>${needsChildren(name) ? 'Test Content' : ''}</${primaryExport}>)

      expect(screen.getByRole('${role}')).toBeInTheDocument()
    })

    it('applies custom className', () => {
      render(<${primaryExport} className="custom-class">${needsChildren(name) ? 'Test' : ''}</${primaryExport}>)

      expect(screen.getByRole('${role}')).toHaveClass('custom-class')
    })
  })
${variantTests.join('\n')}
${refTest}
  describe('accessibility', () => {
    it('has accessible ${role} role', () => {
      render(<${primaryExport}>${needsChildren(name) ? 'Test' : ''}</${primaryExport}>)

      expect(screen.getByRole('${role}')).toBeVisible()
    })
  })
})
`
  }

  // For components without semantic roles, use container queries
  return `import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ${primaryExport} } from './${fileName}'

describe('${primaryExport}', () => {
  describe('rendering', () => {
    it('renders correctly', () => {
      const { container } = render(<${primaryExport}>${needsChildren(name) ? 'Test Content' : ''}</${primaryExport}>)

      expect(container.firstChild).toBeInTheDocument()
    })

    it('applies custom className', () => {
      const { container } = render(<${primaryExport} className="custom-class">${needsChildren(name) ? 'Test' : ''}</${primaryExport}>)

      expect(container.firstChild).toHaveClass('custom-class')
    })
  })
${variantTests.join('\n')}
${refTest}
  describe('accessibility', () => {
    it('is visible when rendered', () => {
      const { container } = render(<${primaryExport}>${needsChildren(name) ? 'Test' : ''}</${primaryExport}>)

      expect(container.firstChild).toBeVisible()
    })
  })
})
`
}

/**
 * Generate visual test file content
 */
function generateVisualTest(component: ComponentInfo): string {
  const { name, fileName, variants, exports } = component

  const primaryExport = exports.find((e) => e === name) || exports[0] || name

  // Build variant visual tests
  const variantTests: string[] = []

  // Default state
  variantTests.push(`
  test('default', async ({ mount, page }) => {
    await mount(<${primaryExport}>${needsChildren(name) ? 'Test' : ''}</${primaryExport}>)
    await expect(page).toHaveScreenshot('${fileName}-default.png')
  })`)

  // Each variant combination
  for (const variant of variants) {
    for (const value of variant.values) {
      if (value !== variant.defaultValue) {
        variantTests.push(`
  test('${variant.name}-${value}', async ({ mount, page }) => {
    await mount(<${primaryExport} ${variant.name}="${value}">${needsChildren(name) ? 'Test' : ''}</${primaryExport}>)
    await expect(page).toHaveScreenshot('${fileName}-${variant.name}-${value}.png')
  })`)
      }
    }
  }

  return `import { expect, test } from '@playwright/experimental-ct-react'

import { ${primaryExport} } from './${fileName}'

test.describe('${primaryExport} Visual', () => {${variantTests.join('\n')}
})
`
}

/**
 * Get appropriate ARIA role for component
 * Returns null for components without semantic roles
 */
function getRole(componentName: string): string | null {
  const roleMap: Record<string, string> = {
    Button: 'button',
    Checkbox: 'checkbox',
    Dialog: 'dialog',
    Input: 'textbox',
    Label: 'label',
    Switch: 'switch',
    Toast: 'alert',
    Tabs: 'tablist',
  }
  return roleMap[componentName] || null
}

/**
 * Check if component needs children for rendering
 */
function needsChildren(componentName: string): boolean {
  const needsChildrenList = [
    'Button',
    'Badge',
    'Label',
    'Card',
    'Accordion',
    'Tabs',
    'Dialog',
    'DropdownMenu',
    'Command',
    'Callout',
    'ProTip',
    'KeyConcept',
    'TldrSection',
    'LearningObjectives',
    'Checklist',
    'StepByStep',
    'Comparison',
    'Faq',
    'Exercise',
    'Quiz',
  ]
  return needsChildrenList.includes(componentName)
}

/**
 * Main function
 */
async function main(): Promise<void> {
  const forceRegenerate = process.argv.includes('--force')

  console.log('🔍 Scanning components...\n')
  if (forceRegenerate) {
    console.log('⚠️  Force mode: Regenerating all tests\n')
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
      console.log(`⚠️  ${dir}: No component file found`)
      skipped++
      continue
    }

    const testPath = join(dirPath, `${component.fileName}.test.tsx`)
    const visualPath = join(dirPath, `${component.fileName}.visual.tsx`)

    // Skip manually crafted tests (CookieConsent) even with --force
    const manuallyMaintained = ['cookie-consent']
    if (manuallyMaintained.includes(component.dirName)) {
      console.log(`⏭️  ${component.name}: Manually maintained test`)
      skipped++
      continue
    }

    // Skip if test already exists (unless force flag)
    if (existsSync(testPath) && !forceRegenerate) {
      console.log(`⏭️  ${component.name}: Test already exists`)
      skipped++
      continue
    }

    // Generate tests
    const unitTest = generateUnitTest(component)
    const visualTest = generateVisualTest(component)

    writeFileSync(testPath, unitTest)
    writeFileSync(visualPath, visualTest)

    const variantCount = component.variants.reduce((sum, v) => sum + v.values.length, 0)
    console.log(`✅ ${component.name}: ${variantCount} variants`)
    generated++
  }

  console.log(`\n📊 Summary:`)
  console.log(`   Generated: ${generated}`)
  console.log(`   Skipped: ${skipped}`)
  console.log(`   Total: ${componentDirs.length}`)
}

main().catch(console.error)
