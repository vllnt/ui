'use client'

import { useState } from 'react'

import { ChevronDown, HelpCircle } from 'lucide-react'
import type { ReactNode } from 'react'

import { cn } from '../../lib/utils'

export type FAQItemProps = {
  children: ReactNode
  defaultOpen?: boolean
  question: string
}

function FAQItem({ children, defaultOpen = false, question }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-4 text-left hover:text-primary transition-colors"
        onClick={() => {
          setIsOpen(!isOpen)
        }}
        type="button"
      >
        <span className="font-medium text-sm pr-4">{question}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0',
        )}
      >
        <div className="text-sm text-muted-foreground [&>p]:mb-2 [&>p:last-child]:mb-0">
          {children}
        </div>
      </div>
    </div>
  )
}

export type FAQProps = {
  children: ReactNode
  title?: string
}

function FAQ({ children, title = 'Frequently Asked Questions' }: FAQProps) {
  return (
    <div className="my-6 rounded-lg border bg-card">
      <div className="flex items-center gap-2 p-4 border-b border-border">
        <HelpCircle className="h-5 w-5 text-primary" />
        <h4 className="font-semibold">{title}</h4>
      </div>
      <div className="px-4">{children}</div>
    </div>
  )
}

FAQ.Item = FAQItem

export { FAQ, FAQItem }
