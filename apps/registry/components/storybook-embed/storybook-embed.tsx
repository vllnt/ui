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
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [iframeSource, setIframeSource] = React.useState("");
  const resolvedStoryId = storyId ?? toStoryId(componentName);

  React.useEffect(() => {
    setIframeSource(
      `${STORYBOOK_URL}/iframe.html?id=${resolvedStoryId}&viewMode=story&shortcuts=false&singleStory=true`,
    );
  }, [resolvedStoryId]);

  return (
    <div
      className={className}
      style={{ minHeight: height, position: "relative" }}
    >
      {isLoaded ? null : (
        <div
          className="flex animate-pulse items-center justify-center rounded-lg bg-muted"
          style={{ height, inset: 0, position: "absolute", zIndex: 1 }}
        >
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      )}
      {iframeSource ? (
        <iframe
          className="w-full rounded-lg border-0"
          onLoad={() => {
            setIsLoaded(true);
          }}
          src={iframeSource}
          style={{
            height,
            opacity: isLoaded ? 1 : 0,
            transition: "opacity 0.3s ease-in",
          }}
          title={`${componentName} preview`}
        />
      ) : null}
    </div>
  );
}
