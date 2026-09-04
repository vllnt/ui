"use client";

import { useId, useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@vllnt/ui";
import type { KeyboardEvent, ReactNode } from "react";

type SourceTab = {
  readonly content: ReactNode;
  readonly id: string;
  readonly label: string;
};

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
              aria-controls={`${instanceId}-${source.id}-panel`}
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
          {source.content}
        </TabsContent>
      ))}
    </Tabs>
  );
}
