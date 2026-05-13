"use client";

import { NavbarSaas, SearchDialog } from "@vllnt/ui";
import { ExternalLink, Languages } from "lucide-react";
import { useTranslations } from "next-intl";

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

type Registry = {
  items: { description?: string; name: string; title: string; type: string }[];
};

type HeaderProps = {
  locale: Locale;
};

export function Header({ locale }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("header");
  const registry = registryData as Registry;

  const navItems = [
    { href: localizePathname("/", locale), title: t("navGetStarted") },
    {
      href: localizePathname("/philosophy", locale),
      title: t("navPhilosophy"),
    },
    {
      href: localizePathname("/components", locale),
      title: t("navComponents"),
    },
  ];

  const searchItems = registry.items
    .filter((item) => item.type === "registry:component")
    .map((item) => ({
      description: item.description,
      id: item.name,
      title: item.title,
    }));

  return (
    <NavbarSaas
      brand="VLLNT UI"
      navItems={navItems}
      rightSlot={
        <div className="flex items-center gap-2">
          <SearchDialog
            buttonText={t("searchButton")}
            emptyText={t("searchEmpty")}
            groupHeading={t("searchGroup")}
            items={searchItems}
            onSelect={(item) => {
              router.push(`/components/${item.id}`);
            }}
            searchPlaceholder={t("searchPlaceholder")}
          />
          <div className="flex items-center rounded-md border border-border">
            <Languages
              aria-hidden="true"
              className="ml-2 h-4 w-4 text-muted-foreground"
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      }
    />
  );
}
