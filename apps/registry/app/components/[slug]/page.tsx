import { readFile } from 'node:fs/promises'
import path from 'node:path'

import { ExternalLink } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { CodeBlock, MDXContent, Sidebar, TableOfContents } from '@vllnt/ui'

import { ComponentPreview } from '@/components/component-preview'
import { QuickAdd } from '@/components/quick-add'
import { getCategoryForComponent, getSidebarSections } from '@/lib/sidebar-sections'
import registryData from '@/registry.json'
import type { Registry, RegistryComponent } from '@/types/registry'

type Props = {
  params: Promise<{ slug: string }>
}

const registry = registryData as Registry

export async function generateStaticParams() {
  return registry.items
    .filter((item): item is RegistryComponent => item.type === 'registry:component')
    .map((item) => ({
      slug: item.name,
    }))
}

function getNpmUrl(packageName: string): string {
  return `https://www.npmjs.com/package/${packageName}`
}

function parseFrontmatter(content: string): {
  content: string
  metadata: Record<string, string>
} {
  const frontmatterRegex = /^---\s*\n([\S\s]*?)\n---\s*\n([\S\s]*)$/
  const match = frontmatterRegex.exec(content)

  if (!match?.[1] || !match[2]) {
    return { content, metadata: {} }
  }

  const yamlContent = match[1]
  const bodyContent = match[2]

  const metadata: Record<string, string> = {}
  yamlContent.split('\n').forEach((line) => {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line
        .slice(colonIndex + 1)
        .trim()
        .replaceAll(/^["']|["']$/g, '')
      metadata[key] = value
    }
  })

  return { content: bodyContent, metadata }
}

function getComponentDirectory(component: RegistryComponent): string {
  if (component.files[0]?.path) {
    const componentFilePath = path.join(process.cwd(), component.files[0].path)
    return path.dirname(componentFilePath)
  }
  return path.join(process.cwd(), 'registry', 'default', component.name)
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { slug } = await props.params
  const component = registry.items.find(
    (item): item is RegistryComponent => item.name === slug && item.type === 'registry:component',
  )

  if (!component) {
    return {}
  }

  const componentDirectory = getComponentDirectory(component)
  const headerPath = path.join(componentDirectory, 'header.mdx')

  try {
    const headerContent = await readFile(headerPath, 'utf8')
    const { metadata } = parseFrontmatter(headerContent)

    return {
      description: metadata.description || component.description,
      openGraph: {
        description: metadata.description || component.description,
        title: metadata.title || component.title,
        type: 'website',
      },
      title: metadata.title || `${component.title} - VLLNT UI`,
      twitter: {
        card: 'summary_large_image',
        description: metadata.description || component.description,
        title: metadata.title || component.title,
      },
    }
  } catch {
    return {
      description: component.description,
      title: `${component.title} - VLLNT UI`,
    }
  }
}

export default async function ComponentPage(props: Props) {
  const { slug } = await props.params
  const component = registry.items.find(
    (item): item is RegistryComponent => item.name === slug && item.type === 'registry:component',
  )

  if (!component) {
    notFound()
  }

  // Read component file for code display - use actual source from @vllnt/ui
  let componentCode = ''
  try {
    // Map component name to actual source file path in packages/ui/src/components
    // Chart components are in chart/ subdirectory: packages/ui/src/components/chart/{name}.tsx
    const isChartComponent = ['area-chart', 'bar-chart', 'line-chart'].includes(component.name)

    if (isChartComponent) {
      const chartPath = path.join(
        process.cwd(),
        '..',
        '..',
        'packages',
        'ui',
        'src',
        'components',
        'chart',
        `${component.name}.tsx`,
      )
      componentCode = await readFile(chartPath, 'utf8')
    } else {
      // Most components are in subdirectories: packages/ui/src/components/{name}/{name}.tsx
      const subdirectoryPath = path.join(
        process.cwd(),
        '..',
        '..',
        'packages',
        'ui',
        'src',
        'components',
        component.name,
        `${component.name}.tsx`,
      )

      // Try reading from subdirectory first (most components)
      try {
        componentCode = await readFile(subdirectoryPath, 'utf8')
      } catch {
        // Fallback to direct file (e.g., theme-provider.tsx)
        const directPath = path.join(
          process.cwd(),
          '..',
          '..',
          'packages',
          'ui',
          'src',
          'components',
          `${component.name}.tsx`,
        )
        componentCode = await readFile(directPath, 'utf8')
      }
    }
  } catch (error) {
    console.error('Error reading component source file:', error)
  }

  const componentDirectory = getComponentDirectory(component)

  // Read header.mdx for title, description, and SEO metadata
  let headerContent = ''
  let headerMetadata: Record<string, string> = {}
  try {
    const headerPath = path.join(componentDirectory, 'header.mdx')
    const headerRaw = await readFile(headerPath, 'utf8')
    const parsed = parseFrontmatter(headerRaw)
    headerContent = parsed.content
    headerMetadata = parsed.metadata
  } catch {
    // Header file is optional, fallback to registry defaults
  }

  // Read example.mdx for usage examples
  let exampleContent = ''
  try {
    const examplePath = path.join(componentDirectory, 'example.mdx')
    exampleContent = await readFile(examplePath, 'utf8')
  } catch {
    // Example file is optional, ignore if it doesn't exist
  }

  const installCommand = `pnpm dlx shadcn@latest add https://ui.vllnt.com/r/${component.name}.json`

  const sections = [
    { id: 'installation', title: 'Installation' },
    ...(exampleContent ? [{ id: 'usage', title: 'Usage' }] : []),
    ...(componentCode ? [{ id: 'code', title: 'Code' }] : []),
    ...(component.dependencies && component.dependencies.length > 0
      ? [{ id: 'dependencies', title: 'Dependencies' }]
      : []),
  ] as { id: string; title: string }[]

  const displayTitle = headerMetadata.title || component.title
  const displayDescription = headerContent || headerMetadata.description || component.description

  return (
    <>
      <Sidebar sections={getSidebarSections(getCategoryForComponent(slug))} />
      <main className="flex-1 overflow-y-auto bg-background overflow-x-hidden">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_200px] gap-8">
            <div className="min-w-0">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">{displayTitle}</h1>
                {headerContent ? (
                  <div className="text-muted-foreground text-lg mb-6">
                    <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white prose-p:leading-7 prose-blockquote:mt-6 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:text-sm  prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-black prose-pre:py-4  prose-pre:text-sm prose-pre:text-white prose-pre:shadow-lg dark:prose-pre:bg-zinc-900 prose-hr:my-8 prose-hr:border-border prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium prose-td:border prose-td:border-border prose-td:p-2 prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-lg prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-strong:font-semibold prose-em:italic prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                      <MDXContent content={headerContent} />
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-lg mb-6">{displayDescription}</p>
                )}
                <QuickAdd componentName={component.name} />
              </div>

              {/* Preview Section */}
              <div className="mb-8 scroll-mt-8">
                <div className="rounded-lg border bg-card p-6">
                  <ComponentPreview componentName={component.name} />
                </div>
              </div>

              {/* Installation */}
              <div className="mb-8 scroll-mt-8" id="installation">
                <h2 className="text-2xl font-semibold mb-4">Installation</h2>
                <CodeBlock language="bash" showLanguage={true}>
                  {installCommand}
                </CodeBlock>
              </div>

              {/* Examples */}
              {exampleContent ? (
                <div className="mb-8 scroll-mt-8" id="usage">
                  <h2 className="text-2xl font-semibold mb-4">Usage</h2>
                  <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white prose-p:leading-7 prose-blockquote:mt-6 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.2rem] prose-code:text-sm  prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-black prose-pre:py-4  prose-pre:text-sm prose-pre:text-white prose-pre:shadow-lg dark:prose-pre:bg-zinc-900 prose-hr:my-8 prose-hr:border-border prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium prose-td:border prose-td:border-border prose-td:p-2 prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-lg prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-strong:font-semibold prose-em:italic prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
                    <MDXContent content={exampleContent} />
                  </div>
                </div>
              ) : null}

              {/* Code */}
              {componentCode ? (
                <div className="mb-8 scroll-mt-8" id="code">
                  <h2 className="text-2xl font-semibold mb-4">Code</h2>
                  <CodeBlock language="typescript" showLanguage={true}>
                    {componentCode}
                  </CodeBlock>
                </div>
              ) : null}

              {/* Dependencies */}
              {component.dependencies && component.dependencies.length > 0 ? (
                <div className="mb-8 scroll-mt-8" id="dependencies">
                  <h2 className="text-2xl font-semibold mb-4">Dependencies</h2>
                  <div className="rounded-lg border bg-card p-6">
                    <ul className="space-y-2">
                      {component.dependencies.map((dep) => {
                        const npmUrl = getNpmUrl(dep)
                        return (
                          <li className="flex items-center gap-2" key={dep}>
                            <code className="bg-muted px-2 py-1 rounded text-sm">{dep}</code>
                            <Link
                              className="text-muted-foreground hover:text-foreground transition-colors"
                              href={npmUrl}
                              rel="noopener noreferrer"
                              target="_blank"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Table of Contents */}
            <TableOfContents sections={sections} />
          </div>
        </div>
      </main>
    </>
  )
}
