import { type Locale, routing } from "@/i18n/routing";
import { familyPath, groupedComponents } from "@/lib/component-categories";
import { DOCS_PAGES, getDocsPath } from "@/lib/docs-pages";
import { localizePathname } from "@/lib/seo";
import type { ComponentCategory } from "@/types/registry";

export function getSidebarSections(
  _activeCategory?: ComponentCategory,
  locale: Locale = routing.defaultLocale,
) {
  return [
    {
      items: [
        { href: localizePathname("/", locale), title: "Get Started" },
        {
          href: localizePathname("/philosophy", locale),
          title: "Philosophy",
        },
        {
          href: localizePathname("/components", locale),
          title: "Components",
        },
        { href: localizePathname("/templates", locale), title: "Templates" },
        { href: localizePathname("/themes", locale), title: "Themes" },
        {
          href: localizePathname("/request-component", locale),
          title: "Request a component",
        },
      ],
    },
    {
      collapsible: true,
      defaultOpen: true,
      items: [
        { href: localizePathname("/docs", locale), title: "Overview" },
        ...DOCS_PAGES.map((page) => ({
          href: localizePathname(getDocsPath(page), locale),
          title: page.title,
        })),
      ],
      title: "Documentation",
    },
    ...groupedComponents.map((group) => ({
      family: true,
      href: localizePathname(familyPath(group.category), locale),
      items: group.items.map((item) => ({
        href: localizePathname(`/components/${item.name}`, locale),
        title: item.title,
      })),
      title: group.label,
    })),
  ];
}

export {
  components,
  familyPath,
  getCategoryDescription,
  getCategoryForComponent,
  groupedComponents,
} from "@/lib/component-categories";
