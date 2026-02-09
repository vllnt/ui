import { MDXContent, Sidebar } from '@vllnt/ui'

import { getSidebarSections } from '@/lib/sidebar-sections'

export default async function DocumentationPage() {
  const gettingStarted = `# Getting Started

Welcome to VLLNT UI. This is a component registry built with shadcn/ui.

## Installation

Install components using the shadcn CLI:

\`\`\`bash
pnpm dlx shadcn@latest add https://ui.vllnt.com/r/[component-name].json
\`\`\`

## Usage

Import components from \`@vllnt/ui\`:

\`\`\`tsx
import { Button } from '@vllnt/ui'

export function MyComponent() {
  return <Button>Click me</Button>
}
\`\`\`
`

  return (
    <>
      <Sidebar sections={getSidebarSections()} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto px-4 py-16 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">Documentation</h1>
            <p className="text-muted-foreground text-lg">
              Learn how to use VLLNT UI components in your projects.
            </p>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none">
            <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:mt-8 prose-headings:font-semibold prose-headings:text-black prose-h1:text-5xl prose-h2:text-4xl prose-h3:text-3xl prose-h4:text-2xl prose-h5:text-xl prose-h6:text-lg dark:prose-headings:text-white prose-p:leading-7 prose-blockquote:mt-6 prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic prose-ul:my-6 prose-ul:ml-6 prose-ul:list-disc prose-ol:my-6 prose-ol:ml-6 prose-ol:list-decimal prose-code:relative prose-code:rounded prose-code:bg-muted prose-code:px-[0.3rem] prose-code:py-[0.3rem] prose-code:text-sm  prose-pre:my-6 prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:border prose-pre:bg-black prose-pre:py-4  prose-pre:text-sm prose-pre:text-white prose-pre:shadow-lg dark:prose-pre:bg-zinc-900 prose-hr:my-8 prose-hr:border-border prose-table:w-full prose-table:border-collapse prose-table:border prose-table:border-border prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-th:text-left prose-th:font-medium prose-td:border prose-td:border-border prose-td:p-2 prose-img:rounded-lg prose-img:border prose-img:border-border prose-img:shadow-lg prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:underline-offset-4 hover:prose-a:text-primary/80 prose-strong:font-semibold prose-em:italic prose-blockquote:border-l-primary prose-blockquote:text-muted-foreground">
              <MDXContent content={gettingStarted} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
