"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Search } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../command";

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

// eslint-disable-next-line max-lines-per-function
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
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("components");
  const [documentationItems, setDocumentationItems] = useState<SearchItem[]>(
    [],
  );
  const [documentationLoading, setDocumentationLoading] = useState(false);
  const activeDocumentationRequest = useRef(0);

  const documentationSearchLength = minDocsSearchLength ?? 2;
  const hasDocumentationSearch = docsSearch !== undefined;
  const labels = { ...DEFAULT_SCOPE_LABELS, ...scopeLabels };
  const trimmedQuery = query.trim();
  const showComponents = scope !== "docs";
  const showDocumentation = hasDocumentationSearch && scope !== "components";

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.title.localeCompare(b.title)),
    [items],
  );

  const toggleOpen = useCallback(() => {
    if (enableKeyboardShortcut ?? true) {
      setOpen((previous) => !previous);
    }
  }, [enableKeyboardShortcut]);

  useKeyboardShortcut(toggleOpen);

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

      if (!nextOpen) {
        return;
      }

      runDocumentationSearch(query, scope);
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

  const currentEmptyText =
    scope === "docs" && trimmedQuery.length < documentationSearchLength
      ? `Type at least ${documentationSearchLength} characters to search docs.`
      : scope === "docs"
        ? (docsEmptyText ?? "No docs found.")
        : (emptyText ?? "No results found.");

  return (
    <>
      <Button
        className={cn(
          "relative h-9 w-full justify-start text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64",
        )}
        onClick={() => {
          handleOpenChange(true);
        }}
        variant="outline"
      >
        <Search className="mr-2 size-4" />
        <span className="hidden lg:inline-flex">
          {buttonText ?? "Search..."}
        </span>
        <span className="inline-flex lg:hidden">
          {buttonTextMobile ?? "Search..."}
        </span>
        <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog onOpenChange={handleOpenChange} open={open}>
        <CommandInput
          onValueChange={handleQueryChange}
          placeholder={searchPlaceholder ?? "Search..."}
          value={query}
        />
        {hasDocumentationSearch ? (
          <ScopeTabs
            labels={labels}
            onScopeChange={handleScopeChange}
            scope={scope}
          />
        ) : null}
        <CommandList className="max-h-[420px]">
          <CommandEmpty>{currentEmptyText}</CommandEmpty>
          {showComponents ? (
            <CommandGroup
              heading={
                groupHeading ??
                (hasDocumentationSearch ? labels.components : undefined)
              }
            >
              {sortedItems.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => {
                    handleComponentSelect(item);
                  }}
                  value={getItemValue(item)}
                >
                  <SearchResultContent item={item} query={query} />
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {showDocumentation ? (
            <CommandGroup heading={docsGroupHeading ?? "Docs"}>
              {scope === "docs" &&
              trimmedQuery.length < documentationSearchLength ? (
                <CommandItem
                  disabled
                  value={`${trimmedQuery} search-docs-min-length`}
                >
                  <span className="text-sm text-muted-foreground">
                    Type at least {documentationSearchLength} characters to
                    search docs.
                  </span>
                </CommandItem>
              ) : null}
              {documentationLoading ? (
                <CommandItem disabled value={`${trimmedQuery} searching-docs`}>
                  <span className="text-sm text-muted-foreground">
                    Searching docs...
                  </span>
                </CommandItem>
              ) : null}
              {!documentationLoading &&
              trimmedQuery.length >= documentationSearchLength
                ? documentationItems.map((item) => (
                    <CommandItem
                      key={item.id}
                      onSelect={() => {
                        handleDocumentationSelect(item);
                      }}
                      value={getItemValue(item)}
                    >
                      <SearchResultContent item={item} query={query} />
                    </CommandItem>
                  ))
                : null}
            </CommandGroup>
          ) : null}
        </CommandList>
      </CommandDialog>
    </>
  );
}
