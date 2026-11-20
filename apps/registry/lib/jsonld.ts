import type { ComponentPlatform } from "@vllnt/ui-core";

import type { Locale } from "@/i18n/routing";
import { canonical } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

type JsonLdValue =
  | boolean
  | null
  | number
  | readonly JsonLdValue[]
  | string
  | { readonly [key: string]: JsonLdValue };

export type JsonLdNode = Readonly<Record<string, JsonLdValue>>;

export type JsonLdScriptAttributes = {
  readonly dangerouslySetInnerHTML: {
    readonly __html: string;
  };
  readonly type: "application/ld+json";
};

export function organizationLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "VLLNT",
    sameAs: ["https://github.com/vllnt", "https://github.com/vllnt/ui"],
    url: SITE_URL,
  };
}

export function websiteLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VLLNT UI",
    publisher: {
      "@type": "Organization",
      name: "VLLNT",
    },
    url: SITE_URL,
  };
}

function getRuntimePlatforms(platforms: readonly ComponentPlatform[]) {
  const runtimes = platforms.map((platform) =>
    platform === "native" ? "React Native" : "React",
  );
  return runtimes.length === 1 ? runtimes.join("") : runtimes;
}

export function softwareSourceCodeLd(component: {
  readonly description: string;
  readonly image?: string;
  readonly keywords?: readonly string[];
  readonly locale: Locale;
  readonly name: string;
  readonly platforms: readonly ComponentPlatform[];
  readonly title: string;
  readonly url?: string;
}): JsonLdNode {
  const url =
    component.url ??
    canonical(`/components/${component.name}`, component.locale);

  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: "https://github.com/vllnt/ui",
    description: component.description,
    ...(component.image ? { image: component.image } : {}),
    ...(component.keywords?.length
      ? { keywords: component.keywords.join(", ") }
      : {}),
    license: "https://opensource.org/license/mit",
    name: component.title,
    programmingLanguage: "TypeScript",
    runtimePlatform: getRuntimePlatforms(component.platforms),
    url,
  };
}

type SoftwareApplicationInput = {
  readonly description: string;
  readonly installCommand?: string;
  readonly name: string;
  readonly operatingSystem?: readonly string[] | string;
  readonly softwareRequirements?: string;
  readonly url: string;
};

export function softwareApplicationLd(
  application: SoftwareApplicationInput,
): JsonLdNode {
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    codeRepository: "https://github.com/vllnt/ui",
    description: application.description,
    name: application.name,
    operatingSystem: application.operatingSystem ?? "Web",
    softwareRequirements:
      application.softwareRequirements ?? "Node.js, pnpm, React, Tailwind CSS",
    url: application.url,
  };
  if (application.installCommand) {
    return {
      ...node,
      potentialAction: {
        "@type": "InstallAction",
        target: application.installCommand,
      },
    };
  }

  return node;
}

/**
 * A BreadcrumbList whose every item and whose list carry a name.
 *
 * Search Console lists a detected BreadcrumbList by its own `name`, and shows
 * "Unnamed item" when the list has none, so the list takes the name of the page
 * it describes (the last crumb). An item without a name is a bug at the call
 * site, so it throws at build time instead of shipping markup Google cannot
 * label.
 *
 * @param trail - crumbs from the site root to the current page
 * @returns The BreadcrumbList node
 * @example
 * breadcrumbLd([{ name: "Home", url: "https://ui.vllnt.com" }]);
 */
export function breadcrumbLd(
  trail: readonly {
    readonly name: string;
    readonly url: string;
  }[],
): JsonLdNode {
  const unnamed = trail.find((step) => step.name.trim() === "");
  if (unnamed) {
    throw new Error(`BreadcrumbList item ${unnamed.url} has no name`);
  }

  const current = trail.at(-1);

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      item: step.url,
      name: step.name,
      position: index + 1,
    })),
    ...(current ? { name: current.name } : {}),
  };
}

/**
 * Locale-aware breadcrumb. Callers pass locale-relative paths; {@link canonical}
 * turns each into an absolute URL that matches the page's own locale canonical
 * (e.g. `/fr/docs`). This helper adds the site root ("Home") as the first crumb.
 * Prefer it over hand-building absolute URLs in a page.
 *
 * @param locale - active request locale
 * @param trail - crumbs after Home, each `{ name, path }` where `path` is
 *   locale-relative (leading slash), e.g. `{ name: "Docs", path: "/docs" }`
 * @param homeName - label for the root crumb. Pass the translated string on a
 *   localized page; defaults to `Home`.
 */
