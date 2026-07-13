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

type JsonLdNode = Readonly<Record<string, JsonLdValue>>;

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

export function softwareSourceCodeLd(component: {
  readonly description: string;
  readonly locale: Locale;
  readonly name: string;
  readonly title: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    codeRepository: "https://github.com/vllnt/ui",
    description: component.description,
    license: "https://opensource.org/license/mit",
    name: component.title,
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
    url: canonical(`/components/${component.name}`, component.locale),
  };
}

export function softwareApplicationLd(application: {
  readonly description: string;
  readonly installCommand?: string;
  readonly name: string;
  readonly url: string;
}): JsonLdNode {
  const node: JsonLdNode = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    applicationCategory: "DeveloperApplication",
    codeRepository: "https://github.com/vllnt/ui",
    description: application.description,
    name: application.name,
    operatingSystem: "Web",
    softwareRequirements: "Node.js, pnpm, React, Tailwind CSS",
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

export function breadcrumbLd(
  trail: readonly {
    readonly name: string;
    readonly url: string;
  }[],
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      item: step.url,
      name: step.name,
      position: index + 1,
    })),
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
 */
export function breadcrumbTrailLd(
  locale: Locale,
  trail: readonly {
    readonly name: string;
    readonly path: string;
  }[],
): JsonLdNode {
  return breadcrumbLd([
    { name: "Home", url: canonical("/", locale) },
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

export function techArticleLd(article: {
  readonly description: string;
  readonly title: string;
  readonly url: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    about: "React component library documentation",
    author: {
      "@type": "Organization",
      name: "VLLNT",
      url: SITE_URL,
    },
    description: article.description,
    headline: article.title,
    programmingLanguage: "TypeScript",
    publisher: {
      "@type": "Organization",
      name: "VLLNT",
      url: SITE_URL,
    },
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

export function jsonLdScript(node: JsonLdNode | readonly JsonLdNode[]): string {
  return JSON.stringify(node).replaceAll("<", "\\u003c");
}

export function jsonLdScriptAttributes(
  node: JsonLdNode | readonly JsonLdNode[],
): JsonLdScriptAttributes {
  return {
    dangerouslySetInnerHTML: { __html: jsonLdScript(node) },
    type: "application/ld+json",
  };
}
