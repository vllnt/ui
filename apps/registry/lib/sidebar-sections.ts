import registryData from "@/registry.json";
import type { ComponentCategory, Registry } from "@/types/registry";

const registry = registryData as Registry;

const components = registry.items
  .reduce<{ category?: ComponentCategory; name: string; title: string }[]>(
    (items, item) => {
      if (item.type === "registry:component") {
        items.push({
          category: item.category,
          name: item.name,
          title: item.title,
        });
      }
      return items;
    },
    [],
  )
  .sort((a, b) => a.title.localeCompare(b.title));

const categoryLabels: Record<ComponentCategory, string> = {
  content: "Content",
  core: "Core",
  data: "Data",
  form: "Form",
  learning: "Learning",
  navigation: "Navigation",
  overlay: "Overlay",
  utility: "Utility",
};

const categoryOrder: ComponentCategory[] = [
  "core",
  "form",
  "overlay",
  "navigation",
  "data",
  "content",
  "learning",
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

  return categoryOrder.flatMap((category) => {
    const categoryItems = grouped.get(category);
    return categoryItems
      ? [
          {
            category,
            items: categoryItems,
            label: categoryLabels[category],
          },
        ]
      : [];
  });
}

const groupedComponents = groupComponentsByCategory(components);

export function getSidebarSections(_activeCategory?: ComponentCategory) {
  return [
    {
      items: [
        { href: "/", title: "Get Started" },
        { href: "/philosophy", title: "Philosophy" },
        { href: "/components", title: "Components" },
      ],
    },
    ...groupedComponents.map((group) => ({
      collapsible: true,
      defaultOpen: true,
      items: group.items.map((item) => ({
        href: `/components/${item.name}`,
        title: item.title,
      })),
      title: group.label,
    })),
  ];
}

export function getCategoryForComponent(
  componentName: string,
): ComponentCategory | undefined {
  const component = components.find((c) => c.name === componentName);
  return component?.category;
}

export { components, groupedComponents };
