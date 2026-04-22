"use client";

import { forwardRef, useMemo, useState } from "react";

import { Check, ChevronRight, Search } from "lucide-react";

import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import { Button } from "../button";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import { ScrollArea } from "../scroll-area";
import { Separator } from "../separator";

export type ScopeSelectorNode = {
  badge?: string;
  children?: ScopeSelectorNode[];
  description?: string;
  disabled?: boolean;
  id: string;
  label: string;
  selectable?: boolean;
};

export type ScopeSelectorSelection = {
  node: ScopeSelectorNode;
  path: ScopeSelectorNode[];
};

export type ScopeSelectorProps = {
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  emptyMessage?: string;
  nodes: ScopeSelectorNode[];
  onValueChange?: (selection: ScopeSelectorSelection) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  value?: string;
};

type FlattenedScopeNode = {
  node: ScopeSelectorNode;
  path: ScopeSelectorNode[];
};

type ScopeOptionButtonProps = {
  node: ScopeSelectorNode;
  onBrowse: (node: ScopeSelectorNode) => void;
  onSelect: (selection: ScopeSelectorSelection) => void;
  path: ScopeSelectorNode[];
  selectedValue?: string;
  showPathLabel?: boolean;
};

type ScopePanelProps = {
  currentPath: ScopeSelectorNode[];
  emptyMessage: string;
  nodes: ScopeSelectorNode[];
  onBrowse: (node: ScopeSelectorNode) => void;
  onSelect: (selection: ScopeSelectorSelection) => void;
  query: string;
  searchResults: FlattenedScopeNode[];
  selectedValue?: string;
};

type ScopeSelectorState = {
  currentLevelNodes: ScopeSelectorNode[];
  currentPath: ScopeSelectorNode[];
  currentPathLabel: string;
  handleBrowse: (node: ScopeSelectorNode) => void;
  handleOpenChange: (nextOpen: boolean) => void;
  handleSelect: (selection: ScopeSelectorSelection) => void;
  open: boolean;
  query: string;
  searchResults: FlattenedScopeNode[];
  selectedPathLabel?: string;
  selectedSelection?: ScopeSelectorSelection;
  selectedValue?: string;
  setCurrentPath: (path: ScopeSelectorNode[]) => void;
  setQuery: (value: string) => void;
};

type ScopeSelectorPopoverBodyProps = {
  emptyMessage: string;
  searchPlaceholder: string;
  state: ScopeSelectorState;
};

function flattenNodes(
  nodes: ScopeSelectorNode[],
  parentPath: ScopeSelectorNode[] = [],
): FlattenedScopeNode[] {
  return nodes.flatMap((node) => {
    const path = [...parentPath, node];
    const current = [{ node, path }];
    const descendants = node.children ? flattenNodes(node.children, path) : [];
    return [...current, ...descendants];
  });
}

function findSelection(
  nodes: ScopeSelectorNode[],
  value?: string,
): ScopeSelectorSelection | undefined {
  if (!value) return undefined;

  const flattened = flattenNodes(nodes);
  const match = flattened.find((entry) => entry.node.id === value);
  return match ? { node: match.node, path: match.path } : undefined;
}

function getVisibleNodes(
  tree: ScopeSelectorNode[],
  currentPath: ScopeSelectorNode[],
): ScopeSelectorNode[] {
  const currentNode = currentPath.at(-1);
  return currentNode?.children ?? tree;
}

function isSelectableNode(node: ScopeSelectorNode): boolean {
  if (node.disabled) return false;
  if (node.selectable !== undefined) return node.selectable;
  return !node.children || node.children.length === 0;
}

function getPathLabel(path: ScopeSelectorNode[]): string {
  return path.map((node) => node.label).join(" / ");
}

function filterScopeResults(
  flattenedNodes: FlattenedScopeNode[],
  query: string,
): FlattenedScopeNode[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  return flattenedNodes.filter(({ node, path }) => {
    const pathLabel = getPathLabel(path).toLowerCase();
    const description = node.description?.toLowerCase() ?? "";
    return (
      node.label.toLowerCase().includes(normalizedQuery) ||
      description.includes(normalizedQuery) ||
      pathLabel.includes(normalizedQuery)
    );
  });
}

