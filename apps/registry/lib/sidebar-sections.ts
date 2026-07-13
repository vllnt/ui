import { getTranslations } from "next-intl/server";

import { type Locale, routing } from "@/i18n/routing";
import { familyPath, groupedComponents } from "@/lib/component-categories";
import { getPageContent } from "@/lib/content";
import { DOCS_PAGES, getDocsPath } from "@/lib/docs-pages";
import { localizePathname } from "@/lib/seo";
import type { ComponentCategory } from "@/types/registry";

/**
 * Docs entries take their label from the localized MDX frontmatter, so the
 * sidebar and the docs index always name a page the same way in every locale.
 */
async function getDocsItems(locale: Locale) {
  return Promise.all(
    DOCS_PAGES.map(async (page) => {
      const content = await getPageContent(`docs/${page.slug}`, locale);

      return {
        href: localizePathname(getDocsPath(page), locale),
        title: content.frontmatter.title,
      };
    }),
  );
}

export async function getSidebarSections(
  _activeCategory?: ComponentCategory,
  locale: Locale = routing.defaultLocale,
) {
  const t = await getTranslations({ locale, namespace: "sidebar" });
  const docsItems = await getDocsItems(locale);

  return [
    {
      items: [
        { href: localizePathname("/", locale), title: t("getStarted") },
        {
          href: localizePathname("/philosophy", locale),
          title: t("philosophy"),
        },
        {
          href: localizePathname("/components", locale),
          title: t("components"),
        },
        { href: localizePathname("/templates", locale), title: t("templates") },
        { href: localizePathname("/themes", locale), title: t("themes") },
        {
          href: localizePathname("/request-component", locale),
          title: t("requestComponent"),
        },
      ],
    },
    {
      collapsible: true,
      defaultOpen: true,
      items: [
        { href: localizePathname("/docs", locale), title: t("overview") },
        ...docsItems,
      ],
      title: t("documentation"),
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
