"use client";

import { Suspense } from "react";

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
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { GitHubMark } from "@/components/github-mark";
import { searchPagefind } from "@/components/header/pagefind-search";
import { PlatformSelector } from "@/components/platform-selector";
import {
  Link,
  type Locale,
  routing,
  usePathname,
  useRouter,
} from "@/i18n/routing";
import { getPlatform, withPlatformQuery } from "@/lib/platform";
import { localizePathname } from "@/lib/seo";
import registryData from "@/registry.json";

const GITHUB_URL = "https://github.com/vllnt/ui";

type HeaderProps = {
  readonly locale: Locale;
};

export function Header(props: HeaderProps) {
  return (
    <Suspense fallback={<div aria-hidden="true" className="h-28 border-b" />}>
      <HeaderContent {...props} />
    </Suspense>
  );
}

function HeaderContent({ locale }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParameters = useSearchParams();
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
    <>
      <NavbarSaas
        brand={
          <Link
            className="truncate text-xl font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={preserveQuery("/")}
          >
            VLLNT UI
          </Link>
        }
        navItems={navItems}
        rightSlot={
          <div className="flex min-w-0 items-center gap-1 sm:gap-2">
            <div className="hidden sm:block">
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
                    <Link href={preserveQuery("/releases")}>
                      {t("releases")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={preserveQuery("/changelog")}>
                      {t("changelog")}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <a href="/rss.xml">{t("rssFeed")}</a>
                  </DropdownMenuItem>
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
                  locale={entry}
                >
                  {entry}
                </Link>
              ))}
            </div>
            <a
              aria-label={t("githubLabel")}
              className="hidden size-11 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex"
              href={GITHUB_URL}
              rel="noreferrer"
              target="_blank"
            >
              <GitHubMark className="size-4" />
            </a>
          </div>
        }
      />
      {pathname === "/" ? null : (
        <div className="flex min-h-11 items-center justify-center border-b border-border bg-background px-2">
          <PlatformSelector
            className="flex min-h-11 max-w-full items-center gap-1 overflow-x-auto p-1"
            includeAll={pathname === "/components"}
          />
        </div>
      )}
    </>
  );
}
