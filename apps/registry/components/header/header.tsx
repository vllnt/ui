"use client";

import { NavbarSaas, SearchDialog } from "@vllnt/ui";
import { useRouter } from "next/navigation";

import { GitHubMark } from "@/components/github-mark";
import registryData from "@/registry.json";

const GITHUB_URL = "https://github.com/vllnt/ui";

type Registry = {
  items: { description?: string; name: string; title: string; type: string }[];
};

export function Header() {
  const { push } = useRouter();
  const registry = registryData as Registry;

  const navItems = [
    { href: "/", title: "Get Started" },
    { href: "/docs", title: "Docs" },
    { href: "/philosophy", title: "Philosophy" },
    { href: "/components", title: "Components" },
  ];

  const searchItems = registry.items.reduce<
    { description?: string; id: string; title: string }[]
  >((items, item) => {
    if (item.type !== "registry:component") return items;

    items.push({
      description: item.description,
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
            buttonText="Search components..."
            emptyText="No components found."
            groupHeading="Components"
            items={searchItems}
            onSelect={(item) => {
              push(`/components/${item.id}`);
            }}
            searchPlaceholder="Search components..."
          />
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
