"use client";

import * as React from "react";

import { track } from "@vercel/analytics";
import { Button } from "@vllnt/ui";
import { Check, Copy } from "lucide-react";

import { BADGE_SVG_PATH, buildBadgeSnippets } from "@/lib/share";

type SnippetFormat = "html" | "jsx" | "markdown";

const FORMATS: readonly { label: string; value: SnippetFormat }[] = [
  { label: "HTML", value: "html" },
  { label: "Markdown", value: "markdown" },
  { label: "JSX", value: "jsx" },
];

export function BadgeSnippets(): React.ReactElement {
  const snippets = React.useMemo(() => buildBadgeSnippets(), []);
  const [format, setFormat] = React.useState<SnippetFormat>("html");
  const [copied, setCopied] = React.useState(false);

  const handleCopy = React.useCallback(async () => {
    await navigator.clipboard.writeText(snippets[format]);
    setCopied(true);
    track("badge_copy", { format });
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  }, [format, snippets]);

  return (
    <section className="mt-16 rounded-md border border-border bg-card p-6">
      <h2 className="text-xl font-semibold">Built something? Add the badge</h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Drop this into your README or site footer. The link points back to VLLNT
        UI, so every project that ships it helps others discover the library.
      </p>

      <div className="mt-5 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- external badge endpoint, intentionally unoptimized */}
        <img alt="Built with VLLNT UI" height={28} src={BADGE_SVG_PATH} />
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {FORMATS.map((option) => (
          <Button
            key={option.value}
            onClick={() => {
              setFormat(option.value);
            }}
            size="sm"
            variant={option.value === format ? "default" : "outline"}
          >
            {option.label}
          </Button>
        ))}
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <code className="flex-1 overflow-x-auto rounded-md border border-border bg-muted/30 p-3 font-mono text-xs text-foreground">
          {snippets[format]}
        </code>
        <Button
          className="gap-2 sm:self-start"
          onClick={handleCopy}
          variant="outline"
        >
          {copied ? (
            <>
              <Check className="size-3" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-3" />
              Copy
            </>
          )}
        </Button>
      </div>
    </section>
  );
}
