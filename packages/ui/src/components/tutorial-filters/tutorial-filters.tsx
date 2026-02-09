'use client'

import { memo } from 'react'

import { Badge } from '../badge'

export type TutorialFiltersLabels = {
  activeFilters: string
  clear: string
  clearAll: string
  difficulty: Record<string, string>
  difficultyLabel: string
  searchFilter: string
  searchLabel: string
  searchPlaceholder: string
  tagsLabel: string
}

export type FilterUpdates = {
  difficulty?: string
  search?: string
  tags?: string[]
}

export type TutorialFiltersProps = {
  currentDifficulty: string
  currentTags: string[]
  difficultyOptions?: string[]
  isPending?: boolean
  labels: TutorialFiltersLabels
  onFilterChange: (updates: FilterUpdates) => void
  searchQuery: string
  tags: string[]
}

function SearchInput({
  isPending,
  labels,
  onSearchChange,
  searchQuery,
}: {
  isPending: boolean
  labels: TutorialFiltersLabels
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  searchQuery: string
}): React.ReactNode {
  return (
    <div>
      <label className="sr-only" htmlFor="tutorial-search">
        {labels.searchLabel}
      </label>
      <input
        className="w-full px-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        defaultValue={searchQuery}
        disabled={isPending}
        id="tutorial-search"
        onChange={onSearchChange}
        placeholder={labels.searchPlaceholder}
        type="text"
      />
    </div>
  )
}

function DifficultyFilter({
  activeDifficulty,
  difficultyOptions,
  isPending,
  labels,
  onDifficultyChange,
}: {
  activeDifficulty: string
  difficultyOptions: string[]
  isPending: boolean
  labels: TutorialFiltersLabels
  onDifficultyChange: (difficulty: string) => void
}): React.ReactNode {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{labels.difficultyLabel}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {difficultyOptions.map((difficulty) => {
          const isActive = difficulty === activeDifficulty
          return (
            <button
              className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'bg-background text-foreground border-border hover:bg-muted'
              }`}
              disabled={isPending}
              key={difficulty}
              onClick={() => {
                onDifficultyChange(difficulty)
              }}
              type="button"
            >
              <span className="capitalize">{labels.difficulty[difficulty] || difficulty}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

function TagFilter({
  currentTags,
  labels,
  onClearTags,
  onTagToggle,
  tags,
}: {
  currentTags: string[]
  labels: TutorialFiltersLabels
  onClearTags: () => void
  onTagToggle: (tag: string) => void
  tags: string[]
}): React.ReactNode {
  if (tags.length === 0) {
    return null
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-medium">{labels.tagsLabel}</span>
        {currentTags.length > 0 ? (
          <button
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={onClearTags}
            type="button"
          >
            {labels.clear}
          </button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => {
          const isActive = currentTags.includes(tag)
          return (
            <Badge
              className={`cursor-pointer transition-all ${
                isActive
                  ? 'bg-primary text-primary-foreground border-transparent'
                  : 'hover:bg-muted'
              }`}
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

function ActiveFiltersSummary({
  currentDifficulty,
  currentTags,
  labels,
  onClearAll,
  searchQuery,
}: {
  currentDifficulty: string
  currentTags: string[]
  labels: TutorialFiltersLabels
  onClearAll: () => void
  searchQuery: string
}): React.ReactNode {
  if (!currentDifficulty && currentTags.length === 0 && !searchQuery) {
    return null
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span>{labels.activeFilters}</span>
      {currentDifficulty ? (
        <Badge className="capitalize" variant="secondary">
          {labels.difficulty[currentDifficulty] || currentDifficulty}
        </Badge>
      ) : null}
      {currentTags.map((tag) => (
        <Badge key={tag} variant="secondary">
          {tag}
        </Badge>
      ))}
      {searchQuery ? (
        <Badge variant="secondary">
          {labels.searchFilter} &quot;{searchQuery}&quot;
        </Badge>
      ) : null}
      <button className="text-xs hover:underline" onClick={onClearAll} type="button">
        {labels.clearAll}
      </button>
    </div>
  )
}

const DEFAULT_DIFFICULTY_OPTIONS = ['all', 'beginner', 'intermediate', 'advanced']

function TutorialFiltersImpl({
  currentDifficulty,
  currentTags,
  difficultyOptions = DEFAULT_DIFFICULTY_OPTIONS,
  isPending = false,
  labels,
  onFilterChange,
  searchQuery,
  tags,
}: TutorialFiltersProps): React.ReactNode {
  const activeDifficulty = currentDifficulty || 'all'

  const handleDifficultyChange = (difficulty: string): void => {
    onFilterChange({ difficulty })
  }

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    onFilterChange({ search: event.target.value })
  }

  const handleTagToggle = (tag: string): void => {
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag]
    onFilterChange({ tags: newTags })
  }

  const handleClearAll = (): void => {
    onFilterChange({ difficulty: 'all', search: '', tags: [] })
    const input = document.querySelector<HTMLInputElement>('#tutorial-search')
    if (input) input.value = ''
  }

  return (
    <div className="space-y-4 mb-8">
      <SearchInput
        isPending={isPending}
        labels={labels}
        onSearchChange={handleSearchChange}
        searchQuery={searchQuery}
      />
      <DifficultyFilter
        activeDifficulty={activeDifficulty}
        difficultyOptions={difficultyOptions}
        isPending={isPending}
        labels={labels}
        onDifficultyChange={handleDifficultyChange}
      />
      <TagFilter
        currentTags={currentTags}
        labels={labels}
        onClearTags={() => {
          onFilterChange({ tags: [] })
        }}
        onTagToggle={handleTagToggle}
        tags={tags}
      />
      <ActiveFiltersSummary
        currentDifficulty={currentDifficulty}
        currentTags={currentTags}
        labels={labels}
        onClearAll={handleClearAll}
        searchQuery={searchQuery}
      />
    </div>
  )
}

export const TutorialFilters = memo(TutorialFiltersImpl)
TutorialFilters.displayName = 'TutorialFilters'
