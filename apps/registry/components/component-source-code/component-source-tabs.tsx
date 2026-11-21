"use client";

import { useId, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vllnt/ui";
import dynamic from "next/dynamic";
import type { KeyboardEvent } from "react";

type SourceTab = {
  readonly code: string;
  readonly id: string;
  readonly label: string;
  readonly language?: string;
};

/** Reserves the code box height while the highlighter chunk loads. */
function SourceCodeLoading() {
  return (
    <div
      aria-hidden="true"
      className="h-40 rounded-lg border border-border bg-[#282c34]"
    />
  );
}

// A separate chunk: a page loads the highlighter when a source panel first
// renders (server rendering still writes the highlighted HTML).
const SourceCodeView = dynamic(
  () => import("./source-code-view").then((module) => module.SourceCodeView),
  { loading: SourceCodeLoading },
);

type ComponentSourceTabsProps = {
  readonly label: string;
  readonly sources: readonly [SourceTab, ...SourceTab[]];
};

function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
  if (!["ArrowLeft", "ArrowRight", "End", "Home"].includes(event.key)) {
    return;
  }

  const tabs = [
    ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
      ':scope > [role="tab"]',
    ),
  ];
  const activeIndex = tabs.indexOf(document.activeElement as HTMLButtonElement);
  if (activeIndex < 0) return;

  event.preventDefault();
  const nextIndex =
    event.key === "Home"
      ? 0
      : event.key === "End"
        ? tabs.length - 1
        : (activeIndex + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) %
          tabs.length;
  tabs[nextIndex]?.focus();
  tabs[nextIndex]?.click();
}

export function ComponentSourceTabs({
  label,
  sources,
}: ComponentSourceTabsProps) {
  const [firstSource] = sources;
  const instanceId = useId();
  const [activeSource, setActiveSource] = useState(firstSource.id);

  return (
    <Tabs className="my-0" onValueChange={setActiveSource} value={activeSource}>
      <div className="border-b">
        <TabsList
          aria-label={label}
          className="border-b-0"
          onKeyDown={handleKeyDown}
        >
          {sources.map((source) => (
            <TabsTrigger
              aria-controls={
                activeSource === source.id
                  ? `${instanceId}-${source.id}-panel`
                  : undefined
              }
              id={`${instanceId}-${source.id}-tab`}
              key={source.id}
              tabIndex={activeSource === source.id ? 0 : -1}
              value={source.id}
            >
              {source.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {sources.map((source) => (
        <TabsContent
          aria-labelledby={`${instanceId}-${source.id}-tab`}
          className="pt-4"
          id={`${instanceId}-${source.id}-panel`}
          key={source.id}
          value={source.id}
        >
          <SourceCodeView
            code={source.code}
            language={source.language ?? "typescript"}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
}
