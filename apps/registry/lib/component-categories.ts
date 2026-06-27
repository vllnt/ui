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

const categoryDescriptions = new Map<ComponentCategory, string>([
  [
    "ai",
    "Chat, agents, reasoning, and tool-call UI for building AI-native apps.",
  ],
  ["billing", "Pricing tables, plans, and transaction UI for billing flows."],
  ["content", "Layout and content primitives for presenting rich information."],
  ["core", "The foundational building blocks every interface starts from."],
  ["data", "Tables, lists, and inputs for working with structured records."],
  ["data-display", "Charts, metrics, and visualizations for surfacing data."],
  [
    "educational",
    "Lesson, quiz, and knowledge-check UI for learning products.",
  ],
  ["form", "Inputs, controls, and validation for accessible forms."],
  ["learning", "Tutorials, timelines, and progress UI for guided experiences."],
  [
    "navigation",
    "Menus, breadcrumbs, and wayfinding for moving through an app.",
  ],
  ["overlay", "Dialogs, popovers, and sheets that layer above the page."],
  [
    "utility",
    "Indicators, helpers, and small primitives that glue UIs together.",
  ],
]);

/**
 * Human-readable blurb for a component family, used on family landing pages.
 *
 * @param category - the component category
 * @returns a one-line description, or an empty string when none exists
 */
function getCategoryDescription(category: ComponentCategory): string {
  return categoryDescriptions.get(category) ?? "";
}

/**
 * Canonical site path for a component family. The `ai` family resolves to the
 * curated `/ai` landing; every other family resolves to `/families/<category>`.
 *
 * @param category - the component category
 * @returns the locale-agnostic family path (pass through `localizePathname`)
 */
function familyPath(category: ComponentCategory): string {
  return category === "ai" ? "/ai" : `/families/${category}`;
}

export {
  components,
  familyPath,
  getCategoryDescription,
  getCategoryForComponent,
  groupedComponents,
};
