"use client";

import {
  createContext,
  type ReactNode,
  Suspense,
  use,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

const ForwardedQueryContext = createContext<undefined | URLSearchParams>(
  undefined,
);

type QueryReaderProps = {
  readonly onChange: (query: string) => void;
};

/**
 * Reads the browser query. `useSearchParams` makes a prerendered page render
 * the nearest `<Suspense>` boundary on the client, so this leaf renders nothing
 * and that boundary covers no visible element.
 */
function QueryReader({ onChange }: QueryReaderProps): null {
  const query = useSearchParams().toString();

  useEffect(() => {
    onChange(query);
  }, [onChange, query]);

  return null;
}

/**
 * Makes the browser query available to shell links (header, sidebar) without
 * those components reading it themselves. The build renders the shell and the
 * browser hydrates it in place with `undefined`; once the browser URL is
 * readable the query arrives as an update, so no element gets replaced and
 * nothing shifts.
 */
export function ForwardedQueryProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [query, setQuery] = useState<string | undefined>();
  const parameters = useMemo(
    () => (query === undefined ? undefined : new URLSearchParams(query)),
    [query],
  );

  return (
    <ForwardedQueryContext value={parameters}>
      {children}
      <Suspense fallback={null}>
        <QueryReader onChange={setQuery} />
      </Suspense>
    </ForwardedQueryContext>
  );
}

/**
 * The query string of the current browser URL, for links that keep it.
 *
 * @returns `undefined` during the build render and the hydration render, then
 * the current parameters once the browser URL is readable
 */
export function useForwardedQuery(): undefined | URLSearchParams {
  return use(ForwardedQueryContext);
}
