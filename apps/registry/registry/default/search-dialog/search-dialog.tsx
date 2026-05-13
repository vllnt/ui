"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Search } from "lucide-react";

import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@vllnt/ui";

export type SearchItem = {
  description?: string;
  href?: string;
  id: string;
  keywords?: string;
  snippet?: string;
  title: string;
};

type SearchScope = "components" | "docs" | "everything";

function useKeyboardShortcut(callback: () => void) {
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (
        (event.key === "k" || event.key === "K") &&
        (event.metaKey || event.ctrlKey)
      ) {
        const target = event.target as HTMLElement | null;
        if (
          target &&
          (target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable)
        ) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        callback();
      }
    };

    window.addEventListener("keydown", down, { capture: true, passive: false });
    return () => {
      window.removeEventListener("keydown", down, { capture: true });
    };
  }, [callback]);
}

type SearchDialogProps = {
  buttonText?: string;
  buttonTextMobile?: string;
  docsEmptyText?: string;
  docsGroupHeading?: string;
  docsSearch?: (query: string) => Promise<SearchItem[]>;
  emptyText?: string;
  enableKeyboardShortcut?: boolean;
  groupHeading?: string;
  items: SearchItem[];
  minDocsSearchLength?: number;
  onDocsSelect?: (item: SearchItem) => void;
  onSelect: (item: SearchItem) => void;
  scopeLabels?: Partial<Record<SearchScope, string>>;
  searchPlaceholder?: string;
};

const DEFAULT_SCOPE_LABELS: Record<SearchScope, string> = {
  components: "Components",
  docs: "Docs",
  everything: "Everything",
};

function getItemValue(item: SearchItem) {
  return [
    item.title,
    item.description,
    item.snippet,
    item.keywords,
    item.href,
    item.id,
  ]
    .filter(Boolean)
    .join(" ");
}

function HighlightedText({ query, text }: { query: string; text: string }) {
  const trimmedQuery = query.trim();

  if (!trimmedQuery) {
    return text;
  }

  const index = text.toLowerCase().indexOf(trimmedQuery.toLowerCase());

  if (index === -1) {
    return text;
  }

  return (
    <>
      {text.slice(0, index)}
      <mark className="rounded bg-primary/15 px-0.5 text-foreground">
        {text.slice(index, index + trimmedQuery.length)}
      </mark>
      {text.slice(index + trimmedQuery.length)}
    </>
  );
}

function ScopeTabs({
  labels,
  onScopeChange,
  scope,
}: {
  labels: Record<SearchScope, string>;
  onScopeChange: (scope: SearchScope) => void;
  scope: SearchScope;
}) {
  const scopes: SearchScope[] = ["components", "docs", "everything"];

  return (
    <div
      aria-label="Search scope"
      className="grid grid-cols-3 gap-1 border-b p-1"
      role="tablist"
    >
      {scopes.map((nextScope) => (
        <button
          aria-selected={scope === nextScope}
          className={cn(
            "h-8 rounded-sm px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
            scope === nextScope && "bg-accent text-accent-foreground",
          )}
          key={nextScope}
          onClick={() => {
            onScopeChange(nextScope);
          }}
          role="tab"
          type="button"
        >
          {labels[nextScope]}
        </button>
      ))}
    </div>
  );
}

function SearchResultContent({
  item,
  query,
}: {
  item: SearchItem;
  query: string;
}) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="truncate font-medium">{item.title}</span>
      {item.snippet ? (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          <HighlightedText query={query} text={item.snippet} />
        </span>
      ) : item.description ? (
        <span className="line-clamp-2 text-xs text-muted-foreground">
          {item.description}
        </span>
      ) : null}
    </div>
  );
}

function SearchTriggerButton({
  buttonText,
  buttonTextMobile,
  onOpen,
}: {
  buttonText?: string;
  buttonTextMobile?: string;
  onOpen: () => void;
}) {
  return (
    <Button
      className={cn(
        "relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
      )}
      onClick={onOpen}
      variant="outline"
    >
      <Search className="mr-2 size-4" />
      <span className="hidden lg:inline-flex">{buttonText ?? "Search..."}</span>
      <span className="inline-flex lg:hidden">
        {buttonTextMobile ?? "Search..."}
      </span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  );
}

