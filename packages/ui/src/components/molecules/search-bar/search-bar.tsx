"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { useEventCallback } from "../../../lib/use-event-callback";
import { Button } from "../../atoms/button/button";
import { Input } from "../../atoms/input/input";

export type SearchBarProps = {
  className?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
};

export function SearchBar(props: SearchBarProps) {
  // useSearchParams suspends during SSR — Suspense boundary keeps the
  // surrounding tree streamable. See react-doctor rule
  // nextjs-no-use-search-params-without-suspense + Next.js docs.
  return (
    <Suspense fallback={<SearchBarFallback {...props} />}>
      <SearchBarInner {...props} />
    </Suspense>
  );
}

function SearchBarFallback({
  className,
  placeholder = "Search posts...",
}: SearchBarProps) {
  return (
    <form className={`flex gap-2 ${className}`}>
      <Input
        aria-label={placeholder}
        className="flex-1"
        disabled
        placeholder={placeholder}
        type="text"
        value=""
      />
      <Button disabled type="submit" variant="outline">
        Search
      </Button>
    </form>
  );
}

const COMMIT_DELAY_MS = 300;
const TYPING_RESET_DELAY_MS = 350;

function SearchBarInner({
  className,
  onSearch,
  placeholder = "Search posts...",
}: SearchBarProps) {
  const router = useRouter();
  const searchParameters = useSearchParams();
  const initialQuery = searchParameters.get("search") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const isUserTyping = useRef(false);

  const typingTimeoutReference = useRef<NodeJS.Timeout | undefined>(undefined);
  const commitTimeoutReference = useRef<NodeJS.Timeout | undefined>(undefined);
  const initialTrimmedQuery = initialQuery.trim();
  const lastSetSearchParameterReference = useRef<string>(initialTrimmedQuery);
  const lastDebouncedQueryReference = useRef<string>(initialTrimmedQuery);

  const replaceSearchParameter = (trimmedQuery: string) => {
    const parameters = new URLSearchParams(searchParameters);
    if (trimmedQuery) {
      parameters.set("search", trimmedQuery);
    } else {
      parameters.delete("search");
    }
    lastSetSearchParameterReference.current = trimmedQuery;
    router.replace(`?${parameters.toString()}`);
  };

  // Runs from a timer started by typing. The event callback reads the latest
  // props, router and URL when the timer fires, so a parent passing a fresh
  // `onSearch` neither restarts the debounce nor re-emits the same query.
  const commitQuery = useEventCallback((nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();

    // Skip if this is the same value we already processed
    if (trimmedQuery === lastDebouncedQueryReference.current) {
      return;
    }

    lastDebouncedQueryReference.current = trimmedQuery;

    if (onSearch) {
      onSearch(trimmedQuery);
      return;
    }

    // Skip if URL already matches the debounced query
    if (trimmedQuery === (searchParameters.get("search") ?? "")) {
      lastSetSearchParameterReference.current = trimmedQuery;
      return;
    }

    replaceSearchParameter(trimmedQuery);
  });

  // Sync query with URL search params (e.g., on browser back/forward)
  // Sync when user is not actively typing and URL changed externally
  useEffect(() => {
    const searchParameter = searchParameters.get("search") ?? "";

    // Skip if this is the search param we set ourselves
    if (searchParameter === lastSetSearchParameterReference.current) {
      return;
    }

    // Sync if user is not actively typing and values differ
    if (isUserTyping.current || query === searchParameter) {
      return;
    }
    const frame = requestAnimationFrame(() => {
      setQuery(searchParameter);
      lastDebouncedQueryReference.current = searchParameter;
    });
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [searchParameters, query]); // Include query to properly sync state

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      clearTimeout(typingTimeoutReference.current);
      clearTimeout(commitTimeoutReference.current);
    };
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextQuery = event.target.value;
    isUserTyping.current = true;
    setQuery(nextQuery);

    // Reset typing flag after debounce delay + buffer
    clearTimeout(typingTimeoutReference.current);
    typingTimeoutReference.current = setTimeout(() => {
      isUserTyping.current = false;
    }, TYPING_RESET_DELAY_MS);

    // Commit the query once typing pauses
    clearTimeout(commitTimeoutReference.current);
    commitTimeoutReference.current = setTimeout(() => {
      commitQuery(nextQuery);
    }, COMMIT_DELAY_MS);
  };

  const handleSubmit = (event: React.SyntheticEvent) => {
    event.preventDefault();
    isUserTyping.current = false;

    // Clear typing timeout
    clearTimeout(typingTimeoutReference.current);

    const trimmedQuery = query.trim();
    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      replaceSearchParameter(trimmedQuery);
    }
  };

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
  );
}
