'use client'

import { useMemo, useRef, useState } from 'react'

import { ArrowUpDown, Filter } from 'lucide-react'

import { cn } from '../../lib/utils'
import { Badge } from '../badge'
import { Button } from '../button'
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../command'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu'
import { Input } from '../input'

/** Model information for the selector. */
export type ModelInfo = {
  description?: string
  id: string
  name: string
  pricing?: {
    input?: number // per 1M tokens
    output?: number // per 1M tokens
  }
}

export type ModelSelectorProps = {
  models: ModelInfo[]
  onOpenChange: (open: boolean) => void
  onSelectModel: (modelId: string) => void
  open: boolean
  selectedModelId: string
}

type SortOption = 'name' | 'price-high' | 'price-low' | 'provider'
type SelectionGuardReference = { current: null | string }

function getProvider(modelId: string): string {
  const parts = modelId.split('/')
  return parts[0] || 'unknown'
}

function getAveragePrice(model: ModelInfo): number {
  if (!model.pricing) return Number.POSITIVE_INFINITY
  const inputPrice = model.pricing.input ?? 0
  const outputPrice = model.pricing.output ?? inputPrice
  return (inputPrice + outputPrice) / 2
}

function formatPrice(price?: number): string {
  if (!price) return 'N/A'
  return `$${price.toFixed(2)}/1M`
}

function getProviders(models: ModelInfo[]): string[] {
  const { providers } = models.reduce<{ providers: string[]; seen: Set<string> }>(
    (accumulator, model) => {
      const provider = getProvider(model.id)
      if (!accumulator.seen.has(provider)) {
        accumulator.seen.add(provider)
        accumulator.providers.push(provider)
      }
      return accumulator
    },
    { providers: [], seen: new Set<string>() },
  )
  return providers.sort()
}

function applyProviderFilter(models: ModelInfo[], providerFilter: string) {
  if (providerFilter === 'all') return models
  return models.filter((model) => getProvider(model.id) === providerFilter)
}

function applySearchFilter(models: ModelInfo[], modelSearchQuery: string) {
  if (!modelSearchQuery.trim()) return models
  const query = modelSearchQuery.toLowerCase()
  return models.filter(
    (model) =>
      model.name.toLowerCase().includes(query) ||
      model.id.toLowerCase().includes(query) ||
      model.description?.toLowerCase().includes(query) ||
      getProvider(model.id).toLowerCase().includes(query),
  )
}

function sortModelsBy(models: ModelInfo[], sortBy: SortOption) {
  const sorted = [...models]
  return sorted.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'price-low':
        return getAveragePrice(a) - getAveragePrice(b)
      case 'price-high':
        return getAveragePrice(b) - getAveragePrice(a)
      case 'provider': {
        const providerA = getProvider(a.id)
        const providerB = getProvider(b.id)
        if (providerA !== providerB) return providerA.localeCompare(providerB)
        return a.name.localeCompare(b.name)
      }
      default:
        return 0
    }
  })
}

function promoteSelected(models: ModelInfo[], selectedModelId: string) {
  const sorted = [...models]
  const selectedIndex = sorted.findIndex((model) => model.id === selectedModelId)
  if (selectedIndex > 0) {
    const [selected] = sorted.splice(selectedIndex, 1)
    if (selected) sorted.unshift(selected)
  }
  return sorted
}

function resetFilters(
  setModelSearchQuery: (value: string) => void,
  setProviderFilter: (value: string) => void,
  setSortBy: (value: SortOption) => void,
) {
  setModelSearchQuery('')
  setProviderFilter('all')
  setSortBy('name')
}

type HandleModelSelectArguments = {
  handleClose: (nextOpen: boolean) => void
  id: string
  onSelectModel: (id: string) => void
  selectionGuardReference: SelectionGuardReference
}

function handleModelSelect({
  handleClose,
  id,
  onSelectModel,
  selectionGuardReference,
}: HandleModelSelectArguments) {
  if (selectionGuardReference.current === id) return
  selectionGuardReference.current = id
  onSelectModel(id)
  setTimeout(() => {
    if (selectionGuardReference.current === id) selectionGuardReference.current = null
  }, 0)
  handleClose(false)
}

