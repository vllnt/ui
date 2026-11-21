import { ComponentSourceTabs } from "./component-source-tabs";

export type ComponentSource = {
  readonly code: string;
  readonly id: string;
  readonly label: string;
  readonly language?: string;
};

type ComponentSourceCodeProps = {
  readonly label: string;
  readonly sources: readonly ComponentSource[];
};

/**
 * Passes the raw source text to the client tabs, which highlight it. A
 * server-highlighted tree would put one element per token into the page
 * payload (about 1.2 MB on the largest component pages) even for a tab that is
 * never opened.
 */
export function ComponentSourceCode({
  label,
  sources,
}: ComponentSourceCodeProps) {
  const [firstSource, ...additionalSources] = sources;
  if (!firstSource) return null;

  return (
    <ComponentSourceTabs
      label={label}
      sources={[firstSource, ...additionalSources]}
    />
  );
}
