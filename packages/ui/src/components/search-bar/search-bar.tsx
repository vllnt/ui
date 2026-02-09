'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouter, useSearchParams } from 'next/navigation'

import { useDebounce } from '../../lib/use-debounce'
import { Button } from '../button/button'
import { Input } from '../input/input'

type SearchBarProps = {
  className?: string
  onSearch?: (query: string) => void
  placeholder?: string
}

// eslint-disable-next-line max-lines-per-function
export function SearchBar({
  className,
  onSearch,
  placeholder = 'Search posts...',
}: SearchBarProps) {
  const router = useRouter()
  const searchParameters = useSearchParams()
  const initialQuery = searchParameters.get('search') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 300)
  const isInitialMount = useRef(true)
  const isUserTyping = useRef(false)

  const typingTimeoutReference = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastSetSearchParameterReference = useRef<string>('')
  const lastDebouncedQueryReference = useRef<string>('')

  // Sync query with URL search params (e.g., on browser back/forward)
  // Sync when user is not actively typing and URL changed externally
  useEffect(() => {
    const searchParameter = searchParameters.get('search') ?? ''

    // Skip if this is the search param we set ourselves
    if (searchParameter === lastSetSearchParameterReference.current) {
      return
    }

    // Sync if user is not actively typing and values differ
    if (!isUserTyping.current && query !== searchParameter) {
      setQuery(searchParameter)
      lastDebouncedQueryReference.current = searchParameter
    }
  }, [searchParameters, query]) // Include query to properly sync state

  // Update URL when debounced query changes
  useEffect(() => {
    // Skip initial mount to avoid unnecessary URL update
    if (isInitialMount.current) {
      isInitialMount.current = false
      const initialTrimmed = debouncedQuery.trim()
      lastDebouncedQueryReference.current = initialTrimmed
      lastSetSearchParameterReference.current = initialTrimmed
      return
    }

    const trimmedQuery = debouncedQuery.trim()

    // Skip if this is the same value we already processed
    if (trimmedQuery === lastDebouncedQueryReference.current) {
      return
    }

    lastDebouncedQueryReference.current = trimmedQuery

    if (onSearch) {
      onSearch(trimmedQuery)
      return
    }

    // Check current URL to avoid unnecessary updates
    const currentUrlParameter = searchParameters.get('search') ?? ''

    // Skip if URL already matches the debounced query
    if (trimmedQuery === currentUrlParameter) {
      lastSetSearchParameterReference.current = trimmedQuery
      return
    }

    const parameters = new URLSearchParams(searchParameters)
    if (trimmedQuery) {
      parameters.set('search', trimmedQuery)
    } else {
      parameters.delete('search')
    }
    const newUrl = parameters.toString()
    lastSetSearchParameterReference.current = trimmedQuery
    router.replace(`?${newUrl}`)
  }, [debouncedQuery, router, onSearch, searchParameters])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutReference.current) {
        clearTimeout(typingTimeoutReference.current)
      }
    }
  }, [])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    isUserTyping.current = true
    setQuery(event.target.value)

    // Clear existing timeout
    if (typingTimeoutReference.current) {
      clearTimeout(typingTimeoutReference.current)
    }

    // Reset typing flag after debounce delay + buffer
    typingTimeoutReference.current = setTimeout(() => {
      isUserTyping.current = false
    }, 350)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    isUserTyping.current = false

    // Clear typing timeout
    if (typingTimeoutReference.current) {
      clearTimeout(typingTimeoutReference.current)
    }

    const trimmedQuery = query.trim()
    if (onSearch) {
      onSearch(trimmedQuery)
    } else {
      const parameters = new URLSearchParams(searchParameters)
      if (trimmedQuery) {
        parameters.set('search', trimmedQuery)
      } else {
        parameters.delete('search')
      }
      const newUrl = parameters.toString()
      lastSetSearchParameterReference.current = trimmedQuery
      router.replace(`?${newUrl}`)
    }
  }

  return (
    <form className={`flex gap-2 ${className}`} onSubmit={handleSubmit}>
      <Input
        aria-label={placeholder}
        className="flex-1"
        onChange={handleInputChange}
        placeholder={placeholder}
        type="text"
        value={query}
      />
      <Button type="submit" variant="outline">
        Search
      </Button>
    </form>
  )
}
