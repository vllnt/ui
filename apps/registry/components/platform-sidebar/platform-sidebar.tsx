"use client";

import { Suspense, useEffect, useMemo, useSyncExternalStore } from "react";

import { Sidebar, type SidebarSection } from "@vllnt/ui";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { getPlatform, withPlatformQuery } from "@/lib/platform";

import nativeManifest from "../../../../packages/ui-native/registry.json";

const NATIVE_COMPONENT_NAMES = new Set(
  nativeManifest.components.map((component) => component.name),
);

type PlatformSidebarProps = {
  readonly sections: SidebarSection[];
};

const queryListeners = new Set<() => void>();
let currentQuery = "";

function publishQuery(query: string) {
  if (query === currentQuery) return;
  currentQuery = query;
  queryListeners.forEach((notify) => {
    notify();
  });
}

function subscribeToQuery(listener: () => void) {
  queryListeners.add(listener);

  return () => {
    queryListeners.delete(listener);
  };
}

function getQuerySnapshot(): string {
  return currentQuery;
}

function getServerQuerySnapshot(): string {
  return "";
}

/**
 * Mirrors the URL query into the store above and renders nothing. Reading the
 * query with `useSearchParams` makes statically rendered pages client-render
 * everything up to the nearest Suspense boundary, so only this empty component
 * sits inside one: the sidebar itself is never swapped out and remounted after
 * hydration (which re-ran its open animation and shifted the whole page).
 */
function PlatformQuerySync() {
  const query = useSearchParams().toString();

  useEffect(() => {
    publishQuery(query);
  }, [query]);

  return null;
}
PlatformQuerySync.displayName = "PlatformQuerySync";

function toPlatformSections(
  sections: SidebarSection[],
  query: string,
): SidebarSection[] {
  const parameters = new URLSearchParams(query);
  const selectedPlatform = getPlatform(
    parameters.get("platform") ?? undefined,
    "all",
  );
  const nativeMode = selectedPlatform === "native";

  return sections
    .map((section) => ({
      ...section,
      href: section.href
        ? withPlatformQuery(section.href, parameters, selectedPlatform)
        : undefined,
      items: section.items
        .filter(
          (item) =>
            !nativeMode ||
            !section.family ||
            NATIVE_COMPONENT_NAMES.has(item.href.split("/").at(-1) ?? ""),
        )
        .map((item) => ({
          ...item,
          href: withPlatformQuery(item.href, parameters, selectedPlatform),
        })),
    }))
    .filter((section) => !section.family || section.items.length > 0);
}

/** Preserves capability-filter and unrelated query state across sidebar links. */
export function PlatformSidebar({ sections }: PlatformSidebarProps) {
  const t = useTranslations("sidebar");
  const query = useSyncExternalStore(
    subscribeToQuery,
    getQuerySnapshot,
    getServerQuerySnapshot,
  );
  const platformSections = useMemo(
    () => toPlatformSections(sections, query),
    [query, sections],
  );

  return (
    <>
      <Suspense fallback={null}>
        <PlatformQuerySync />
      </Suspense>
      <Sidebar
        ariaLabel={t("navigationLabel")}
        closeLabel={t("closeNavigation")}
        sections={platformSections}
      />
    </>
  );
}
