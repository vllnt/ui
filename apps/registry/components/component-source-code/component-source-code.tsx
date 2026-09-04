import { StaticCode } from "@vllnt/ui";

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

function renderSource(source: ComponentSource) {
  return (
    <StaticCode
      className="max-h-[25rem]"
      code={source.code}
      language={source.language ?? "typescript"}
    />
  );
}

export function ComponentSourceCode({
  label,
  sources,
}: ComponentSourceCodeProps) {
  const [firstSource, ...additionalSources] = sources;
  if (!firstSource) return null;

  return (
    <ComponentSourceTabs
      label={label}
      sources={[
        {
          content: renderSource(firstSource),
          id: firstSource.id,
          label: firstSource.label,
        },
        ...additionalSources.map((source) => ({
          content: renderSource(source),
          id: source.id,
          label: source.label,
        })),
      ]}
    />
  );
}
