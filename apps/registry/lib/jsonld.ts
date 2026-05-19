const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

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
    url: `${SITE_URL}/components/${component.name}`,
  };
}

export function itemListLd(
  items: readonly {
    readonly name: string;
    readonly title: string;
  }[],
): JsonLdNode {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      name: item.title,
      position: index + 1,
      url: `${SITE_URL}/components/${item.name}`,
    })),
    name: "VLLNT UI Components",
    numberOfItems: items.length,
  };
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
