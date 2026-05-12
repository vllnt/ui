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
import { ChevronDown, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
    { href: "/philosophy", title: "Philosophy" },
    { href: "/components", title: "Components" },
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
            buttonText="Search components..."
            emptyText="No components found."
            groupHeading="Components"
            items={searchItems}
            onSelect={(item) => {
              router.push(`/components/${item.id}`);
            }}
            searchPlaceholder="Search components..."
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
            className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            href={GITHUB_URL}
            rel="noreferrer"
            target="_blank"
          >
            <ExternalLink className="size-4" />
          </a>
        </div>
      }
    />
  );
}
