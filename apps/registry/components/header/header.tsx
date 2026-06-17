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

import { GitHubMark } from "@/components/github-mark";
import { searchPagefind } from "@/components/header/pagefind-search";
import {
  Link,
  type Locale,
  routing,
  usePathname,
  useRouter,
} from "@/i18n/routing";
import { localizePathname } from "@/lib/seo";
import registryData from "@/registry.json";

const GITHUB_URL = "https://github.com/vllnt/ui";

type HeaderProps = {
  readonly locale: Locale;
};

export function Header({ locale }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("header");

  const navItems = [
    { href: localizePathname("/", locale), title: t("navGetStarted") },
    { href: localizePathname("/docs", locale), title: "Docs" },
    {
      href: localizePathname("/philosophy", locale),
      title: t("navPhilosophy"),
    },
    { href: localizePathname("/design", locale), title: "Design" },
    {
      href: localizePathname("/components", locale),
      title: t("navComponents"),
    },
    { href: localizePathname("/templates", locale), title: "Templates" },
    { href: localizePathname("/themes", locale), title: "Themes" },
    {
      href: localizePathname("/request-component", locale),
      title: "Request",
    },
  ];

  const searchItems = registryData.items.reduce<
    { description?: string; href?: string; id: string; title: string }[]
  >((items, item) => {
    if (item.type !== "registry:component") return items;

    items.push({
      description: item.description,
      href: localizePathname(`/components/${item.name}`, locale),
      id: item.name,
      title: item.title,
    });

    return items;
  }, []);

  return (
    <NavbarSaas
      brand="VLLNT UI"
      navItems={navItems}
      rightSlot={
        <div className="flex items-center gap-2">
          <SearchDialog
            buttonText="Search..."
            docsEmptyText="No docs found."
            docsGroupHeading="Docs"
            docsSearch={searchPagefind}
            emptyText="No results found."
            groupHeading="Components"
            items={searchItems}
            onDocsSelect={(item) => {
              router.push(item.href ?? item.id);
            }}
            onSelect={(item) => {
              router.push(
                item.href ?? localizePathname(`/components/${item.id}`, locale),
              );
            }}
            searchPlaceholder="Search docs and components..."
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline">
                What&apos;s new
                <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/releases">Releases</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/changelog">Changelog</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/rss.xml">RSS feed</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex items-center rounded-md border border-border">
            <Languages
              aria-hidden="true"
              className="ml-2 size-4 text-muted-foreground"
            />
            {routing.locales.map((entry) => (
              <Link
                aria-current={entry === locale ? "page" : undefined}
                className="px-2 py-1 text-xs font-medium uppercase text-muted-foreground hover:text-foreground aria-[current=page]:text-foreground"
                href={pathname}
                key={entry}
                locale={entry}
              >
                {entry}
              </Link>
            ))}
          </div>
          <a
            aria-label={t("githubLabel")}
            className="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <GitHubMark className="size-4" />
          </a>
        </div>
      }
    />
  );
}
