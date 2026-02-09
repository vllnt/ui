'use client'

import { memo, useCallback, useState } from 'react'

import { cn } from '../../lib/utils'
import { Badge } from '../badge'

export type FilterOption = {
  label: string
  value: string
}

export type FilterBarLabels = {
  activeFilters?: string
  clearAll?: string
  clearTags?: string
  difficultyLabel?: string
  searchLabel?: string
  searchPlaceholder?: string
  tagsLabel?: string
}

export type FilterBarProps = {
  className?: string
  /** Current active difficulty filter */
  currentDifficulty: string
  /** Current active tags */
  currentTags: string[]
  /** Difficulty filter options */
  difficultyOptions: readonly FilterOption[]
  /** Labels for i18n */
  labels?: FilterBarLabels
  /** Callback when filters change */
  onFiltersChange: (filters: { difficulty?: string; search?: string; tags?: string[] }) => void
  /** Search query */
  searchQuery: string
  /** Available tags */
  tags: string[]
}

// Search input sub-component
function SearchInput({
  disabled,
  label,
  onChange,
  placeholder,
  value,
}: {
  disabled: boolean
  label: string
  onChange: (value: string) => void
  placeholder: string
  value: string
}): React.ReactNode {
  return (
    <div>
      <label className="sr-only" htmlFor="filter-search">
        {label}
      </label>
      <input
        className={cn(
          'w-full px-4 py-2 border border-border rounded-lg',
          'bg-background text-foreground placeholder:text-muted-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
        )}
        defaultValue={value}
        disabled={disabled}
        id="filter-search"
        onChange={(event) => {
          onChange(event.target.value)
        }}
        placeholder={placeholder}
        type="text"
      />
    </div>
  )
}

// Difficulty filter sub-component
function DifficultyFilter({
  activeDifficulty,
  disabled,
  label,
  onChange,
  options,
}: {
  activeDifficulty: string
  disabled: boolean
  label: string
  onChange: (value: string) => void
  options: readonly FilterOption[]
}): React.ReactNode {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = option.value === activeDifficulty
          return (
            <button
              className={cn(
                'px-3 py-1 text-sm rounded-lg border transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-background text-foreground border-border hover:bg-muted',
              )}
              disabled={disabled}
              key={option.value}
              onClick={() => {
                onChange(option.value)
              }}
              type="button"
            >
              {option.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Tag filter sub-component
function TagFilter({
  clearLabel,
  currentTags,
  label,
  onClearTags,
  onTagToggle,
  tags,
}: {
  clearLabel: string
  currentTags: string[]
  label: string
  onClearTags: () => void
  onTagToggle: (tag: string) => void
  tags: string[]
}): React.ReactNode {
  if (tags.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{label}</span>
        {currentTags.length > 0 ? (
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClearTags}
            type="button"
          >
            {clearLabel}
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = currentTags.includes(tag)
          return (
            <Badge
              className={cn(
                'cursor-pointer transition-all',
                isActive
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'hover:bg-muted',
              )}
              key={tag}
              onClick={() => {
                onTagToggle(tag)
              }}
              variant={isActive ? 'default' : 'outline'}
            >
              {tag}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}

// Active filters summary sub-component
function ActiveFiltersSummary({
  clearAllLabel,
  currentDifficulty,
  currentTags,
  difficultyOptions,
  label,
  onClearAll,
  searchLabel,
  searchQuery,
}: {
  clearAllLabel: string
  currentDifficulty: string
  currentTags: string[]
  difficultyOptions: readonly FilterOption[]
  label: string
  onClearAll: () => void
  searchLabel: string
  searchQuery: string
}): React.ReactNode {
  if (!currentDifficulty && currentTags.length === 0 && !searchQuery) return null

  const difficultyLabel = difficultyOptions.find((o) => o.value === currentDifficulty)?.label

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{label}</span>
      {difficultyLabel ? (
        <Badge className="capitalize" variant="secondary">
          {difficultyLabel}
        </Badge>
      ) : null}
      {currentTags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
      {searchQuery ? (
        <Badge variant="secondary">
          {searchLabel} &quot;{searchQuery}&quot;
        </Badge>
      ) : null}
      <button className="text-xs hover:underline" onClick={onClearAll} type="button">
        {clearAllLabel}
      </button>
    </div>
  )
}

const DEFAULT_LABELS: Required<FilterBarLabels> = {
  activeFilters: 'Active filters:',
  clearAll: 'Clear all',
  clearTags: 'Clear',
  difficultyLabel: 'Difficulty:',
  searchLabel: 'Search',
  searchPlaceholder: 'Search...',
  tagsLabel: 'Tags:',
}

// eslint-disable-next-line max-lines-per-function -- Complex filter component with sub-components
function FilterBarImpl({
  className,
  currentDifficulty,
  currentTags,
  difficultyOptions,
  labels = {},
  onFiltersChange,
  searchQuery,
  tags,
}: FilterBarProps): React.ReactNode {
  const [isPending, setIsPending] = useState(false)
  const mergedLabels = { ...DEFAULT_LABELS, ...labels }

  const handleDifficultyChange = useCallback(
    (difficulty: string): void => {
      setIsPending(true)
      onFiltersChange({ difficulty })
      setIsPending(false)
    },
    [onFiltersChange],
  )

  const handleSearchChange = useCallback(
    (search: string): void => {
      onFiltersChange({ search })
    },
    [onFiltersChange],
  )

  const handleTagToggle = useCallback(
    (tag: string): void => {
      const newTags = currentTags.includes(tag)
        ? currentTags.filter((t) => t !== tag)
        : [...currentTags, tag]
      onFiltersChange({ tags: newTags })
    },
    [currentTags, onFiltersChange],
  )

  const handleClearAll = useCallback((): void => {
    onFiltersChange({ difficulty: 'all', search: '', tags: [] })
    const input = document.querySelector<HTMLInputElement>('#filter-search')
    if (input) input.value = ''
  }, [onFiltersChange])

  const activeDifficulty = currentDifficulty || 'all'

  return (
    <div className={cn('space-y-4 mb-8', className)}>
      <SearchInput
        disabled={isPending}
        label={mergedLabels.searchLabel}
        onChange={handleSearchChange}
        placeholder={mergedLabels.searchPlaceholder}
        value={searchQuery}
      />
      <DifficultyFilter
        activeDifficulty={activeDifficulty}
        disabled={isPending}
        label={mergedLabels.difficultyLabel}
        onChange={handleDifficultyChange}
        options={difficultyOptions}
      />
      <TagFilter
        clearLabel={mergedLabels.clearTags}
        currentTags={currentTags}
        label={mergedLabels.tagsLabel}
        onClearTags={() => {
          onFiltersChange({ tags: [] })
        }}
        onTagToggle={handleTagToggle}
        tags={tags}
      />
      <ActiveFiltersSummary
        clearAllLabel={mergedLabels.clearAll}
        currentDifficulty={currentDifficulty}
        currentTags={currentTags}
        difficultyOptions={difficultyOptions}
        label={mergedLabels.activeFilters}
        onClearAll={handleClearAll}
        searchLabel={mergedLabels.searchLabel}
        searchQuery={searchQuery}
      />
    </div>
  )
}

export const FilterBar = memo(FilterBarImpl)
FilterBar.displayName = 'FilterBar'
