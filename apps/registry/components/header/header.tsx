"use client";

import { NavbarSaas, SearchDialog } from "@vllnt/ui";
import { ExternalLink } from "lucide-react";
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
    { href: "/design", title: "Design" },
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
          <a
            aria-label="VLLNT UI on GitHub"
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
