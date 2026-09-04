"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useTranslations } from "next-intl";

import type { ComponentPlatform } from "@/lib/registry";

type ComponentThumbnailProps = {
  readonly componentName: string;
  readonly platform?: ComponentPlatform;
  readonly title: string;
};

type Theme = "dark" | "light";

const themeListeners = new Set<() => void>();
let themeObserver: MutationObserver | undefined;

function getThemeSnapshot(): Theme {
  return typeof document !== "undefined" &&
    document.documentElement.classList.contains("light")
    ? "light"
    : "dark";
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);
  if (!themeObserver) {
    themeObserver = new MutationObserver(() => {
      themeListeners.forEach((notify) => {
        notify();
      });
    });
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributes: true,
    });
  }

  return () => {
    themeListeners.delete(listener);
    if (themeListeners.size === 0) {
      themeObserver?.disconnect();
      themeObserver = undefined;
    }
  };
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

function getPreviewOriginSnapshot(): string {
  if (process.env.NODE_ENV !== "development") return "";

  const origin = new URL(window.location.href);
  if (origin.hostname === "localhost") {
    origin.hostname = "127.0.0.1";
  } else if (origin.hostname === "127.0.0.1") {
    origin.hostname = "localhost";
  } else {
    return "";
  }

  return origin.origin;
}

function getServerPreviewOriginSnapshot(): string {
  return "";
}

function noopUnsubscribe() {
  return;
}

function subscribeToLocation() {
  return noopUnsubscribe;
}

function getSandbox(previewOrigin: string): string {
  return previewOrigin ? "allow-scripts allow-same-origin" : "allow-scripts";
}

/**
 * Mounts each Web preview in a sandboxed document while its card is near the
 * viewport, then releases that document outside the observer buffer. The iframe
 * boundary contains component CSS, portals, and runtime effects.
 *
 * Production grants script execution to an opaque iframe origin. Local
 * development uses the alternate loopback host so Turbopack can serve assets
 * while the preview remains cross-origin from the catalog. Navigation, forms,
 * popups, and parent interaction remain blocked in both modes.
 */
export function ComponentThumbnail({
  componentName,
  platform,
  title,
}: ComponentThumbnailProps) {
  const t = useTranslations("pages.components");
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );
  const previewOrigin = useSyncExternalStore(
    subscribeToLocation,
    getPreviewOriginSnapshot,
    getServerPreviewOriginSnapshot,
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      // Compatibility fallback: mount once after hydration when observation is unavailable.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsNearViewport(Boolean(entry?.isIntersecting));
      },
      { rootMargin: "300px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
    };
  }, []);

  const previewUrl = `${previewOrigin}/embed/${encodeURIComponent(componentName)}?mode=thumbnail&theme=${theme}`;
  const sandbox = getSandbox(previewOrigin);

  return (
    <div
      className="relative flex h-48 w-full isolate items-center justify-center overflow-hidden bg-muted/30 [contain:strict]"
      ref={rootRef}
    >
      <div
        aria-hidden="true"
        className="size-full overflow-hidden pointer-events-none select-none"
        inert
      >
        {isNearViewport ? (
          <iframe
            className="size-full border-0 bg-background"
            loading="lazy"
            sandbox={sandbox}
            src={previewUrl}
            tabIndex={-1}
            title={t("webPreviewTitle", { name: title })}
          />
        ) : (
          <div className="size-full animate-pulse bg-muted" />
        )}
      </div>
      {platform === "native" ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 border-t border-border/80 bg-background/95 px-3 py-1.5 text-center text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground backdrop-blur-sm">
          {t("webPreview")}
        </span>
      ) : null}
    </div>
  );
}
