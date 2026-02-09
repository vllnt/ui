'use client'

import { useState } from 'react'

import { Check, Code, Copy, FileCode } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Button } from '../button'

type CodeLineProps = {
  highlightLines: number[]
  line: string
  lineNumber: number
}

function CodeLine({ highlightLines, line, lineNumber }: CodeLineProps) {
  const isHighlighted = highlightLines.includes(lineNumber)
  return (
    <div className={cn('flex', isHighlighted && 'bg-primary/10 -mx-4 px-4')}>
      <span className="select-none w-8 text-right pr-4 text-muted-foreground/50">{lineNumber}</span>
      <span>{line}</span>
    </div>
  )
}

export type CodePlaygroundProps = {
  children: ReactNode
  description?: string
  filename?: string
  highlightLines?: number[]
  language?: string
  showLineNumbers?: boolean
  title: string
}

export function CodePlayground({
  children,
  description,
  filename,
  highlightLines = [],
  language = 'typescript',
  showLineNumbers = false,
  title,
}: CodePlaygroundProps) {
  const [copied, setCopied] = useState(false)
  const code = typeof children === 'string' ? children : ''
  const lines = code.split('\n')

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => {
      setCopied(false)
    }, 2000)
  }

  return (
    <div className="my-6 rounded-lg border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/10">
            <Code className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold text-sm">{title}</h4>
            {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {filename ? (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <FileCode className="h-3 w-3" />
              <span className="font-mono">{filename}</span>
            </div>
          ) : null}
          <Button className="h-8 w-8" onClick={handleCopy} size="icon" variant="ghost">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
      </div>
      <div className="relative overflow-x-auto">
        <pre className="p-4 text-sm font-mono">
          {showLineNumbers ? (
            <code>
              {lines.map((line, index) => (
                <CodeLine
                  highlightLines={highlightLines}
                  key={index}
                  line={line}
                  lineNumber={index + 1}
                />
              ))}
            </code>
          ) : (
            <code>{code}</code>
          )}
        </pre>
      </div>
      <div className="px-4 py-2 border-t bg-muted/30">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
          {language}
        </span>
      </div>
    </div>
  )
}

export type FileTreeProps = {
  children: ReactNode
  title?: string
}

export function FileTree({ children, title = 'File Structure' }: FileTreeProps) {
  return (
    <div className="my-6 rounded-lg border bg-card overflow-hidden">
      <div className="px-4 py-2 border-b bg-muted/30">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <FileCode className="h-4 w-4" />
          {title}
        </h4>
      </div>
      <div className="p-4 font-mono text-sm [&>ul]:m-0 [&>ul]:list-none [&_ul]:ml-4 [&_ul]:list-none [&_li]:text-muted-foreground">
        {children}
      </div>
    </div>
  )
}
