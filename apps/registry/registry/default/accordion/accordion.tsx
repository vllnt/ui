'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'

import type { ReactNode } from 'react'

import { cn } from '../../../lib/utils'

// Context for accordion state
type AccordionContextValue = {
  openItems: Set<string>
  toggleItem: (value: string) => void
  type: 'multiple' | 'single'
}

const AccordionContext = createContext<AccordionContextValue | null>(null)

function useAccordionContext(): AccordionContextValue {
  const context = useContext(AccordionContext)
  if (!context) {
    throw new Error('AccordionItem must be used within an Accordion')
  }
  return context
}

export type AccordionProps = {
  children: ReactNode
  className?: string
  defaultValue?: string | string[]
  type?: 'multiple' | 'single'
}

function Accordion({
  children,
  className,
  defaultValue,
  type = 'single',
}: AccordionProps): React.ReactNode {
  const [openItems, setOpenItems] = useState<Set<string>>(() => {
    if (!defaultValue) return new Set()
    if (Array.isArray(defaultValue)) return new Set(defaultValue)
    return new Set([defaultValue])
  })

  const toggleItem = useCallback(
    (value: string) => {
      setOpenItems((previous) => {
        const newSet = new Set(previous)
        if (newSet.has(value)) {
          newSet.delete(value)
        } else {
          if (type === 'single') {
            newSet.clear()
          }
          newSet.add(value)
        }
        return newSet
      })
    },
    [type],
  )

  const contextValue = useMemo(
    () => ({ openItems, toggleItem, type }),
    [openItems, toggleItem, type],
  )

  return (
    <AccordionContext.Provider value={contextValue}>
      <div className={cn('my-6 divide-y divide-border rounded-lg border', className)}>
        {children}
      </div>
    </AccordionContext.Provider>
  )
}

export type AccordionItemProps = {
  children: ReactNode
  className?: string
  value: string
}

function AccordionItem({ children, className, value }: AccordionItemProps): React.ReactNode {
  return (
    <div
      className={cn('first:rounded-t-lg last:rounded-b-lg overflow-hidden', className)}
      data-value={value}
    >
      {children}
    </div>
  )
}

export type AccordionTriggerProps = {
  children: ReactNode
  className?: string
  icon?: ReactNode
  value: string
}

function AccordionTrigger({
  children,
  className,
  icon,
  value,
}: AccordionTriggerProps): React.ReactNode {
  const { openItems, toggleItem } = useAccordionContext()
  const isOpen = openItems.has(value)

  return (
    <button
      aria-expanded={isOpen}
      className={cn(
        'w-full flex items-center justify-between p-4 text-left font-medium transition-colors',
        'hover:bg-muted/50',
        isOpen && 'bg-muted/30',
        className,
      )}
      onClick={() => {
        toggleItem(value)
      }}
      type="button"
    >
      <span className="text-sm">{children}</span>
      {icon ? (
        <span
          className={cn(
            'h-4 w-4 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        >
          {icon}
        </span>
      ) : (
        <svg
          className={cn(
            'h-4 w-4 flex-shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
        </svg>
      )}
    </button>
  )
}

export type AccordionContentProps = {
  children: ReactNode
  className?: string
  value: string
}

function AccordionContent({ children, className, value }: AccordionContentProps): React.ReactNode {
  const { openItems } = useAccordionContext()
  const isOpen = openItems.has(value)

  return (
    <div
      className={cn(
        'overflow-hidden transition-all duration-200',
        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0',
      )}
    >
      <div className={cn('p-4 pt-0 text-sm text-muted-foreground [&>p]:mb-2 [&>pre]:my-2', className)}>
        {children}
      </div>
    </div>
  )
}

// Attach sub-components
Accordion.Item = AccordionItem
Accordion.Trigger = AccordionTrigger
Accordion.Content = AccordionContent

export { Accordion, AccordionContent, AccordionItem, AccordionTrigger }
