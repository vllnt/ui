'use client'

import { useEffect, useState } from 'react'

import { Search } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Button } from '../button'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../command'

type SearchItem = {
  description?: string
  id: string
  keywords?: string
  title: string
}

function useKeyboardShortcut(callback: () => void) {
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if ((event.key === 'k' || event.key === 'K') && (event.metaKey || event.ctrlKey)) {
        const target = event.target as HTMLElement | null
        if (
          target &&
          (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
        ) {
          return
        }

        event.preventDefault()
        event.stopPropagation()
        event.stopImmediatePropagation()
        callback()
      }
    }

    window.addEventListener('keydown', down, { capture: true, passive: false })
    return () => {
      window.removeEventListener('keydown', down, { capture: true })
    }
  }, [callback])
}

type SearchDialogProps = {
  buttonText?: string
  buttonTextMobile?: string
  emptyText?: string
  enableKeyboardShortcut?: boolean
  groupHeading?: string
  items: SearchItem[]
  onSelect: (item: SearchItem) => void
  searchPlaceholder?: string
}

export function SearchDialog({
  buttonText = 'Search...',
  buttonTextMobile = 'Search...',
  emptyText = 'No results found.',
  enableKeyboardShortcut = true,
  groupHeading,
  items,
  onSelect,
  searchPlaceholder = 'Search...',
}: SearchDialogProps) {
  const [open, setOpen] = useState(false)

  const sortedItems = [...items].sort((a, b) => a.title.localeCompare(b.title))

  useKeyboardShortcut(() => {
    if (enableKeyboardShortcut) {
      setOpen((previous) => !previous)
    }
  })

  const handleSelect = (item: SearchItem) => {
    setOpen(false)
    onSelect(item)
  }

  return (
    <>
      <Button
        className={cn(
          'relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64',
        )}
        onClick={() => {
          setOpen(true)
        }}
        variant="outline"
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">{buttonText}</span>
        <span className="inline-flex lg:hidden">{buttonTextMobile}</span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog onOpenChange={setOpen} open={open}>
        <CommandInput placeholder={searchPlaceholder} />
        <CommandList>
          <CommandEmpty>{emptyText}</CommandEmpty>
          <CommandGroup heading={groupHeading}>
            {sortedItems.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => {
                  handleSelect(item)
                }}
                value={`${item.title} ${item.description || ''} ${item.keywords || ''} ${item.id}`}
              >
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  {item.description ? (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  ) : null}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
