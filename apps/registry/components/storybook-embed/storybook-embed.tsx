"use client";

import * as React from "react";

const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "http://localhost:6006";

function toStoryId(componentName: string): string {
  return `components-${componentName}--default`;
}

type StorybookEmbedProps = {
  className?: string;
  componentName: string;
  height?: number;
  storyId?: string;
};

export function StorybookEmbed({
  className,
  componentName,
  height = 400,
  storyId,
}: StorybookEmbedProps): React.ReactElement {
  const [isLoading, setIsLoading] = React.useState(true);
  const resolvedStoryId = storyId ?? toStoryId(componentName);
  const iframeSource = `${STORYBOOK_URL}/iframe.html?id=${resolvedStoryId}&viewMode=story&shortcuts=false&singleStory=true`;

  return (
    <div className={className}>
      {isLoading ? (
        <div
          className="flex animate-pulse items-center justify-center rounded-lg bg-muted"
          style={{ height }}
        >
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      ) : null}
      <iframe
        className="w-full rounded-lg border-0"
        onLoad={() => {
          setIsLoading(false);
        }}
        src={iframeSource}
        style={{ display: isLoading ? "none" : "block", height }}
        title={`${componentName} preview`}
      />
    </div>
  );
}
