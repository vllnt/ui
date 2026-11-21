import {
  generateLlmsText,
  type LlmsFullPage,
  type LlmsLink,
  type LlmsSection,
} from "@vllnt/next-llms";

import { defaultLocale } from "@/i18n/locales";
import { articleFeedUrl } from "@/lib/article-feed";
import {
  type Article,
  articleBody,
  articleUrl,
  getPublishedArticles,
} from "@/lib/articles";
import { registry, type RegistryComponent } from "@/lib/registry";

import { DOCS_PAGES, getDocsPath } from "./docs-pages";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

const CATEGORY_ORDER: readonly string[] = [
  "core",
  "form",
  "navigation",
  "overlay",
  "data",
  "data-display",
  "content",
  "ai",
  "educational",
  "learning",
  "billing",
  "utility",
];

const CATEGORY_LABEL = new Map<string, string>([
  ["ai", "AI"],
  ["billing", "Billing & Plans"],
  ["content", "Content"],
  ["core", "Core primitives"],
  ["data", "Data"],
  ["data-display", "Data display"],
  ["educational", "Educational"],
  ["form", "Form"],
  ["learning", "Learning"],
  ["navigation", "Navigation"],
  ["overlay", "Overlay"],
  ["utility", "Utility"],
]);

const INSTALL_DETAILS = [
  "Web: install a component with the shadcn CLI: " +
    `\`pnpm dlx shadcn@latest add ${SITE_URL}/r/<name>.json\`.`,
  "Native is experimental and currently available from repository source only. The planned `pnpm add @vllnt/ui-native@canary` command becomes valid after the first synchronized canary is published. Check `/r/native/registry.json` first.",
].join(" ");

const DOCS_SECTION: LlmsSection = {
  links: [
    {
      notes: "install and use any component",
      title: "Get Started",
      url: `${SITE_URL}/`,
    },
    {
      notes: "theming, registry usage, conventions",
      title: "Documentation",
      url: `${SITE_URL}/docs`,
    },
    // The Changelog entry below already lists /changelog, where this page lives.
    ...DOCS_PAGES.filter((page) => page.slug !== "changelog").map((page) => ({
      notes: page.description,
      title: page.title,
      url: `${SITE_URL}${getDocsPath(page)}`,
    })),
    {
      notes: "design principles and component patterns",
      title: "Philosophy",
      url: `${SITE_URL}/philosophy`,
    },
    {
      notes: "brand, tokens, accessibility, and UI rules",
      title: "Design guide",
      url: `${SITE_URL}/design`,
    },
    {
      notes: "browse all components by category",
      title: "Components index",
      url: `${SITE_URL}/components`,
    },
    {
      notes:
        "React Native support in 0.4.0; source-only until canary publication",
      title: "React Native component catalog",
      url: `${SITE_URL}/components?platform=native`,
    },
    {
      notes: "starter kits for full VLLNT UI apps",
      title: "Templates",
      url: `${SITE_URL}/templates`,
    },
    {
      notes: "canonical Keep a Changelog release history",
      title: "Changelog",
      url: `${SITE_URL}/changelog`,
    },
    {
      notes: "versioned release cards, GitHub notes, and RSS links",
      title: "Releases",
      url: `${SITE_URL}/releases`,
    },
    {
      notes: "release feed for notification and agent polling",
      title: "RSS feed",
      url: `${SITE_URL}/rss.xml`,
    },
  ],
  title: "Docs",
};

const REGISTRY_SECTION: LlmsSection = {
  links: [
    {
      notes: "full machine-readable list of all components",
      title: "Registry index",
      url: `${SITE_URL}/r/registry.json`,
    },
    {
      notes:
        "native renderer status, requirements, source, and supported components",
      title: "Native renderer manifest",
      url: `${SITE_URL}/r/native/registry.json`,
    },
    {
      notes: "machine-readable VLLNT UI token contract",
      title: "Design tokens",
      url: `${SITE_URL}/r/design.json`,
    },
    {
      notes: "canonical brand and design rules as raw markdown",
      title: "Design guide (raw)",
      url: `${SITE_URL}/DESIGN.md`,
    },
    {
      notes: "every public route, refreshed per deploy",
      title: "Sitemap",
      url: `${SITE_URL}/sitemap.xml`,
    },
  ],
  title: "Registry API",
};

function getRegistryComponents(): readonly RegistryComponent[] {
  return registry.items;
}