type FilterAndSortArguments = {
  models: ModelInfo[]
  modelSearchQuery: string
  providerFilter: string
  selectedModelId: string
  sortBy: SortOption
}

function filterAndSortModels({
  models,
  modelSearchQuery,
  providerFilter,
  selectedModelId,
  sortBy,
}: FilterAndSortArguments): ModelInfo[] {
  const filtered = applySearchFilter(applyProviderFilter(models, providerFilter), modelSearchQuery)
  return promoteSelected(sortModelsBy(filtered, sortBy), selectedModelId)
}

function useFilteredModels(options: FilterAndSortArguments) {
  const { models, modelSearchQuery, providerFilter, selectedModelId, sortBy } = options
  return useMemo(
    () =>
      filterAndSortModels({
        models,
        modelSearchQuery,
        providerFilter,
        selectedModelId,
        sortBy,
      }),
    [models, modelSearchQuery, sortBy, providerFilter, selectedModelId],
  )
}

type ModelSelectorState = {
  filteredAndSortedModels: ModelInfo[]
  handleClose: (nextOpen: boolean) => void
  handleSelect: (id: string) => void
  modelSearchQuery: string
  providerFilter: string
  providers: string[]
  setModelSearchQuery: (value: string) => void
  setProviderFilter: (value: string) => void
  setSortBy: (value: SortOption) => void
  sortBy: SortOption
}

