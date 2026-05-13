/* eslint-disable @typescript-eslint/naming-convention, max-lines-per-function */

import { type Locale, routing } from "@/i18n/routing";
import { localizePathname } from "@/lib/seo";
import registryData from "@/registry.json";
import type {
  ComponentCategory,
  Registry,
  RegistryComponent,
} from "@/types/registry";

const registry = registryData as Registry;

type SidebarComponent = {
  readonly category?: ComponentCategory;
  readonly description?: string;
  readonly descriptions?: Partial<Record<string, string>>;
  readonly name: string;
  readonly title: string;
};

const components = registry.items
  .filter(
    (item): item is RegistryComponent => item.type === "registry:component",
  )
  .map((item) => ({
    category: item.category,
    description: item.description,
    descriptions: item.descriptions,
    name: item.name,
    title: item.title,
  }))
  .sort((a, b) => a.title.localeCompare(b.title));

const categoryLabels: Record<Locale, Record<ComponentCategory, string>> = {
  en: {
    ai: "AI",
    billing: "Billing",
    content: "Content",
    core: "Core",
    data: "Data",
    "data-display": "Data display",
    educational: "Educational",
    form: "Form",
    learning: "Learning",
    navigation: "Navigation",
    overlay: "Overlay",
    utility: "Utility",
  },
  fr: {
    ai: "IA",
    billing: "Facturation",
    content: "Contenu",
    core: "Base",
    data: "Donnees",
    "data-display": "Affichage donnees",
    educational: "Education",
    form: "Formulaires",
    learning: "Apprentissage",
    navigation: "Navigation",
    overlay: "Surcouches",
    utility: "Utilitaires",
  },
};

const fallbackCategoryLabels: Record<ComponentCategory, string> = {
  ai: "AI",
  billing: "Billing",
  content: "Content",
  core: "Core",
  data: "Data",
  "data-display": "Data display",
  educational: "Educational",
  form: "Form",
  learning: "Learning",
  navigation: "Navigation",
  overlay: "Overlay",
  utility: "Utility",
};

const navLabels: Record<
  Locale,
  { components: string; getStarted: string; philosophy: string }
> = {
  en: {
    components: "Components",
    getStarted: "Get Started",
    philosophy: "Philosophy",
  },
  fr: {
    components: "Composants",
    getStarted: "Demarrer",
    philosophy: "Philosophie",
  },
};

const categoryOrder: ComponentCategory[] = [
  "ai",
  "core",
  "form",
  "overlay",
  "navigation",
  "data",
  "data-display",
  "content",
  "educational",
  "learning",
  "billing",
  "utility",
];

function groupComponentsByCategory(
  items: SidebarComponent[],
  locale: Locale = routing.defaultLocale,
) {
  const grouped = items.reduce((accumulator, item) => {
    const category = item.category ?? "utility";
    const existing = accumulator.get(category) ?? [];
    accumulator.set(category, [
      ...existing,
      {
        description: item.description,
        descriptions: item.descriptions,
        name: item.name,
        title: item.title,
      },
    ]);
    return accumulator;
  }, new Map<ComponentCategory, SidebarComponent[]>());

  return categoryOrder
    .filter((cat) => grouped.has(cat))
    .map((category) => ({
      category,
      items: grouped.get(category) ?? [],
      label:
        categoryLabels[locale][category] ??
        fallbackCategoryLabels[category] ??
        category,
    }));
}

const groupedComponents = groupComponentsByCategory(components);

export function getGroupedComponents(locale: Locale = routing.defaultLocale) {
  return groupComponentsByCategory(components, locale);
}

export function getSidebarSections(
  _activeCategory?: ComponentCategory,
  locale: Locale = routing.defaultLocale,
) {
  return [
    {
      items: [
        {
          href: localizePathname("/", locale),
          title: navLabels[locale].getStarted,
        },
        {
          href: localizePathname("/philosophy", locale),
          title: navLabels[locale].philosophy,
        },
        {
          href: localizePathname("/components", locale),
          title: navLabels[locale].components,
        },
      ],
    },
    ...groupComponentsByCategory(components, locale).map((group) => ({
      collapsible: true,
      defaultOpen: true,
      items: group.items.map((item) => ({
        href: localizePathname(`/components/${item.name}`, locale),
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
