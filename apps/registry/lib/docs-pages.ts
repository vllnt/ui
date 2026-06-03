export type DocsPage = {
  readonly description: string;
  readonly slug: string;
  readonly title: string;
};

export const DOCS_PAGES: readonly DocsPage[] = [
  {
    description:
      "Install VLLNT UI with pnpm, Tailwind CSS, the shadcn CLI, and your first registry component.",
    slug: "installation",
    title: "Installation",
  },
  {
    description:
      "Use the shadcn CLI with VLLNT UI registry URLs, aliases, and repeatable team workflows.",
    slug: "cli",
    title: "CLI",
  },
  {
    description:
      "Customize design tokens, CSS variables, dark mode, and local themes for VLLNT UI.",
    slug: "theming",
    title: "Theming",
  },
  {
    description:
      "Understand the /r/registry.json schema and how to build a compatible registry surface.",
    slug: "registry",
    title: "Registry",
  },
  {
    description:
      "Learn component anatomy, accessibility expectations, composition patterns, and test coverage.",
    slug: "components",
    title: "Components",
  },
  {
    description:
      "Use llms.txt, llms-full.txt, MCP, and registry JSON from AI coding agents.",
    slug: "agents",
    title: "Agents",
  },
  {
    description:
      "Set up the repository, run the dev loop, follow story conventions, and prepare PRs.",
    slug: "contributing",
    title: "Contributing",
  },
  {
    description:
      "Track release notes from CHANGELOG.md and the package changelog for each published version.",
    slug: "changelog",
    title: "Changelog",
  },
  {
    description:
      "Answers to common questions about licensing, peer dependencies, RSC, Tailwind, and support.",
    slug: "faq",
    title: "FAQ",
  },
];

export function getDocsPage(slug: string): DocsPage | undefined {
  return DOCS_PAGES.find((page) => page.slug === slug);
}

export function getDocsPath(page: DocsPage): string {
  return `/docs/${page.slug}`;
}