function useModelSelectorState({
  models,
  onOpenChange,
  onSelectModel,
  selectedModelId,
}: ModelSelectorProps): ModelSelectorState {
  const [modelSearchQuery, setModelSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [providerFilter, setProviderFilter] = useState<string>('all')
  const selectionGuardReference = useRef<null | string>(null)
  const providers = useMemo(() => getProviders(models), [models])
  const filteredAndSortedModels = useFilteredModels({
    models,
    modelSearchQuery,
    providerFilter,
    selectedModelId,
    sortBy,
  })
  const handleClose = (nextOpen: boolean) => {
    onOpenChange(nextOpen)
    if (!nextOpen) {
      resetFilters(setModelSearchQuery, setProviderFilter, setSortBy)
    }
  }
  const handleSelect = (id: string) => {
    handleModelSelect({
      handleClose,
      id,
      onSelectModel,
      selectionGuardReference,
    })
  }
  return {
    filteredAndSortedModels,
    handleClose,
    handleSelect,
    modelSearchQuery,
    providerFilter,
    providers,
    setModelSearchQuery,
    setProviderFilter,
    setSortBy,
    sortBy,
  }
}

type ProviderFilterMenuProps = {
  onChange: (value: string) => void
  providerFilter: string
  providers: string[]
}

function ProviderFilterMenu({ onChange, providerFilter, providers }: ProviderFilterMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-9 gap-2" size="sm" variant="outline">
          <Filter className="h-4 w-4" />
          {providerFilter === 'all' ? 'All Providers' : providerFilter}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Filter by Provider</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup onValueChange={onChange} value={providerFilter}>
          <DropdownMenuRadioItem value="all">All Providers</DropdownMenuRadioItem>
          {providers.map((provider) => (
            <DropdownMenuRadioItem key={provider} value={provider}>
              {provider}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type SortMenuProps = {
  onChange: (value: SortOption) => void
  sortBy: SortOption
}

function SortMenu({ onChange, sortBy }: SortMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-9 gap-2" size="sm" variant="outline">
          <ArrowUpDown className="h-4 w-4" />
          Sort
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup
          onValueChange={(value) => {
            onChange(value as SortOption)
          }}
          value={sortBy}
        >
          <DropdownMenuRadioItem value="name">Name</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="provider">Provider</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-low">Price: Low to High</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="price-high">Price: High to Low</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

type ModelSelectorFiltersProps = {
  modelSearchQuery: string
  onProviderChange: (value: string) => void
  onSearchChange: (value: string) => void
  onSortChange: (value: SortOption) => void
  providerFilter: string
  providers: string[]
  sortBy: SortOption
}

function ModelSelectorFilters({
  modelSearchQuery,
  onProviderChange,
  onSearchChange,
  onSortChange,
  providerFilter,
  providers,
  sortBy,
}: ModelSelectorFiltersProps) {
  return (
    <div className="flex items-center gap-2 px-1 pb-2 border-b">
      <div className="flex-1">
        <Input
          className="h-9"
          onChange={(event) => {
            onSearchChange(event.target.value)
          }}
          placeholder="Search models or providers..."
          value={modelSearchQuery}
        />
      </div>
      <ProviderFilterMenu
        onChange={onProviderChange}
        providerFilter={providerFilter}
        providers={providers}
      />
      <SortMenu onChange={onSortChange} sortBy={sortBy} />
    </div>
  )
}

type ModelListProps = {
  models: ModelInfo[]
  onSelect: (id: string) => void
  selectedModelId: string
}

function ModelList({ models, onSelect, selectedModelId }: ModelListProps) {
  return (
    <Command className="flex-1" shouldFilter={false}>
      <CommandList className="max-h-[60vh]">
        <CommandEmpty>No models found.</CommandEmpty>
        <CommandGroup>
          {models.map((model) => (
            <ModelListItem
              key={model.id}
              model={model}
              onSelect={onSelect}
              selectedModelId={selectedModelId}
            />
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

type ModelPricingProps = {
  pricing?: ModelInfo['pricing']
}

function ModelPricing({ pricing }: ModelPricingProps) {
  if (!pricing) return null

  return (
    <div className="flex items-center gap-3 text-xs text-muted-foreground pointer-events-none">
      {pricing.input ? <span>In: {formatPrice(pricing.input)}</span> : null}
      {pricing.output ? <span>Out: {formatPrice(pricing.output)}</span> : null}
    </div>
  )
}

type ModelListItemProps = {
  model: ModelInfo
  onSelect: (id: string) => void
  selectedModelId: string
}

function ModelListItem({ model, onSelect, selectedModelId }: ModelListItemProps) {
  const isSelected = selectedModelId === model.id
  const provider = getProvider(model.id)

  return (
    <CommandItem
      className={cn('flex flex-col items-start py-3', isSelected && 'bg-accent')}
      disabled={isSelected}
      onSelect={() => {
        onSelect(model.id)
      }}
      value={model.id}
    >
      <div className="flex items-center justify-between w-full pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="font-medium">{model.name}</span>
          {isSelected ? (
            <Badge className="text-xs pointer-events-none" variant="secondary">
              Selected
            </Badge>
          ) : null}
          <Badge className="text-xs font-mono pointer-events-none" variant="outline">
            {provider}
          </Badge>
        </div>
        <ModelPricing pricing={model.pricing} />
      </div>
      {model.description ? (
        <span className="text-xs text-muted-foreground mt-1 pointer-events-none">
          {model.description}
        </span>
      ) : null}
      <span className="text-xs text-muted-foreground mt-1 font-mono pointer-events-none">
        {model.id}
      </span>
    </CommandItem>
  )
}

/** Model selector dialog with search, filtering, and sorting. */
export function ModelSelector(props: ModelSelectorProps) {
  const {
    filteredAndSortedModels,
    handleClose,
    handleSelect,
    modelSearchQuery,
    providerFilter,
    providers,
    setModelSearchQuery,
    setProviderFilter,
    setSortBy,
    sortBy,
  } = useModelSelectorState(props)

  return (
    <Dialog onOpenChange={handleClose} open={props.open}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Model</DialogTitle>
        </DialogHeader>
        <ModelSelectorFilters
          modelSearchQuery={modelSearchQuery}
          onProviderChange={setProviderFilter}
          onSearchChange={setModelSearchQuery}
          onSortChange={setSortBy}
          providerFilter={providerFilter}
          providers={providers}
          sortBy={sortBy}
        />
        <ModelList
          models={filteredAndSortedModels}
          onSelect={handleSelect}
          selectedModelId={props.selectedModelId}
        />
      </DialogContent>
    </Dialog>
  )
}
