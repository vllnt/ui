"use client";

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  SearchDialog,
  useSidebar,
} from "@vllnt/ui";
import { ChevronDown, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import type React from "react";

import { GitHubMark } from "@/components/github-mark";
import { searchPagefind } from "@/components/header/pagefind-search";
import { usePreservedQuery } from "@/components/header/use-preserved-query";
import { Link, type Locale, useRouter } from "@/i18n/routing";
import { localizePathname } from "@/lib/seo";
import registryData from "@/registry.json";

const GITHUB_URL = "https://github.com/vllnt/ui";

/**
 * The search button shows its icon alone: the shared bar has no room for a
 * field, and the text stays for assistive technology. The shortcut hint hides
 * with it.
 */
const SEARCH_BUTTON =
  "w-9 shrink-0 [&_button]:size-9 [&_button]:justify-center [&_button]:px-0 [&_button]:pr-0 [&_button>span:last-child]:hidden [&_button>span:not(:last-child)]:sr-only [&_button>svg]:mr-0";

/** Opens and closes the docs sidebar of the page: a drawer on a narrow screen, a collapse on a wide one. */
function SidebarTrigger(): React.ReactElement {
  const t = useTranslations("header");
  const { open, setOpen } = useSidebar();

  return (
    <Button
      aria-controls="site-sidebar"
      aria-expanded={open}
      aria-label={open ? t("closeNavigation") : t("openNavigation")}
      onClick={() => {
        setOpen(!open);
      }}
      size="icon"
      variant="ghost"
    >
      {open ? (
        <PanelLeftClose aria-hidden="true" className="size-4" />
      ) : (
        <PanelLeftOpen aria-hidden="true" className="size-4" />
      )}
    </Button>
  );
}

/** Site search over the components and the docs. */
function Search({ locale }: { readonly locale: Locale }): React.ReactElement {
  const router = useRouter();
  const t = useTranslations("header");
  const { activePlatform, preserveQuery } = usePreservedQuery();

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
    <div className={SEARCH_BUTTON}>
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
              item.href ?? localizePathname(`/components/${item.id}`, locale),
            ),
          );
        }}
        searchPlaceholder={t("searchPlaceholder")}
      />
    </div>
  );
}

/**
 * Shown from 1536 px: below that the nav links need the room (with DejaVu, the
 * default Linux font, the row overflowed at 1280 px). The footer and
 * /docs/changelog link the same pages.
 */
function WhatsNew(): React.ReactElement {
  const t = useTranslations("header");
  const { preserveQuery } = usePreservedQuery();

  return (
    <div className="hidden 2xl:block">
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
            <Link href={preserveQuery("/changelog")}>{t("changelog")}</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            {/* react-doctor-disable-next-line react-doctor/nextjs-no-a-element -- /rss.xml is an XML feed, not a Next page; the router cannot render it */}
            <a href="/rss.xml">{t("rssFeed")}</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * What this site adds to the shared header, through its `actions` slot:
 * the docs sidebar toggle, the search, the release links and the source link.
 */
export function HeaderActions({
  locale,
}: {
  readonly locale: Locale;
}): React.ReactElement {
  const t = useTranslations("header");

  return (
    <>
      <SidebarTrigger />
      <Search locale={locale} />
      <WhatsNew />
      <a
        aria-label={t("githubLabel")}
        className="hidden size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:inline-flex [@media(pointer:coarse)]:size-11"
        href={GITHUB_URL}
        rel="noreferrer"
        target="_blank"
      >
        <GitHubMark className="size-4" />
      </a>
    </>
  );
}
