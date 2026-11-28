"use client";

import { SiteHeader, type SiteLocaleLink, type SiteNavItem } from "@vllnt/ui";
import { useTranslations } from "next-intl";

import { HeaderActions } from "@/components/header/header-actions";
import { usePreservedQuery } from "@/components/header/use-preserved-query";
import { type Locale, routing, usePathname } from "@/i18n/routing";
import { publicPagePathname } from "@/lib/platform-variant";
import { localizePathname } from "@/lib/seo";
import { switcherGroups } from "@/lib/site-network";

/** next-intl's default locale cookie name. */
const LOCALE_COOKIE = "NEXT_LOCALE";

function rememberLocale(locale: Locale): void {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; samesite=lax`;
}

/** A language's own name, which no language translates. */
const LANGUAGE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
};

/**
 * The links of the bar, in order. `tablet` links join the bar from 768 px and
 * `desktop` links from 1200 px; the menu lists the ones the bar hides.
 */
const NAV_ITEMS = [
  { bar: "desktop", key: "navGetStarted", path: "/" },
  { bar: "tablet", key: "navDocs", path: "/docs" },
  { bar: "desktop", key: "navVision", path: "/vision" },
  { bar: "desktop", key: "navDesign", path: "/design" },
  { bar: "tablet", key: "navComponents", path: "/components" },
  { bar: "desktop", key: "navTemplates", path: "/templates" },
  { bar: "desktop", key: "navThemes", path: "/themes" },
  { bar: "desktop", key: "navRequest", path: "/request-component" },
] as const;

/**
 * The shared site header with this site's links and controls. Its links keep
 * the browser query, which the page can read after hydration, so the
 * prerendered HTML carries the plain links and the query joins them in place.
 */
export function Header({ locale }: { readonly locale: Locale }) {
  const pathname = publicPagePathname(usePathname());
  const t = useTranslations("header");
  const { preserveQuery } = usePreservedQuery();

  const items: SiteNavItem[] = NAV_ITEMS.map(({ bar, key, path }) => ({
    bar,
    href: preserveQuery(localizePathname(path, locale)),
    label: t(key),
  }));

  // The two languages link each other: the one that is not the page's own.
  const other = routing.locales.find((entry) => entry !== locale) ?? locale;
  const localeLink: SiteLocaleLink = {
    ariaLabel: t("localeAria", {
      code: other.toUpperCase(),
      language: t(`languages.${other}`),
    }),
    href: preserveQuery(localizePathname(pathname, other)),
    hrefLang: other,
    label: other.toUpperCase(),
    name: LANGUAGE_NAMES[other],
    // A plain link, not a client navigation: after a soft navigation from
    // `/fr/...` to an unprefixed English URL, Next's router guessed the English
    // route shape wrong and refetched missing prefetch segments without end.
    // The cookie must exist before the request for an unprefixed URL, or the
    // middleware sends a French browser back to /fr.
    onClick: () => {
      rememberLocale(other);
    },
  };

  return (
    <SiteHeader
      actions={<HeaderActions locale={locale} />}
      brand="VLLNT UI"
      currentHref={localizePathname(pathname, locale)}
      homeHref={preserveQuery(localizePathname("/", locale))}
      items={items}
      labels={{
        close: t("closeMenu"),
        external: t("externalLink"),
        home: t("homeLabel"),
        menu: t("menu"),
        open: t("openMenu"),
        primary: t("primaryNavigation"),
      }}
      locale={localeLink}
      network={{
        groups: switcherGroups({
          directory: t("networkGroups.directory"),
          learnBuild: t("networkGroups.learnBuild"),
          platforms: t("networkGroups.platforms"),
        }),
        label: t("networkLabel"),
      }}
    />
  );
}
