/**
 * Story Coverage Check
 *
 * Verifies every component directory has a corresponding .stories.tsx file.
 * Exits with code 1 if any component is missing a story.
 *
 * Usage: pnpm -F @vllnt/ui check:stories
 */

import { existsSync, readdirSync, statSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const COMPONENTS_DIR = join(__dirname, '../src/components')

function main(): void {
  const componentDirs = readdirSync(COMPONENTS_DIR).filter((dir) => {
    const fullPath = join(COMPONENTS_DIR, dir)
    return statSync(fullPath).isDirectory()
  })

  const missing: string[] = []

  for (const dir of componentDirs) {
    const dirPath = join(COMPONENTS_DIR, dir)
    const files = readdirSync(dirPath)
    const hasStory = files.some((f) => f.endsWith('.stories.tsx'))

    if (!hasStory) {
      missing.push(dir)
    }
  }

  if (missing.length > 0) {
    console.error(`Missing stories for ${missing.length} component(s):\n`)
    for (const name of missing) {
      console.error(`  - ${name}`)
    }
    console.error(`\nRun: pnpm -F @vllnt/ui storybook:generate`)
    process.exit(1)
  }

  console.log(`All ${componentDirs.length} components have stories.`)
}

main()