function ComponentResultsGroup({
  groupHeading,
  hasDocumentationSearch,
  items,
  labels,
  onSelect,
  query,
}: {
  groupHeading?: string;
  hasDocumentationSearch: boolean;
  items: SearchItem[];
  labels: Record<SearchScope, string>;
  onSelect: (item: SearchItem) => void;
  query: string;
}) {
  return (
    <CommandGroup
      heading={
        groupHeading ?? (hasDocumentationSearch ? labels.components : undefined)
      }
    >
      {items.map((item) => (
        <CommandItem
          key={item.id}
          onSelect={() => {
            onSelect(item);
          }}
          value={getItemValue(item)}
        >
          <SearchResultContent item={item} query={query} />
        </CommandItem>
      ))}
    </CommandGroup>
  );
}

function DocumentationStatusItem({
  documentationSearchLength,
  trimmedQuery,
}: {
  documentationSearchLength: number;
  trimmedQuery: string;
}) {
  return (
    <CommandItem disabled value={`${trimmedQuery} search-docs-min-length`}>
      <span className="text-sm text-muted-foreground">
        Type at least {documentationSearchLength} characters to search docs.
      </span>
    </CommandItem>
  );
}

function DocumentationLoadingItem({ trimmedQuery }: { trimmedQuery: string }) {
  return (
    <CommandItem disabled value={`${trimmedQuery} searching-docs`}>
      <span className="text-sm text-muted-foreground">Searching docs...</span>
    </CommandItem>
  );
}

function DocumentationResultsGroup({
  docsGroupHeading,
  documentationItems,
  documentationLoading,
  documentationSearchLength,
  onSelect,
  query,
  scope,
  trimmedQuery,
}: {
  docsGroupHeading?: string;
  documentationItems: SearchItem[];
  documentationLoading: boolean;
  documentationSearchLength: number;
  onSelect: (item: SearchItem) => void;
  query: string;
  scope: SearchScope;
  trimmedQuery: string;
}) {
  const showMinimumLengthPrompt =
    scope === "docs" && trimmedQuery.length < documentationSearchLength;
  const showDocumentationItems =
    !documentationLoading && trimmedQuery.length >= documentationSearchLength;

  return (
    <CommandGroup heading={docsGroupHeading ?? "Docs"}>
      {showMinimumLengthPrompt ? (
        <DocumentationStatusItem
          documentationSearchLength={documentationSearchLength}
          trimmedQuery={trimmedQuery}
        />
      ) : null}
      {documentationLoading ? (
        <DocumentationLoadingItem trimmedQuery={trimmedQuery} />
      ) : null}
      {showDocumentationItems
        ? documentationItems.map((item) => (
            <CommandItem
              key={item.id}
              onSelect={() => {
                onSelect(item);
              }}
              value={getItemValue(item)}
            >
              <SearchResultContent item={item} query={query} />
            </CommandItem>
          ))
        : null}
    </CommandGroup>
  );
}

function SearchDialogList({
  currentEmptyText,
  docsGroupHeading,
  documentationItems,
  documentationLoading,
  documentationSearchLength,
  groupHeading,
  hasDocumentationSearch,
  labels,
  onComponentSelect,
  onDocumentationSelect,
  query,
  scope,
  showComponents,
  showDocumentation,
  sortedItems,
  trimmedQuery,
}: {
  currentEmptyText: string;
  docsGroupHeading?: string;
  documentationItems: SearchItem[];
  documentationLoading: boolean;
  documentationSearchLength: number;
  groupHeading?: string;
  hasDocumentationSearch: boolean;
  labels: Record<SearchScope, string>;
  onComponentSelect: (item: SearchItem) => void;
  onDocumentationSelect: (item: SearchItem) => void;
  query: string;
  scope: SearchScope;
  showComponents: boolean;
  showDocumentation: boolean;
  sortedItems: SearchItem[];
  trimmedQuery: string;
}) {
  return (
    <CommandList className="max-h-[420px]">
      <CommandEmpty>{currentEmptyText}</CommandEmpty>
      {showComponents ? (
        <ComponentResultsGroup
          groupHeading={groupHeading}
          hasDocumentationSearch={hasDocumentationSearch}
          items={sortedItems}
          labels={labels}
          onSelect={onComponentSelect}
          query={query}
        />
      ) : null}
      {showDocumentation ? (
        <DocumentationResultsGroup
          docsGroupHeading={docsGroupHeading}
          documentationItems={documentationItems}
          documentationLoading={documentationLoading}
          documentationSearchLength={documentationSearchLength}
          onSelect={onDocumentationSelect}
          query={query}
          scope={scope}
          trimmedQuery={trimmedQuery}
        />
      ) : null}
    </CommandList>
  );
}

