import { registry } from "@/lib/registry";
import type { ComponentCategory, RegistryComponent } from "@/types/registry";

/**
 * Pure category grouping for the docs sidebar. This module avoids i18n imports
 * so a unit test can import the grouping without pulling in next-intl;
 * `sidebar-sections.ts` localizes the result.
 */

const components = registry.items
  .filter(
    (item): item is RegistryComponent => item.type === "registry:component",
  )
  .map((item) => ({
    category: item.category,
    name: item.name,
    title: item.title,
  }))
  .sort((a, b) => a.title.localeCompare(b.title));

const categoryLabels = new Map<ComponentCategory, string>([
  ["ai", "AI"],
  ["billing", "Billing"],
  ["content", "Content"],
  ["core", "Core"],
  ["data", "Data"],
  ["data-display", "Data Display"],
  ["educational", "Educational"],
  ["form", "Form"],
  ["learning", "Learning"],
  ["navigation", "Navigation"],
  ["overlay", "Overlay"],
  ["utility", "Utility"],
]);

const categoryOrder: ComponentCategory[] = [
  "core",
  "form",
  "overlay",
  "navigation",
  "data",
  "data-display",
  "content",
  "ai",
  "learning",
  "educational",
  "billing",
  "utility",
];

function groupComponentsByCategory(
  items: { category?: ComponentCategory; name: string; title: string }[],
) {
  const grouped = items.reduce((accumulator, item) => {
    const category = item.category ?? "utility";
    const existing = accumulator.get(category) ?? [];
    accumulator.set(category, [
      ...existing,
      { name: item.name, title: item.title },
    ]);
    return accumulator;
  }, new Map<ComponentCategory, { name: string; title: string }[]>());

  const orderedCategories = [
    ...categoryOrder.filter((cat) => grouped.has(cat)),
    ...[...grouped.keys()].filter((cat) => !categoryOrder.includes(cat)),
  ];

  return orderedCategories.map((category) => ({
    category,
    items: grouped.get(category) ?? [],
    label: categoryLabels.get(category) ?? category,
  }));
}

const groupedComponents = groupComponentsByCategory(components);

function getCategoryForComponent(
  componentName: string,
): ComponentCategory | undefined {
  const component = components.find((c) => c.name === componentName);
  return component?.category;
}

export { components, getCategoryForComponent, groupedComponents };