export function breadcrumbTrailLd(
  locale: Locale,
  trail: readonly {
    readonly name: string;
    readonly path: string;
  }[],
  homeName = "Home",
): JsonLdNode {
  return breadcrumbLd([
    { name: homeName, url: canonical("/", locale) },
    ...trail.map((step) => ({
      name: step.name,
      url: canonical(step.path, locale),
    })),
  ]);
}

export function collectionPageLd(page: {
  readonly description: string;
  readonly items: readonly { readonly name: string; readonly url: string }[];
  readonly title: string;
  readonly url: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    description: page.description,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: page.items.map((item, index) => ({
        "@type": "ListItem",
        name: item.name,
        position: index + 1,
        url: item.url,
      })),
      numberOfItems: page.items.length,
    },
    name: page.title,
    url: page.url,
  };
}

function publisherOrganization(): JsonLdNode {
  return { "@type": "Organization", name: "VLLNT", url: SITE_URL };
}

export function techArticleLd(article: {
  readonly dateModified?: string;
  readonly description: string;
  readonly image?: string;
  readonly inLanguage?: string;
  readonly keywords?: readonly string[];
  readonly title: string;
  readonly url: string;
}): JsonLdNode {
  const org = publisherOrganization();
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    about: "React component library documentation",
    author: org,
    description: article.description,
    headline: article.title,
    ...(article.dateModified ? { dateModified: article.dateModified } : {}),
    ...(article.image ? { image: article.image } : {}),
    ...(article.inLanguage ? { inLanguage: article.inLanguage } : {}),
    ...(article.keywords?.length
      ? { keywords: article.keywords.join(", ") }
      : {}),
    mainEntityOfPage: { "@id": article.url, "@type": "WebPage" },
    programmingLanguage: "TypeScript",
    publisher: org,
    url: article.url,
  };
}

/**
 * The `Article` node of a page in `/articles`.
 *
 * @param article - the page's headline, dates, language, image and URL
 * @returns The Article node
 * @example
 * articleLd({ dateModified: "2026-11-21", datePublished: "2026-11-20", ... });
 */
export function articleLd(article: {
  readonly dateModified: string;
  readonly datePublished: string;
  readonly description: string;
  readonly image: string;
  readonly inLanguage: string;
  readonly keywords?: readonly string[];
  readonly title: string;
  readonly url: string;
}): JsonLdNode {
  const org = publisherOrganization();
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    author: org,
    dateModified: article.dateModified,
    datePublished: article.datePublished,
    description: article.description,
    headline: article.title,
    image: article.image,
    inLanguage: article.inLanguage,
    ...(article.keywords?.length
      ? { keywords: article.keywords.join(", ") }
      : {}),
    mainEntityOfPage: { "@id": article.url, "@type": "WebPage" },
    publisher: org,
    url: article.url,
  };
}

export function faqPageLd(
  entries: readonly {
    readonly answer: string;
    readonly question: string;
  }[],
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
      name: entry.question,
    })),
  };
}

function isJsonLdNodeList(
  node: JsonLdNode | readonly JsonLdNode[],
): node is readonly JsonLdNode[] {
  return Array.isArray(node);
}

function jsonLdDocument(node: JsonLdNode | readonly JsonLdNode[]): JsonLdNode {
  if (!isJsonLdNodeList(node)) return node;

  const graph = node.map((entry) =>
    Object.fromEntries(
      Object.entries(entry).filter(([key]) => key !== "@context"),
    ),
  ) as JsonLdNode[];

  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}

export function jsonLdScript(node: JsonLdNode | readonly JsonLdNode[]): string {
  return JSON.stringify(jsonLdDocument(node)).replaceAll("<", "\\u003c");
}

export function jsonLdScriptAttributes(
  node: JsonLdNode | readonly JsonLdNode[],
): JsonLdScriptAttributes {
  return {
    dangerouslySetInnerHTML: { __html: jsonLdScript(node) },
    type: "application/ld+json",
  };
}
