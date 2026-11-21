"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  NavbarSaas,
  SearchDialog,
} from "@vllnt/ui";
import { ChevronDown, Languages } from "lucide-react";
import { useTranslations } from "next-intl";

import { useForwardedQuery } from "@/components/forwarded-query";
import { GitHubMark } from "@/components/github-mark";
import { searchPagefind } from "@/components/header/pagefind-search";
import {
  Link,
  type Locale,
  routing,
  usePathname,
  useRouter,
} from "@/i18n/routing";
import { languageSwitchLocale } from "@/lib/locale-switch";
import { getPlatform, withPlatformQuery } from "@/lib/platform";
import { publicPagePathname } from "@/lib/platform-variant";
import { localizePathname } from "@/lib/seo";
import registryData from "@/registry.json";

const GITHUB_URL = "https://github.com/vllnt/ui";

type HeaderProps = {
  readonly locale: Locale;
};

const NO_QUERY = new URLSearchParams();

/**
 * Site header. Its links keep the browser query, which the page can read after
 * hydration, so the prerendered HTML carries the plain links and the query
 * joins them in place.
 */
export function Header({ locale }: HeaderProps) {
  const router = useRouter();
  const pathname = publicPagePathname(usePathname());
  const searchParameters = useForwardedQuery() ?? NO_QUERY;
  const common = useTranslations("common");
  const t = useTranslations("header");
  const activePlatform = getPlatform(
    searchParameters.get("platform") ?? undefined,
  );
  const preserveQuery = (href: string) =>
    withPlatformQuery(href, searchParameters);

  const navItems = [
    {
      href: preserveQuery(localizePathname("/", locale)),
      title: t("navGetStarted"),
    },
    {
      href: preserveQuery(localizePathname("/docs", locale)),
      title: t("navDocs"),
    },
    {
      href: preserveQuery(localizePathname("/philosophy", locale)),
      title: t("navPhilosophy"),
    },
    {
      href: preserveQuery(localizePathname("/design", locale)),
      title: t("navDesign"),
    },
    {
      href: preserveQuery(localizePathname("/components", locale)),
      title: t("navComponents"),
    },
    {
      href: preserveQuery(localizePathname("/templates", locale)),
      title: t("navTemplates"),
    },
    {
      href: preserveQuery(localizePathname("/themes", locale)),
      title: t("navThemes"),
    },
    {
      href: preserveQuery(localizePathname("/request-component", locale)),
      title: t("navRequest"),
    },
  ];

  const searchItems = registryData.items.reduce<
    {
      description?: string;
      href?: string;
      id: string;
      keywords?: string;
      title: string;
    }[]
  >((items, item) => {
    if (
      item.type !== "registry:component" ||
      item.stability === "deprecated" ||
      !item.platforms.includes(activePlatform ?? "web")
    ) {
      return items;
    }

    items.push({
      description: item.description,
      href: preserveQuery(localizePathname(`/components/${item.name}`, locale)),
      id: item.name,
      keywords: [item.category, ...(item.platforms ?? ["web"])].join(" "),
      title: item.title,
    });

    return items;
  }, []);

  return (
    <NavbarSaas
      brand={
        <Link
          className="truncate text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={preserveQuery("/")}
        >
          VLLNT UI
        </Link>
      }
      closeSidebarLabel={t("closeNavigation")}
      navItems={navItems}
      openSidebarLabel={t("openNavigation")}
      rightSlot={
        <div className="flex min-w-0 items-center gap-1 sm:gap-2">
          <div className="w-9 shrink-0 max-sm:[&_button]:size-9 max-sm:[&_button]:justify-center max-sm:[&_button]:px-0 max-sm:[&_button_span]:sr-only max-sm:[&_button_svg]:mr-0 sm:w-auto">
            <SearchDialog
              buttonText={t("searchButton")}
              buttonTextMobile={t("searchButton")}
              docsEmptyText={t("searchDocsEmpty")}
              docsGroupHeading={t("searchDocsGroup")}
              docsSearch={searchPagefind}
              emptyText={t("searchEmpty")}
              groupHeading={t("searchGroup")}
              items={searchItems}
              onDocsSelect={(item) => {
                router.push(preserveQuery(item.href ?? item.id));
              }}
              onSelect={(item) => {
                router.push(
                  preserveQuery(
                    item.href ??
                      localizePathname(`/components/${item.id}`, locale),
                  ),
                );
              }}
              searchPlaceholder={t("searchPlaceholder")}
            />
          </div>
          <div className="hidden lg:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="min-h-11" size="sm" variant="outline">
                  {t("whatsNew")}
                  <ChevronDown className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={preserveQuery("/releases")}>{t("releases")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={preserveQuery("/changelog")}>
                    {t("changelog")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  {/* react-doctor-disable-next-line react-doctor/nextjs-no-a-element -- the RSS feed is a non-localized XML file, not a page */}
                  <a href="/rss.xml">{t("rssFeed")}</a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label={`${common("locale")}: ${locale.toUpperCase()}`}
                  className="size-9"
                  size="icon"
                  variant="outline"
                >
                  <Languages aria-hidden="true" className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {routing.locales.map((entry) => (
                  <DropdownMenuItem asChild key={entry}>
                    <Link
                      aria-current={entry === locale ? "page" : undefined}
                      href={preserveQuery(pathname)}
                      locale={languageSwitchLocale(entry, locale)}
                      prefetch={false}
                    >
                      {entry.toUpperCase()}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="hidden items-center rounded-md border border-border md:flex">
            <Languages
              aria-hidden="true"
              className="ml-2 size-4 text-muted-foreground"
            />
            {routing.locales.map((entry) => (
              <Link
                aria-current={entry === locale ? "page" : undefined}
                className="inline-flex min-h-11 items-center px-2 text-xs font-medium uppercase text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:text-foreground"
                href={preserveQuery(pathname)}
                key={entry}
                locale={languageSwitchLocale(entry, locale)}
                prefetch={false}
              >
                {entry}
              </Link>
            ))}
          </div>
          <a
            aria-label={t("githubLabel")}
            className="hidden size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubMark className="size-4" />
          </a>
        </div>
      }
      sidebarId="site-sidebar"
    />
  );
}
