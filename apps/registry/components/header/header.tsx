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
import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { searchPagefind } from "@/components/header/pagefind-search";
import { GitHubMark } from "@/components/github-mark";
import registryData from "@/registry.json";

const GITHUB_URL = "https://github.com/vllnt/ui";

type Registry = {
  items: { description?: string; name: string; title: string; type: string }[];
};

export function Header() {
  const router = useRouter();
  const registry = registryData as Registry;

  const navItems = [
    { href: "/", title: "Get Started" },
    { href: "/docs", title: "Docs" },
    { href: "/philosophy", title: "Philosophy" },
    { href: "/components", title: "Components" },
  ];

  const searchItems = registry.items.reduce<
    { description?: string; href?: string; id: string; title: string }[]
  >((items, item) => {
    if (item.type !== "registry:component") return items;

    items.push({
      description: item.description,
      href: `/components/${item.name}`,
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
              router.push(item.href ?? `/components/${item.id}`);
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
                <Link href="/rss.xml">RSS feed</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <a
            aria-label="VLLNT UI on GitHub"
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
