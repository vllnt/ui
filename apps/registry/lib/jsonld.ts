const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonLdValue[]
  | { readonly [key: string]: JsonLdValue };

type JsonLdNode = { readonly [key: string]: JsonLdValue };

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
    url: SITE_URL,
    sameAs: ["https://github.com/vllnt", "https://github.com/vllnt/ui"],
  };
}

export function websiteLd(): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "VLLNT UI",
    url: SITE_URL,
    publisher: {
      "@type": "Organization",
      name: "VLLNT",
    },
  };
}

export function softwareSourceCodeLd(component: {
  readonly name: string;
  readonly title: string;
  readonly description: string;
}): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareSourceCode",
    name: component.title,
    description: component.description,
    codeRepository: "https://github.com/vllnt/ui",
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
    license: "https://opensource.org/license/mit",
    url: `${SITE_URL}/components/${component.name}`,
  };
}

export function breadcrumbLd(trail: ReadonlyArray<{
  readonly name: string;
  readonly url: string;
}>): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((step, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: step.name,
      item: step.url,
    })),
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
    headline: article.title,
    description: article.description,
    url: article.url,
    author: {
      "@type": "Organization",
      name: "VLLNT",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: "VLLNT",
      url: SITE_URL,
    },
    programmingLanguage: "TypeScript",
    about: "React component library documentation",
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
