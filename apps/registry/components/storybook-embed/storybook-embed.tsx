"use client";

import * as React from "react";

import { ToggleGroup, ToggleGroupItem } from "@vllnt/ui";
import { useTranslations } from "next-intl";

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

function scheduleIdle(callback: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const handle = window.requestIdleCallback(callback);
    return () => {
      window.cancelIdleCallback(handle);
    };
  }
  const handle = window.setTimeout(callback, 200);
  return () => {
    window.clearTimeout(handle);
  };
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
  const t = useTranslations("shared.storybookEmbed");
  return (
    <div className="flex items-center justify-between gap-4 border-b bg-muted/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium">{t("preview")}</p>
        <p className="text-xs text-muted-foreground">{t("description")}</p>
      </div>
      <ToggleGroup
        aria-label={t("themeLabel")}
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
        <ToggleGroupItem aria-label={t("lightLabel")} value="light">
          {t("light")}
        </ToggleGroupItem>
        <ToggleGroupItem aria-label={t("darkLabel")} value="dark">
          {t("dark")}
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

  return (
    <div style={{ minHeight: height, position: "relative" }}>
      {isLoaded ? null : (
        <div
          className="flex animate-pulse items-center justify-center rounded-b-lg bg-muted"
          style={{ height, inset: 0, position: "absolute", zIndex: 1 }}
        >
          <p className="text-sm text-muted-foreground">
            Loading preview&hellip;
          </p>
        </div>
      )}
      <iframe
        className="w-full rounded-b-lg border-0"
        loading="lazy"
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
  const hasManualThemeSelectionRef = React.useRef(false);
  const [previewTheme, setPreviewTheme] = React.useState<null | PreviewTheme>(
    null,
  );
  const resolvedStoryId = storyId ?? toStoryId(componentName);

  React.useEffect(() => {
    if (hasManualThemeSelectionRef.current) {
      return;
    }

    const updateTheme = () => {
      if (hasManualThemeSelectionRef.current) {
        return;
      }

      setPreviewTheme(normalizePreviewTheme(resolveDocumentTheme()));
    };

    // Defer the first iframe load out of the critical hydration/LCP window so
    // the 783KB Storybook bundle does not compete for the main thread/network.
    const cancelIdle = scheduleIdle(updateTheme);

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
      cancelIdle();
      observer.disconnect();
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

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
          hasManualThemeSelectionRef.current = true;
          setPreviewTheme(value);
        }}
        value={previewTheme}
      />
      {iframeSource ? (
        <StorybookIframe
          componentName={componentName}
          height={height}
          iframeSource={iframeSource}
          key={iframeSource}
        />
      ) : null}
    </div>
  );
}
