import { SITE_URL } from "@/lib/seo";

const GITHUB_REPO_URL = "https://github.com/vllnt/ui";

export type Template = {
  readonly audience: string;
  readonly components: readonly string[];
  readonly demoUrl: string;
  readonly description: string;
  readonly githubPath: string;
  readonly highlights: readonly string[];
  readonly pages: readonly string[];
  readonly screenshot: string;
  readonly slug: string;
  readonly stack: readonly string[];
  readonly title: string;
};

export const TEMPLATES: readonly Template[] = [
  {
    audience: "Teams starting a production App Router project.",
    components: [
      "button",
      "card",
      "form",
      "input",
      "tabs",
      "navbar-saas",
      "theme-provider",
    ],
    demoUrl: `${SITE_URL}/templates/next-starter`,
    description:
      "App Router starter with auth-ready routes, theming, and five example pages wired around VLLNT UI primitives.",
    githubPath: "templates/next-starter",
    highlights: [
      "App Router shell with marketing, app, account, settings, and billing routes.",
      "Auth-ready layout boundaries without provider lock-in.",
      "Theme tokens and reusable primitives already connected.",
    ],
    pages: ["Home", "Dashboard", "Account", "Settings", "Billing"],
    screenshot: "/template-screenshots/next-starter.svg",
    slug: "next-starter",
    stack: ["Next.js", "React", "Tailwind CSS", "Radix UI"],
    title: "Next Starter",
  },
  {
    audience: "Internal tools, ops consoles, and product analytics surfaces.",
    components: [
      "activity-log",
      "area-chart",
      "bar-chart",
      "button",
      "calendar",
      "card",
      "category-filter",
      "checkbox",
      "command",
      "data-list",
      "data-table",
      "date-picker",
      "dropdown-menu",
      "filter-bar",
      "line-chart",
      "metric-cluster",
      "metric-gauge",
      "pagination",
      "popover",
      "progress-bar",
      "scroll-area",
      "select",
      "sidebar",
      "stat-card",
      "status-board",
      "status-indicator",
      "table",
      "tabs",
      "toast",
      "tooltip",
      "view-switcher",
      "workspace-switcher",
    ],
    demoUrl: `${SITE_URL}/templates/dashboard`,
    description:
      "Dense dashboard kit with sidebar navigation, filters, data tables, chart panels, and status-heavy operational views.",
    githubPath: "templates/dashboard",
    highlights: [
      "Thirty plus component references for realistic admin workflows.",
      "Responsive sidebar, table, chart, and status board composition.",
      "Seeded dashboard pages for overview, reports, users, and settings.",
    ],
    pages: ["Overview", "Reports", "Users", "Operations", "Settings"],
    screenshot: "/template-screenshots/dashboard.svg",
    slug: "dashboard",
    stack: ["Next.js", "React", "Tailwind CSS", "VLLNT charts"],
    title: "Dashboard",
  },
  {
    audience: "SaaS products that need marketing plus authenticated app UI.",
    components: [
      "badge",
      "banner",
      "button",
      "card",
      "dialog",
      "form",
      "input",
      "navbar-saas",
      "pricing-table",
      "profile-section",
      "subscription-card",
      "tabs",
      "toast",
    ],
    demoUrl: `${SITE_URL}/templates/saas`,
    description:
      "SaaS kit with landing sections, pricing, auth entry points, account billing, and a dashboard shell.",
    githubPath: "templates/saas",
    highlights: [
      "Marketing, pricing, auth, onboarding, and dashboard routes.",
      "PricingTable and SubscriptionCard composed with app shell primitives.",
      "Conversion-focused copy blocks without a dependency on a backend.",
    ],
    pages: ["Landing", "Pricing", "Sign in", "Onboarding", "Dashboard"],
    screenshot: "/template-screenshots/saas.svg",
    slug: "saas",
    stack: ["Next.js", "React", "Tailwind CSS", "CVA"],
    title: "SaaS",
  },
  {
    audience: "AI products, chat surfaces, agent consoles, and assistants.",
    components: [
      "ai-artifact",
      "ai-chat-input",
      "ai-message-bubble",
      "ai-sidebar",
      "ai-source-citation",
      "ai-streaming-text",
      "ai-tool-call-display",
      "prompt-templates",
    ],
    demoUrl: `${SITE_URL}/templates/ai-chat`,
    description:
      "AI chat starter with conversation state, artifacts, citations, tool calls, prompt templates, and an assistant sidebar.",
    githubPath: "templates/ai-chat",
    highlights: [
      "Uses the AI component family as the primary application surface.",
      "Structured message, artifact, citation, and tool-call sections.",
      "Prompt template rail for repeatable assistant workflows.",
    ],
    pages: ["Chat", "Artifacts", "Sources", "Prompts", "Settings"],
    screenshot: "/template-screenshots/ai-chat.svg",
    slug: "ai-chat",
    stack: ["Next.js", "React", "Tailwind CSS", "AI components"],
    title: "AI Chat",
  },
  {
    audience: "Library authors and teams publishing component documentation.",
    components: [
      "accordion",
      "breadcrumb",
      "callout",
      "code-block",
      "copy-button",
      "document-sibling-nav",
      "mdx-content",
      "navigation-menu",
      "search-dialog",
      "sidebar",
      "table-of-contents",
      "tabs",
    ],
    demoUrl: `${SITE_URL}/templates/docs-site`,
    description:
      "Documentation site kit for libraries that want VLLNT-style docs, navigation, search, code samples, and component pages.",
    githubPath: "templates/docs-site",
    highlights: [
      "MDX-first content model with sidebar and table of contents.",
      "Component reference pages with install snippets and code blocks.",
      "Search and sibling navigation patterns for documentation depth.",
    ],
    pages: ["Docs home", "Guide", "Components", "Reference", "Changelog"],
    screenshot: "/template-screenshots/docs-site.svg",
    slug: "docs-site",
    stack: ["Next.js", "MDX", "React", "Tailwind CSS"],
    title: "Docs Site",
  },
];

export function getTemplate(slug: string): Template | undefined {
  return TEMPLATES.find((template) => template.slug === slug);
}

export function getTemplatePath(template: Template): string {
  return `/templates/${template.slug}`;
}

export function getTemplateGithubUrl(template: Template): string {
  return `${GITHUB_REPO_URL}/tree/main/${template.githubPath}`;
}