type DocumentationSearchOptions = {
  docsSearch?: (query: string) => Promise<SearchItem[]>;
  minDocsSearchLength?: number;
};

function useDocumentationSearch({
  docsSearch,
  minDocsSearchLength,
}: DocumentationSearchOptions) {
  const [documentationItems, setDocumentationItems] = useState<SearchItem[]>(
    [],
  );
  const [documentationLoading, setDocumentationLoading] = useState(false);
  const activeDocumentationRequest = useRef(0);
  const documentationSearchLength = minDocsSearchLength ?? 2;

  const runDocumentationSearch = useCallback(
    (nextQuery: string, nextScope: SearchScope) => {
      const nextTrimmedQuery = nextQuery.trim();
      const nextRequest = activeDocumentationRequest.current + 1;
      activeDocumentationRequest.current = nextRequest;

      if (
        !docsSearch ||
        nextScope === "components" ||
        nextTrimmedQuery.length < documentationSearchLength
      ) {
        setDocumentationItems([]);
        setDocumentationLoading(false);
        return;
      }

      setDocumentationLoading(true);

      docsSearch(nextTrimmedQuery)
        .then((results) => {
          if (activeDocumentationRequest.current === nextRequest) {
            setDocumentationItems(results);
          }
        })
        .catch(() => {
          if (activeDocumentationRequest.current === nextRequest) {
            setDocumentationItems([]);
          }
        })
        .finally(() => {
          if (activeDocumentationRequest.current === nextRequest) {
            setDocumentationLoading(false);
          }
        });
    },
    [docsSearch, documentationSearchLength],
  );

  return {
    documentationItems,
    documentationLoading,
    documentationSearchLength,
    hasDocumentationSearch: docsSearch !== undefined,
    runDocumentationSearch,
  };
}

type SearchDialogHandlersOptions = {
  enableKeyboardShortcut?: boolean;
  onDocsSelect?: (item: SearchItem) => void;
  onSelect: (item: SearchItem) => void;
  runDocumentationSearch: (query: string, scope: SearchScope) => void;
};

function useSearchDialogHandlers({
  enableKeyboardShortcut,
  onDocsSelect,
  onSelect,
  runDocumentationSearch,
}: SearchDialogHandlersOptions) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("components");

  const toggleOpen = useCallback(() => {
    if (enableKeyboardShortcut ?? true) {
      setOpen((previous) => !previous);
    }
  }, [enableKeyboardShortcut]);

  useKeyboardShortcut(toggleOpen);

  const handleQueryChange = useCallback(
    (nextQuery: string) => {
      setQuery(nextQuery);
      runDocumentationSearch(nextQuery, scope);
    },
    [runDocumentationSearch, scope],
  );

  const handleScopeChange = useCallback(
    (nextScope: SearchScope) => {
      setScope(nextScope);
      runDocumentationSearch(query, nextScope);
    },
    [query, runDocumentationSearch],
  );

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      setOpen(nextOpen);

      if (nextOpen) {
        runDocumentationSearch(query, scope);
      }
    },
    [query, runDocumentationSearch, scope],
  );

  const handleComponentSelect = useCallback(
    (item: SearchItem) => {
      setOpen(false);
      onSelect(item);
    },
    [onSelect],
  );

  const handleDocumentationSelect = useCallback(
    (item: SearchItem) => {
      setOpen(false);
      (onDocsSelect ?? onSelect)(item);
    },
    [onDocsSelect, onSelect],
  );

  return {
    handleComponentSelect,
    handleDocumentationSelect,
    handleOpenChange,
    handleQueryChange,
    handleScopeChange,
    open,
    query,
    scope,
  };
}

function getCurrentEmptyText({
  docsEmptyText,
  documentationSearchLength,
  emptyText,
  scope,
  trimmedQuery,
}: {
  docsEmptyText?: string;
  documentationSearchLength: number;
  emptyText?: string;
  scope: SearchScope;
  trimmedQuery: string;
}) {
  if (scope === "docs" && trimmedQuery.length < documentationSearchLength) {
    return `Type at least ${documentationSearchLength} characters to search docs.`;
  }

  if (scope === "docs") {
    return docsEmptyText ?? "No docs found.";
  }

  return emptyText ?? "No results found.";
}