function groupItems(
  items: readonly RegistryComponent[],
): ReadonlyMap<string, readonly RegistryComponent[]> {
  return items.reduce((groups, item) => {
    const category = item.category ?? "utility";
    const bucket = groups.get(category) ?? [];
    groups.set(category, [...bucket, item]);
    return groups;
  }, new Map<string, readonly RegistryComponent[]>());
}

function getSortedCategories(
  grouped: ReadonlyMap<string, readonly RegistryComponent[]>,
): readonly string[] {
  return [
    ...CATEGORY_ORDER.filter((category) => grouped.has(category)),
    ...[...grouped.keys()]
      .filter((category) => !CATEGORY_ORDER.includes(category))
      .sort(),
  ];
}

function buildSummary(items: readonly RegistryComponent[]): string {
  return (
    "Agent-first, platform-aware component registry. " +
    `${items.length} accessible descriptors for the stable web renderer and experimental React Native renderer. ` +
    "Inspect each item's platforms before choosing an install path."
  );
}

function buildComponentSections(
  items: readonly RegistryComponent[],
): readonly LlmsSection[] {
  const grouped = groupItems(items);
  return getSortedCategories(grouped).flatMap((category) => {
    const bucket = grouped.get(category);
    if (!bucket || bucket.length === 0) return [];
    const label = CATEGORY_LABEL.get(category) ?? category;
    const links: LlmsLink[] = [...bucket]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        notes: `${item.description ?? ""} Platforms: ${item.platforms.join(", ")}.`,
        title: item.title,
        url: `${SITE_URL}/components/${item.name}`,
      }));
    return [{ links, title: `Components - ${label}` }];
  });
}

function buildNativeSection(items: readonly RegistryComponent[]): LlmsSection {
  return {
    links: items
      .filter((item) => item.platforms.includes("native"))
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((item) => ({
        notes: `${item.description ?? ""} Experimental ${item.native?.compatibility ?? "native-adapted"} renderer; ${item.native?.availability ?? "source"} availability.`,
        title: item.title,
        url: `${SITE_URL}/components/${item.name}`,
      })),
    title: "React Native components - Experimental",
  };
}

/**
 * The `Articles` section of `llms.txt`: each article of the default locale with
 * its title, URL and description, then its feed. Empty when there is no
 * article, so a site without articles lists nothing. Drafts never reach it,
 * because {@link getPublishedArticles} does not return them.
 *
 * @param articles - published articles, every locale
 * @returns The section, or no section
 */
export function buildArticlesSection(
  articles: readonly Article[],
): readonly LlmsSection[] {
  const listed = articles.filter((article) => article.locale === defaultLocale);
  if (listed.length === 0) return [];

  return [
    {
      links: [
        ...listed.map((article) => ({
          notes: article.frontmatter.description,
          title: article.frontmatter.title,
          url: articleUrl(article),
        })),
        {
          notes: "articles feed for notification and agent polling",
          title: "Articles RSS feed",
          url: articleFeedUrl(defaultLocale, "rss"),
        },
      ],
      title: "Articles",
    },
  ];
}

/**
 * The articles of `llms-full.txt`: the default locale's articles, each with its
 * description and its markdown body. Drafts never reach it.
 *
 * @param articles - published articles, every locale
 * @returns One page per article, in the order given
 */
export function buildArticlePages(
  articles: readonly Article[],
): readonly LlmsFullPage[] {
  return articles
    .filter((article) => article.locale === defaultLocale)
    .map((article) => ({
      content: [
        article.frontmatter.description,
        "",
        articleBody(article).trim(),
      ].join("\n"),
      title: article.frontmatter.title,
      url: articleUrl(article),
    }));
}

/**
 * The site summary for agents: docs, articles, registry endpoints and every
 * component, as markdown. Served as `/llms.txt` and as the home page's markdown
 * twin.
 *
 * @param articles - published articles; every published article by default
 * @returns The llms.txt document
 */
export async function buildLlmsTxt(
  articles?: readonly Article[],
): Promise<string> {
  const items = getRegistryComponents();
  const published = articles ?? (await getPublishedArticles());

  return generateLlmsText({
    details: INSTALL_DETAILS,
    sections: [
      DOCS_SECTION,
      ...buildArticlesSection(published),
      REGISTRY_SECTION,
      ...buildComponentSections(items),
      buildNativeSection(items),
    ],
    summary: buildSummary(items),
    title: "VLLNT UI",
  });
}
