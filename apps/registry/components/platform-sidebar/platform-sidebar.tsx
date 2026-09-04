"use client";

import { Suspense, useMemo } from "react";

import { Sidebar, type SidebarSection } from "@vllnt/ui";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { getPlatform, withPlatformQuery } from "@/lib/platform";

import nativeManifest from "../../../../packages/ui-native/registry.json";

const NATIVE_COMPONENT_NAMES = new Set(
  nativeManifest.components.map((component) => component.name),
);

type PlatformSidebarProps = {
  readonly sections: SidebarSection[];
};

type SidebarWithQueryProps = PlatformSidebarProps & {
  readonly ariaLabel: string;
  readonly closeLabel: string;
};

function getHrefPathname(href: string): string {
  return href.split(/[#?]/, 1)[0] ?? href;
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
    const nativeGuidePath = sections
      .flatMap((section) => section.items)
      .map((item) => getHrefPathname(item.href))
      .find((itemPathname) => itemPathname.endsWith("/docs/native"));
    const effectivePlatform =
      selectedPlatform ?? (pathname === nativeGuidePath ? "native" : undefined);
    const nativeMode = effectivePlatform === "native";

    return sections
      .map((section) => ({
        ...section,
        href: section.href
          ? withPlatformQuery(section.href, parameters, effectivePlatform)
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
            return {
              ...item,
              href: withPlatformQuery(
                item.href,
                parameters,
                itemPathname === nativeGuidePath ? "native" : effectivePlatform,
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

/** Preserves capability-filter and unrelated query state across sidebar links. */
export function PlatformSidebar({ sections }: PlatformSidebarProps) {
  const t = useTranslations("sidebar");
  const ariaLabel = t("navigationLabel");
  const closeLabel = t("closeNavigation");

  return (
    <Suspense
      fallback={
        <Sidebar
          ariaLabel={ariaLabel}
          closeLabel={closeLabel}
          sections={sections}
        />
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
