'use client'

import { lazy, memo, Suspense, use, useMemo } from 'react'

import { evaluate } from '@mdx-js/mdx'
import * as runtime from 'react/jsx-runtime'
import ReactMarkdown, { type Components } from 'react-markdown'

import { cn } from '../../lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../accordion'
import { Callout } from '../callout'
import { Checklist } from '../checklist'
import { CodePlayground, FileTree } from '../code-playground'
import { BeforeAfter, Comparison } from '../comparison'
import { Exercise } from '../exercise'
import { FAQ, FAQItem } from '../faq'
import { Glossary, KeyConcept } from '../key-concept'
import { LearningObjectives, Prerequisites, Summary } from '../learning-objectives'
import { CommonMistake, ProTip } from '../pro-tip'
import { Quiz } from '../quiz'
import { Step, StepByStep } from '../step-by-step'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../tabs'
import { SimpleTerminal, Terminal } from '../terminal'
import { VideoEmbed } from '../video-embed'

// Lazy load FlowDiagram to avoid loading @xyflow/react (~185KB) on every page
const LazyFlowDiagram = lazy(() =>
  import('../flow-diagram').then((module_) => ({ default: module_.FlowDiagram })),
)

// Wrapper component with Suspense fallback for FlowDiagram
function FlowDiagramWithSuspense(props: React.ComponentProps<typeof LazyFlowDiagram>) {
  return (
    <Suspense
      fallback={
        <div aria-label="Loading diagram..." className="h-96 bg-muted animate-pulse rounded-lg" />
      }
    >
      <LazyFlowDiagram {...props} />
    </Suspense>
  )
}

// MDX component map - all available components for tutorials
const mdxComponents = {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  BeforeAfter,
  Callout,
  Checklist,
  CodePlayground,
  CommonMistake,
  Comparison,
  Exercise,
  FAQ,
  FAQItem,
  FileTree,
  FlowDiagram: FlowDiagramWithSuspense,
  Glossary,
  KeyConcept,
  LearningObjectives,
  Prerequisites,
  ProTip,
  Quiz,
  SimpleTerminal,
  Step,
  StepByStep,
  Summary,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Terminal,
  VideoEmbed,
}

// Base markdown components for styling
const markdownComponents: Components = {
  a: ({ children, href, ...props }) => (
    <a
      className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6 py-2 text-sm"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({ children, className, ...props }) => {
    const isBlock = className?.includes('language-')
    if (isBlock) {
      return (
        <code className={cn('font-mono text-sm', className)} {...props}>
          {children}
        </code>
      )
    }
    return (
      <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
        {children}
      </code>
    )
  },
  h1: ({ children, ...props }) => (
    <h1 className="text-2xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2 className="text-xl font-bold mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3 className="text-lg font-bold mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  h4: ({ children, ...props }) => (
    <h4 className="text-base font-bold mt-3 mb-2" {...props}>
      {children}
    </h4>
  ),
  hr: ({ ...props }) => <hr className="my-8 border-border" {...props} />,
  li: ({ children, ...props }) => (
    <li className="mb-2 leading-relaxed text-muted-foreground text-sm pl-2" {...props}>
      {children}
    </li>
  ),
  ol: ({ children, ...props }) => (
    <ol
      className="list-decimal list-outside mb-6 space-y-2 ml-6 text-muted-foreground text-sm"
      {...props}
    >
      {children}
    </ol>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 leading-relaxed text-muted-foreground text-sm" {...props}>
      {children}
    </p>
  ),
  pre: ({ children, ...props }) => (
    <pre
      className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto my-6 border border-zinc-800 shadow-lg font-mono text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  strong: ({ children, ...props }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  table: ({ children, ...props }) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse border border-border" {...props}>
        {children}
      </table>
    </div>
  ),
  td: ({ children, ...props }) => (
    <td className="border border-border p-2 text-sm" {...props}>
      {children}
    </td>
  ),
  th: ({ children, ...props }) => (
    <th className="border border-border bg-muted p-2 text-left font-medium text-sm" {...props}>
      {children}
    </th>
  ),
  ul: ({ children, ...props }) => (
    <ul
      className="list-disc list-outside mb-6 space-y-2 ml-6 text-muted-foreground text-sm"
      {...props}
    >
      {children}
    </ul>
  ),
}

// Combine all components
const allComponents = {
  ...markdownComponents,
  ...mdxComponents,
}

export type TutorialMDXProps = {
  className?: string
  content: string
}

// Check if content contains JSX components (excluding code blocks)
function hasJSXComponents(content: string): boolean {
  const contentWithoutCodeBlocks = content.replaceAll(/```[\S\s]*?```/g, '')
  return /<[A-Z][A-Za-z]*[\s/>]/.test(contentWithoutCodeBlocks)
}

// Component that renders MDX with Suspense
function MDXWithSuspense({ className, content }: TutorialMDXProps) {
  const mdxPromise = useMemo(
    () =>
      evaluate(content, {
        ...runtime,
        baseUrl: import.meta.url,
      }),
    [content],
  )

  return (
    <div className={className}>
      <Suspense fallback={<MDXLoadingFallback />}>
        <MDXContent mdxPromise={mdxPromise} />
      </Suspense>
    </div>
  )
}

// Component that renders plain markdown
function MarkdownOnly({ className, content }: TutorialMDXProps) {
  return (
    <div className={className}>
      <ReactMarkdown components={markdownComponents}>{content}</ReactMarkdown>
    </div>
  )
}

// Component that uses the promise
function MDXContent({
  mdxPromise,
}: {
  mdxPromise: Promise<{ default: React.ComponentType<{ components: typeof allComponents }> }>
}) {
  const { default: Component } = use(mdxPromise)
  return <Component components={allComponents} />
}

function MDXLoadingFallback() {
  return <div aria-hidden="true" className="min-h-[100px]" />
}

// Main component that decides which renderer to use
function TutorialMDXImpl({ className, content }: TutorialMDXProps): React.ReactNode {
  const hasJSX = hasJSXComponents(content)

  if (hasJSX) {
    return <MDXWithSuspense className={className} content={content} />
  }

  return <MarkdownOnly className={className} content={content} />
}

export const TutorialMDX = memo(TutorialMDXImpl)
TutorialMDX.displayName = 'TutorialMDX'

export { mdxComponents }