type SearchDialogViewProps = Pick<
  SearchDialogProps,
  | "buttonText"
  | "buttonTextMobile"
  | "docsGroupHeading"
  | "groupHeading"
  | "searchPlaceholder"
> & {
  currentEmptyText: string;
  documentationSearch: ReturnType<typeof useDocumentationSearch>;
  handlers: ReturnType<typeof useSearchDialogHandlers>;
  labels: Record<SearchScope, string>;
  showDocumentation: boolean;
  sortedItems: SearchItem[];
  trimmedQuery: string;
};

function SearchDialogView({
  buttonText,
  buttonTextMobile,
  currentEmptyText,
  docsGroupHeading,
  documentationSearch,
  groupHeading,
  handlers,
  labels,
  searchPlaceholder,
  showDocumentation,
  sortedItems,
  trimmedQuery,
}: SearchDialogViewProps) {
  return (
    <>
      <SearchTriggerButton
        buttonText={buttonText}
        buttonTextMobile={buttonTextMobile}
        onOpen={() => {
          handlers.handleOpenChange(true);
        }}
      />
      <CommandDialog
        onOpenChange={handlers.handleOpenChange}
        open={handlers.open}
      >
        <CommandInput
          onValueChange={handlers.handleQueryChange}
          placeholder={searchPlaceholder ?? "Search..."}
          value={handlers.query}
        />
        {documentationSearch.hasDocumentationSearch ? (
          <ScopeTabs
            labels={labels}
            onScopeChange={handlers.handleScopeChange}
            scope={handlers.scope}
          />
        ) : null}
        <SearchDialogList
          currentEmptyText={currentEmptyText}
          docsGroupHeading={docsGroupHeading}
          documentationItems={documentationSearch.documentationItems}
          documentationLoading={documentationSearch.documentationLoading}
          documentationSearchLength={
            documentationSearch.documentationSearchLength
          }
          groupHeading={groupHeading}
          hasDocumentationSearch={documentationSearch.hasDocumentationSearch}
          labels={labels}
          onComponentSelect={handlers.handleComponentSelect}
          onDocumentationSelect={handlers.handleDocumentationSelect}
          query={handlers.query}
          scope={handlers.scope}
          showComponents={handlers.scope !== "docs"}
          showDocumentation={showDocumentation}
          sortedItems={sortedItems}
          trimmedQuery={trimmedQuery}
        />
      </CommandDialog>
    </>
  );
}

export function SearchDialog({
  buttonText,
  buttonTextMobile,
  docsEmptyText,
  docsGroupHeading,
  docsSearch,
  emptyText,
  enableKeyboardShortcut,
  groupHeading,
  items,
  minDocsSearchLength,
  onDocsSelect,
  onSelect,
  scopeLabels,
  searchPlaceholder,
}: SearchDialogProps) {
  const documentationSearch = useDocumentationSearch({
    docsSearch,
    minDocsSearchLength,
  });
  const handlers = useSearchDialogHandlers({
    enableKeyboardShortcut,
    onDocsSelect,
    onSelect,
    runDocumentationSearch: documentationSearch.runDocumentationSearch,
  });
  const labels = { ...DEFAULT_SCOPE_LABELS, ...scopeLabels };
  const trimmedQuery = handlers.query.trim();
  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items],
  );
  const currentEmptyText = getCurrentEmptyText({
    docsEmptyText,
    documentationSearchLength: documentationSearch.documentationSearchLength,
    emptyText,
    scope: handlers.scope,
    trimmedQuery,
  });
  const showDocumentation =
    documentationSearch.hasDocumentationSearch &&
    handlers.scope !== "components";

  return (
    <SearchDialogView
      buttonText={buttonText}
      buttonTextMobile={buttonTextMobile}
      currentEmptyText={currentEmptyText}
      docsGroupHeading={docsGroupHeading}
      documentationSearch={documentationSearch}
      groupHeading={groupHeading}
      handlers={handlers}
      labels={labels}
      searchPlaceholder={searchPlaceholder}
      showDocumentation={showDocumentation}
      sortedItems={sortedItems}
      trimmedQuery={trimmedQuery}
    />
  );
}
