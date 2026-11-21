import { StaticCode } from "@vllnt/ui";

export type SourceCodeViewProps = {
  readonly code: string;
  readonly language: string;
};

/**
 * The highlighted source of one implementation. Loaded through `next/dynamic`
 * by `ComponentSourceTabs`, so the highlighter is a separate chunk. The page
 * payload carries the raw source text, not one element per token.
 */
export function SourceCodeView({ code, language }: SourceCodeViewProps) {
  return (
    <StaticCode className="max-h-[25rem]" code={code} language={language} />
  );
}
