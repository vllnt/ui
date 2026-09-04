"use client";

import { Suspense, useMemo } from "react";

import { Sidebar, type SidebarItem, type SidebarSection } from "@vllnt/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { getPlatform, withPlatformQuery } from "@/lib/platform";
import type { ComponentPlatform } from "@/lib/registry";

import nativeManifest from "../../../../packages/ui-native/registry.json";

const NATIVE_COMPONENT_NAMES = new Set(
  nativeManifest.components.map((component) => component.name),
);

type PlatformSidebarItem = SidebarItem & {
  readonly platform?: ComponentPlatform;
};

type PlatformSidebarSection = Omit<SidebarSection, "items"> & {
  readonly items: PlatformSidebarItem[];
  readonly renderer?: boolean;
};

type PlatformSidebarProps = {
  readonly sections: PlatformSidebarSection[];
};

type SidebarWithQueryProps = PlatformSidebarProps & {
  readonly ariaLabel: string;
  readonly closeLabel: string;
};

function getHrefPathname(href: string): string {
  return href.split(/[#?]/, 1)[0] ?? href;
}

function getRendererContext(
  pathname: string,
  sections: PlatformSidebarSection[],
  selectedPlatform?: ComponentPlatform,
) {
  const rendererItems = sections.find((section) => section.renderer)?.items;
  const nativeOverviewPath = getHrefPathname(
    rendererItems?.find((item) => item.platform === "native")?.href ?? "",
  );
  const webCatalogPath = getHrefPathname(
    rendererItems?.find((item) => item.platform === "web")?.href ?? "",
  );
  const nativeGuidePath = sections
    .flatMap((section) => section.items)
    .map((item) => getHrefPathname(item.href))
    .find((itemPathname) => itemPathname.endsWith("/docs/native"));
  const nativeRoute =
    pathname === nativeOverviewPath || pathname === nativeGuidePath;
  const effectivePlatform =
    selectedPlatform ??
    (nativeRoute ? "native" : pathname === webCatalogPath ? undefined : "web");

  return { effectivePlatform, nativeGuidePath, webCatalogPath };
}

function SidebarWithQuery({
  ariaLabel,
  closeLabel,
  sections,
}: SidebarWithQueryProps) {
  const pathname = usePathname();
  const searchParameters = useSearchParams();
  const query = searchParameters.toString();
  const platformSections = useMemo(() => {
    const parameters = new URLSearchParams(query);
    const selectedPlatform = getPlatform(
      parameters.get("platform") ?? undefined,
      "all",
    );
    const { effectivePlatform, nativeGuidePath, webCatalogPath } =
      getRendererContext(pathname, sections, selectedPlatform);
    const nativeMode = effectivePlatform === "native";

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
          .map((item) => {
            const itemPathname = getHrefPathname(item.href);
            const current =
              section.renderer && item.platform
                ? item.platform === effectivePlatform
                : selectedPlatform && itemPathname === webCatalogPath
                  ? false
                  : item.current;

            return {
              ...item,
              current,
              href: withPlatformQuery(
                item.href,
                parameters,
                itemPathname === nativeGuidePath ? "native" : undefined,
              ),
            };
          }),
      }))
      .filter((section) => !section.family || section.items.length > 0);
  }, [pathname, query, sections]);

  return (
    <Sidebar
      ariaLabel={ariaLabel}
      closeLabel={closeLabel}
      sections={platformSections}
    />
  );
}
SidebarWithQuery.displayName = "SidebarWithQuery";

/** Preserves the current platform and query context across sidebar links. */
export function PlatformSidebar({ sections }: PlatformSidebarProps) {
  const t = useTranslations("sidebar");
  const ariaLabel = t("navigationLabel");
  const closeLabel = t("closeNavigation");

  return (
    <Suspense
      fallback={
        <Sidebar ariaLabel={ariaLabel} closeLabel={closeLabel} sections={[]} />
      }
    >
      <SidebarWithQuery
        ariaLabel={ariaLabel}
        closeLabel={closeLabel}
        sections={sections}
      />
    </Suspense>
  );
}