function ScopeOptionButton({
  node,
  onBrowse,
  onSelect,
  path,
  selectedValue,
  showPathLabel,
}: ScopeOptionButtonProps) {
  const selectable = isSelectableNode(node);

  return (
    <button
      className={cn(
        "flex w-full items-start justify-between rounded-md border px-3 py-3 text-left transition-colors hover:bg-accent hover:text-accent-foreground",
        selectedValue === node.id && "border-primary bg-accent",
        node.disabled && "cursor-not-allowed opacity-50",
      )}
      disabled={node.disabled}
      key={node.id}
      onClick={() => {
        if (selectable) {
          onSelect({ node, path });
          return;
        }
        onBrowse(node);
      }}
      type="button"
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{node.label}</span>
          {node.badge ? <Badge variant="outline">{node.badge}</Badge> : null}
        </div>
        {showPathLabel ? (
          <div className="text-xs text-muted-foreground">
            {getPathLabel(path)}
          </div>
        ) : null}
        {node.description ? (
          <p className="text-sm text-muted-foreground">{node.description}</p>
        ) : null}
      </div>
      {selectedValue === node.id ? (
        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      ) : node.children && node.children.length > 0 ? (
        <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
      ) : null}
    </button>
  );
}

function ScopeSearchResults({
  onBrowse,
  onSelect,
  results,
  selectedValue,
}: {
  onBrowse: (node: ScopeSelectorNode) => void;
  onSelect: (selection: ScopeSelectorSelection) => void;
  results: FlattenedScopeNode[];
  selectedValue?: string;
}) {
  return (
    <div className="space-y-2 px-1 py-1">
      {results.map(({ node, path }) => (
        <ScopeOptionButton
          key={getPathLabel(path)}
          node={node}
          onBrowse={onBrowse}
          onSelect={onSelect}
          path={path}
          selectedValue={selectedValue}
          showPathLabel
        />
      ))}
    </div>
  );
}

function ScopeCurrentLevel({
  currentPath,
  nodes,
  onBrowse,
  onSelect,
  selectedValue,
}: {
  currentPath: ScopeSelectorNode[];
  nodes: ScopeSelectorNode[];
  onBrowse: (node: ScopeSelectorNode) => void;
  onSelect: (selection: ScopeSelectorSelection) => void;
  selectedValue?: string;
}) {
  return (
    <div className="space-y-2 px-1 py-1">
      {nodes.map((node) => (
        <ScopeOptionButton
          key={node.id}
          node={node}
          onBrowse={onBrowse}
          onSelect={onSelect}
          path={[...currentPath, node]}
          selectedValue={selectedValue}
        />
      ))}
    </div>
  );
}

function ScopePanel({
  currentPath,
  emptyMessage,
  nodes,
  onBrowse,
  onSelect,
  query,
  searchResults,
  selectedValue,
}: ScopePanelProps) {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery) {
    if (searchResults.length === 0) {
      return (
        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
          No scopes match your search.
        </div>
      );
    }

    return (
      <ScopeSearchResults
        onBrowse={onBrowse}
        onSelect={onSelect}
        results={searchResults}
        selectedValue={selectedValue}
      />
    );
  }

  if (nodes.length === 0) {
    return (
      <div className="px-3 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <ScopeCurrentLevel
      currentPath={currentPath}
      nodes={nodes}
      onBrowse={onBrowse}
      onSelect={onSelect}
      selectedValue={selectedValue}
    />
  );
}

function ScopeSelectorBreadcrumb({
  currentPath,
  onBack,
}: {
  currentPath: ScopeSelectorNode[];
  onBack: () => void;
}) {
  if (currentPath.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
      <Button className="h-7 px-2" onClick={onBack} size="sm" variant="ghost">
        <ChevronRight className="h-3.5 w-3.5 rotate-180" />
        Back
      </Button>
      <span className="truncate">{getPathLabel(currentPath)}</span>
    </div>
  );
}

