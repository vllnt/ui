import type { SearchItem } from "@vllnt/ui";

type PagefindResultData = {
  excerpt?: string;
  meta?: {
    title?: string;
  };
  url: string;
} & Partial<Record<"plain_excerpt", string>> &
  Partial<Record<"sub_results", PagefindSubResult[]>>;

type PagefindSubResult = {
  excerpt?: string;
  title?: string;
  url: string;
} & Partial<Record<"plain_excerpt", string>>;

type PagefindSearchResponse = {
  results: {
    data: () => Promise<PagefindResultData>;
    id: string;
  }[];
};

type PagefindModule = {
  debouncedSearch?: (
    query: string,
    options?: Record<string, never>,
    timeout?: number,
  ) => Promise<null | PagefindSearchResponse>;
  init?: () => Promise<void> | void;
  search: (query: string) => Promise<PagefindSearchResponse>;
};

const PAGEFIND_BUNDLE_PATH = "/_pagefind/pagefind.js";
const MAX_RESULTS = 8;
const SNIPPET_CONTEXT = 50;

let pagefindPromise: Promise<PagefindModule> | undefined;

async function loadPagefind() {
  pagefindPromise ??= import(
    /* webpackIgnore: true */ PAGEFIND_BUNDLE_PATH
  ).then((module) => {
    const pagefind = module as PagefindModule;
    void pagefind.init?.();
    return pagefind;
  });

  return pagefindPromise;
}

const ANGLE_BRACKET_PATTERN = /[<>]/g;
const HTML_MIME_TYPE = "text/html";

function stripMarkup(value: string): string {
  const document = new DOMParser().parseFromString(value, HTML_MIME_TYPE);

  return (document.body.textContent ?? "").replaceAll(
    ANGLE_BRACKET_PATTERN,
    "",
  );
}

function getFallbackTitle(url: string) {
  const path = url.split("#")[0]?.replaceAll(/^\/|\/$/g, "") || "Home";
  const lastSegment = path.split("/").findLast(Boolean) ?? path;

  return lastSegment
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getSnippet(text: string, query: string) {
  const compactText = text.replaceAll(/\s+/g, " ").trim();

  if (compactText.length <= SNIPPET_CONTEXT) {
    return compactText;
  }

  const index = compactText.toLowerCase().indexOf(query.toLowerCase());

  if (index === -1) {
    return `${compactText.slice(0, SNIPPET_CONTEXT).trim()}…`;
  }

  const start = Math.max(0, index - Math.floor(SNIPPET_CONTEXT / 2));
  const end = Math.min(
    compactText.length,
    index + query.length + Math.floor(SNIPPET_CONTEXT / 2),
  );
  const prefix = start > 0 ? "… " : "";
  const suffix = end < compactText.length ? " …" : "";

  return `${prefix}${compactText.slice(start, end).trim()}${suffix}`;
}

type SearchItemInput = {
  entry: PagefindResultData | PagefindSubResult;
  index: number;
  query: string;
  result: PagefindResultData;
};

function toSearchItem({
  entry,
  index,
  query,
  result,
}: SearchItemInput): SearchItem {
  const plainExcerpt =
    entry.plain_excerpt ?? stripMarkup(entry.excerpt ?? result.excerpt ?? "");
  const url = entry.url || result.url;
  const title =
    "title" in entry && entry.title
      ? entry.title
      : (result.meta?.title ?? getFallbackTitle(url));

  return {
    description: url,
    href: url,
    id: `docs:${url}:${index}`,
    keywords: plainExcerpt,
    snippet: getSnippet(plainExcerpt, query),
    title,
  };
}

async function runPagefindSearch(query: string) {
  const pagefind = await loadPagefind();

  return (
    (await pagefind.debouncedSearch?.(query, {}, 150)) ??
    (await pagefind.search(query))
  );
}

async function loadSearchItems(
  response: PagefindSearchResponse,
  query: string,
) {
  const resultData = await Promise.all(
    response.results.slice(0, MAX_RESULTS).map((result) => result.data()),
  );
  const items = resultData.flatMap((result, resultIndex) => {
    const entries = result.sub_results?.length
      ? result.sub_results.slice(0, 2)
      : [result];

    return entries.map((entry, entryIndex) =>
      toSearchItem({
        entry,
        index: resultIndex * 10 + entryIndex,
        query,
        result,
      }),
    );
  });

  return [...new Map(items.map((item) => [item.href, item])).values()].slice(
    0,
    MAX_RESULTS,
  );
}

export async function searchPagefind(query: string): Promise<SearchItem[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2 || typeof window === "undefined") {
    return [];
  }

  try {
    const response = await runPagefindSearch(trimmedQuery);
    return response === null
      ? []
      : await loadSearchItems(response, trimmedQuery);
  } catch {
    return [];
  }
}
