"use client";

import { NavbarSaas, SearchDialog } from "@vllnt/ui";
import { useRouter } from "next/navigation";

import registryData from "@/registry.json";

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
      }
    />
  );
}
