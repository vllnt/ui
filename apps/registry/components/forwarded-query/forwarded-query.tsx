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

import { forwardedParameters } from "@/lib/platform";

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
    // react-doctor-disable-next-line react-doctor/no-pass-data-to-parent -- the provider cannot read the query itself: useSearchParams in the shell would push the whole prerendered shell to the client; this suspended leaf is the sole reader, and the update after hydration is the intended extra render
    onChange(query);
  }, [onChange, query]);

  return null;
}

/**
 * Gives shell links (header, sidebar) the platform variant of the browser
 * query without those components reading it themselves (see
 * `forwardedParameters`). The build renders the shell and the browser hydrates
 * it in place with `undefined`; once the browser URL is readable the query
 * arrives as an update, so no element gets replaced and nothing shifts.
 */
export function ForwardedQueryProvider({
  children,
}: {
  readonly children: ReactNode;
}) {
  const [query, setQuery] = useState<string | undefined>();
  const parameters = useMemo(
    () =>
      query === undefined
        ? undefined
        : forwardedParameters(new URLSearchParams(query)),
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
 * The parameters of the current browser URL that links carry: the `native`
 * platform variant, nothing else.
 *
 * @returns `undefined` during the build render and the hydration render, then
 * the carried parameters once the browser URL is readable
 */
export function useForwardedQuery(): undefined | URLSearchParams {
  return use(ForwardedQueryContext);
}
