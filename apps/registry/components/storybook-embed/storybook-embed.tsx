"use client";

import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "@vllnt/ui";

const STORYBOOK_URL =
  process.env.NEXT_PUBLIC_STORYBOOK_URL ?? "http://localhost:6006";

type PreviewTheme = "dark" | "light";

type StorybookEmbedProps = {
  className?: string;
  componentName: string;
  height?: number;
  storyId?: string;
};

type PreviewThemeControlsProps = {
  onValueChange: (value: PreviewTheme) => void;
  value: null | PreviewTheme;
};

function toStoryId(componentName: string): string {
  return `components-${componentName}--default`;
}

function normalizePreviewTheme(theme: string | undefined): PreviewTheme {
  return theme === "dark" ? "dark" : "light";
}

function resolveDocumentTheme(): PreviewTheme {
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";
  }

  if (typeof window !== "undefined") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
}

function buildStorybookIframeSource(
  storyId: string,
  previewTheme: PreviewTheme,
): string {
  const url = new URL("/iframe.html", STORYBOOK_URL);

  url.searchParams.set("id", storyId);
  url.searchParams.set("viewMode", "story");
  url.searchParams.set("shortcuts", "false");
  url.searchParams.set("singleStory", "true");
  url.searchParams.set("globals", `theme:${previewTheme}`);

  return url.toString();
}

function PreviewThemeControls({
  onValueChange,
  value,
}: PreviewThemeControlsProps): React.ReactElement {
  return (
    <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium">Preview</p>
        <p className="text-xs text-muted-foreground">
          Switch between light and dark to inspect the embedded Storybook
          preview.
        </p>
      </div>
      <ToggleGroup
        aria-label="Preview theme"
        onValueChange={(nextValue) => {
          if (nextValue !== "light" && nextValue !== "dark") {
            return;
          }

          onValueChange(nextValue);
        }}
        size="sm"
        type="single"
        value={value ?? undefined}
        variant="outline"
      >
        <ToggleGroupItem aria-label="Light preview" value="light">
          Light
        </ToggleGroupItem>
        <ToggleGroupItem aria-label="Dark preview" value="dark">
          Dark
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}

function StorybookIframe({
  componentName,
  height,
  iframeSource,
}: {
  componentName: string;
  height: number;
  iframeSource: string;
}): React.ReactElement {
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    setIsLoaded(false);
  }, [iframeSource]);

  return (
    <div style={{ minHeight: height, position: "relative" }}>
      {isLoaded ? null : (
        <div
          className="flex animate-pulse items-center justify-center rounded-b-lg bg-muted"
          style={{ height, inset: 0, position: "absolute", zIndex: 1 }}
        >
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      )}
      <iframe
        className="w-full rounded-b-lg border-0"
        onLoad={() => {
          setIsLoaded(true);
        }}
        sandbox="allow-scripts allow-same-origin"
        src={iframeSource}
        style={{
          height,
          opacity: isLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in",
        }}
        title={`${componentName} preview`}
      />
    </div>
  );
}

export function StorybookEmbed({
  className,
  componentName,
  height = 400,
  storyId,
}: StorybookEmbedProps): React.ReactElement {
  const [hasManualThemeSelection, setHasManualThemeSelection] =
    React.useState(false);
  const [previewTheme, setPreviewTheme] = React.useState<null | PreviewTheme>(
    null,
  );
  const resolvedStoryId = storyId ?? toStoryId(componentName);

  React.useEffect(() => {
    if (hasManualThemeSelection) {
      return;
    }

    const updateTheme = () => {
      setPreviewTheme(normalizePreviewTheme(resolveDocumentTheme()));
    };

    updateTheme();

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const observer = new MutationObserver(() => {
      updateTheme();
    });

    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
    mediaQuery.addEventListener("change", updateTheme);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, [hasManualThemeSelection]);

  const iframeSource = React.useMemo(() => {
    if (previewTheme === null) {
      return "";
    }

    return buildStorybookIframeSource(resolvedStoryId, previewTheme);
  }, [previewTheme, resolvedStoryId]);

  return (
    <div className={className}>
      <PreviewThemeControls
        onValueChange={(value) => {
          setHasManualThemeSelection(true);
          setPreviewTheme(value);
        }}
        value={previewTheme}
      />
      {iframeSource ? (
        <StorybookIframe
          componentName={componentName}
          height={height}
          iframeSource={iframeSource}
        />
      ) : null}
    </div>
  );
}
