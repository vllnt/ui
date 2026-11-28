"use client";

import { useMemo } from "react";

import { Sidebar, type SidebarSection } from "@vllnt/ui";
import { useLocale, useTranslations } from "next-intl";

import { useForwardedQuery } from "@/components/forwarded-query";
import { getPathname, usePathname } from "@/i18n/routing";
import {
  forwardedParameters,
  getPlatform,
  type PlatformContext,
  withPlatformQuery,
} from "@/lib/platform";
import { publicPagePathname } from "@/lib/platform-variant";

import nativeManifest from "../../../../packages/ui-native/registry.json";

const NATIVE_COMPONENT_NAMES = new Set(
  nativeManifest.components.map((component) => component.name),
);

/**
 * The page scrolls, not a pane, so this frame keeps the sidebar in view under
 * the sticky header (a 52 px row and a 1 px hairline). Below 1024 px the
 * sidebar is a fixed drawer and the frame is empty. The site search indexes the
 * page's `main`, which holds the sidebar, so the frame opts out of it.
 */
const SIDEBAR_FRAME =
  "shrink-0 lg:sticky lg:top-[53px] lg:h-[calc(100dvh-53px)] lg:self-start";

type PlatformSidebarProps = {
  /** Platform the prerendered page shows, so its server HTML links it. */
  readonly platform?: PlatformContext;
  readonly sections: SidebarSection[];
};

/**
 * The URL the browser shows for this page. A prerendered default-locale page
 * renders under `/en/...` and a platform variant under `/p/<platform>/...`,
 * while the browser shows the public URL, so the library sidebar would mark a
 * different current page on the server than in the browser and fail to hydrate
 * in place.
 */
function usePublicPathname(): string {
  const locale = useLocale();
  const pathname = usePathname();

  return getPathname({ href: publicPagePathname(pathname), locale });
}

/** Keeps the platform variant across sidebar links; other query state stays on its page. */
export function PlatformSidebar({ platform, sections }: PlatformSidebarProps) {
  const t = useTranslations("sidebar");
  const forwardedQuery = useForwardedQuery();
  const publicPathname = usePublicPathname();
  const platformSections = useMemo(() => {
    const parameters =
      forwardedQuery ??
      forwardedParameters(new URLSearchParams(platform ? { platform } : {}));
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
  }, [forwardedQuery, platform, sections]);

  return (
    <div className={SIDEBAR_FRAME} data-pagefind-ignore="">
      <Sidebar
        ariaLabel={t("navigationLabel")}
        closeLabel={t("closeNavigation")}
        pathname={publicPathname}
        prefetch={false}
        sections={platformSections}
      />
    </div>
  );
}
