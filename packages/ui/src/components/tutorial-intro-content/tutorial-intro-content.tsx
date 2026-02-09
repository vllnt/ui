import ReactMarkdown from 'react-markdown'

import { cn } from '../../lib/utils'

export type TutorialIntroContentProps = {
  className?: string
  content: string
  title: string
}

// Server-side markdown components (no 'use client')
const serverMarkdownComponents = {
  a: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { children?: React.ReactNode }) => (
    <a
      className="text-primary underline underline-offset-4 hover:text-primary/80 font-medium"
      href={href}
      {...props}
    >
      {children}
    </a>
  ),
  blockquote: ({
    children,
    ...props
  }: React.BlockquoteHTMLAttributes<HTMLQuoteElement> & { children?: React.ReactNode }) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic text-muted-foreground my-6 py-2 text-sm"
      {...props}
    >
      {children}
    </blockquote>
  ),
  code: ({
    children,
    className: codeClassName,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => {
    const isBlock = codeClassName?.includes('language-')
    if (isBlock) {
      return (
        <code className={cn('font-mono text-sm', codeClassName)} {...props}>
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
  h1: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => (
    <h1 className="text-2xl font-bold mt-8 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => (
    <h2 className="text-xl font-bold mt-6 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement> & { children?: React.ReactNode }) => (
    <h3 className="text-lg font-bold mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  hr: (props: React.HTMLAttributes<HTMLHRElement>) => (
    <hr className="my-8 border-border" {...props} />
  ),
  li: ({
    children,
    ...props
  }: React.LiHTMLAttributes<HTMLLIElement> & { children?: React.ReactNode }) => (
    <li className="mb-2 leading-relaxed text-muted-foreground text-sm pl-2" {...props}>
      {children}
    </li>
  ),
  ol: ({
    children,
    ...props
  }: React.OlHTMLAttributes<HTMLOListElement> & { children?: React.ReactNode }) => (
    <ol
      className="list-decimal list-outside mb-6 space-y-2 ml-6 text-muted-foreground text-sm"
      {...props}
    >
      {children}
    </ol>
  ),
  p: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement> & { children?: React.ReactNode }) => (
    <p className="mb-4 leading-relaxed text-muted-foreground text-sm" {...props}>
      {children}
    </p>
  ),
  pre: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement> & { children?: React.ReactNode }) => (
    <pre
      className="bg-zinc-950 dark:bg-zinc-900 text-zinc-100 p-4 rounded-lg overflow-x-auto my-6 border border-zinc-800 shadow-lg font-mono text-sm"
      {...props}
    >
      {children}
    </pre>
  ),
  strong: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) => (
    <strong className="font-semibold text-foreground" {...props}>
      {children}
    </strong>
  ),
  ul: ({
    children,
    ...props
  }: React.HTMLAttributes<HTMLUListElement> & { children?: React.ReactNode }) => (
    <ul
      className="list-disc list-outside mb-6 space-y-2 ml-6 text-muted-foreground text-sm"
      {...props}
    >
      {children}
    </ul>
  ),
}

// Strip MDX component tags for server rendering (they render on client)
function stripMDXComponents(content: string): string {
  let cleaned = content.replaceAll(/<[A-Z][A-Za-z]*[^>]*\/>/g, '')
  cleaned = cleaned.replaceAll(/<[A-Z][A-Za-z]*[^>]*>[\S\s]*?<\/[A-Z][A-Za-z]*>/g, '')
  return cleaned
}

export function TutorialIntroContent({
  className,
  content,
  title,
}: TutorialIntroContentProps): React.ReactNode {
  const markdownContent = stripMDXComponents(content)

  return (
    <section className={cn('py-6', className)}>
      <h2 className="text-2xl md:text-3xl font-bold mb-6">{title}</h2>
      <div className="max-w-none [&_h2:first-of-type]:hidden">
        <ReactMarkdown components={serverMarkdownComponents}>{markdownContent}</ReactMarkdown>
      </div>
    </section>
  )
}
