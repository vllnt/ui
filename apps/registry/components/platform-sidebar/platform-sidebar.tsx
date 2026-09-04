"use client";

import { Suspense, useMemo } from "react";

import { Sidebar, type SidebarSection } from "@vllnt/ui";
import { useSearchParams } from "next/navigation";

import { withPlatformQuery } from "@/lib/platform";

import nativeManifest from "../../../../packages/ui-native/registry.json";

const NATIVE_COMPONENT_NAMES = new Set(
  nativeManifest.components.map((component) => component.name),
);

type PlatformSidebarProps = {
  readonly sections: SidebarSection[];
};

function SidebarWithQuery({ sections }: PlatformSidebarProps) {
  const searchParameters = useSearchParams();
  const query = searchParameters.toString();
  const platformSections = useMemo(() => {
    const parameters = new URLSearchParams(query);
    const nativeMode = parameters.get("platform") === "native";
    return sections
      .map((section) => ({
        ...section,
        href: section.href
          ? withPlatformQuery(section.href, parameters)
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
            href: withPlatformQuery(item.href, parameters),
          })),
      }))
      .filter((section) => !section.family || section.items.length > 0);
  }, [query, sections]);

  return <Sidebar sections={platformSections} />;
}
SidebarWithQuery.displayName = "SidebarWithQuery";

/** Preserves the current platform and query context across sidebar links. */
export function PlatformSidebar({ sections }: PlatformSidebarProps) {
  return (
    <Suspense fallback={<Sidebar sections={[]} />}>
      <SidebarWithQuery sections={sections} />
    </Suspense>
  );
}