function ScopeSelectorPopoverBody({
  emptyMessage,
  searchPlaceholder,
  state,
}: ScopeSelectorPopoverBodyProps) {
  return (
    <PopoverContent align="start" className="w-[380px] p-0" sideOffset={8}>
      <div className="border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(event) => {
              state.setQuery(event.target.value);
            }}
            placeholder={searchPlaceholder}
            value={state.query}
          />
        </div>
        {state.query.trim() ? null : (
          <ScopeSelectorBreadcrumb
            currentPath={state.currentPath}
            onBack={() => {
              state.setCurrentPath(state.currentPath.slice(0, -1));
            }}
          />
        )}
      </div>
      <ScrollArea className="max-h-[320px]">
        <ScopePanel
          currentPath={state.currentPath}
          emptyMessage={emptyMessage}
          nodes={state.currentLevelNodes}
          onBrowse={state.handleBrowse}
          onSelect={state.handleSelect}
          query={state.query}
          searchResults={state.searchResults}
          selectedValue={state.selectedValue}
        />
      </ScrollArea>
      {state.selectedSelection ? (
        <>
          <Separator />
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Selected: {state.selectedPathLabel}
          </div>
        </>
      ) : null}
    </PopoverContent>
  );
}

function useScopeSelectorState({
  defaultValue,
  nodes,
  onValueChange,
  value,
}: Pick<
  ScopeSelectorProps,
  "defaultValue" | "nodes" | "onValueChange" | "value"
>): ScopeSelectorState {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const [currentPath, setCurrentPath] = useState<ScopeSelectorNode[]>([]);
  const selectedValue = value ?? uncontrolledValue;
  const selectedSelection = useMemo(
    () => findSelection(nodes, selectedValue),
    [nodes, selectedValue],
  );
  const flattenedNodes = useMemo(() => flattenNodes(nodes), [nodes]);
  const searchResults = useMemo(
    () => filterScopeResults(flattenedNodes, query),
    [flattenedNodes, query],
  );
  const currentLevelNodes = getVisibleNodes(nodes, currentPath);

  function handleSelect(selection: ScopeSelectorSelection) {
    if (value === undefined) {
      setUncontrolledValue(selection.node.id);
    }
    setCurrentPath(selection.path.slice(0, -1));
    setQuery("");
    setOpen(false);
    onValueChange?.(selection);
  }

  function handleBrowse(node: ScopeSelectorNode) {
    const nextPath = findSelection(nodes, node.id)?.path ?? [];
    setCurrentPath(nextPath);
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen) {
      setCurrentPath(selectedSelection?.path.slice(0, -1) ?? []);
      return;
    }
    setQuery("");
  }

  return {
    currentLevelNodes,
    currentPath,
    currentPathLabel: getPathLabel(currentPath),
    handleBrowse,
    handleOpenChange,
    handleSelect,
    open,
    query,
    searchResults,
    selectedPathLabel: selectedSelection
      ? getPathLabel(selectedSelection.path)
      : undefined,
    selectedSelection,
    selectedValue,
    setCurrentPath,
    setQuery,
  };
}

const ScopeSelector = forwardRef<HTMLButtonElement, ScopeSelectorProps>(
  (
    {
      className,
      defaultValue,
      disabled,
      emptyMessage = "No scopes available.",
      nodes,
      onValueChange,
      placeholder = "Select scope",
      searchPlaceholder = "Search scopes...",
      value,
    },
    ref,
  ) => {
    const state = useScopeSelectorState({
      defaultValue,
      nodes,
      onValueChange,
      value,
    });

    return (
      <Popover onOpenChange={state.handleOpenChange} open={state.open}>
        <PopoverTrigger asChild>
          <Button
            className={cn("w-full justify-between", className)}
            disabled={disabled}
            ref={ref}
            variant="outline"
          >
            <span className="truncate text-left">
              {state.selectedPathLabel ?? placeholder}
            </span>
            <ChevronRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <ScopeSelectorPopoverBody
          emptyMessage={emptyMessage}
          searchPlaceholder={searchPlaceholder}
          state={state}
        />
      </Popover>
    );
  },
);

ScopeSelector.displayName = "ScopeSelector";

export { ScopeSelector };
