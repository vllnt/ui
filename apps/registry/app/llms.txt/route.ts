import registry from "../../registry.json";
import {
  getTemplateInstallCommand,
  getTemplatePath,
  TEMPLATES,
} from "../../lib/templates";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

type RegistryItem = {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly category: string;
};

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

const CATEGORY_LABEL: Record<string, string> = {
  ai: "AI",
  billing: "Billing & Plans",
  content: "Content",
  core: "Core primitives",
  data: "Data",
  "data-display": "Data display",
  educational: "Educational",
  form: "Form",
  learning: "Learning",
  navigation: "Navigation",
  overlay: "Overlay",
  utility: "Utility",
};

function buildLlmsTxt(): string {
  const items = (registry as { readonly items: readonly RegistryItem[] }).items;

  const grouped = new Map<string, RegistryItem[]>();
  for (const item of items) {
    const bucket = grouped.get(item.category) ?? [];
    bucket.push(item);
    grouped.set(item.category, bucket);
  }

  const sortedCategories = [
    ...CATEGORY_ORDER.filter((c) => grouped.has(c)),
    ...[...grouped.keys()]
      .filter((c) => !CATEGORY_ORDER.includes(c))
      .sort(),
  ];

  const lines: string[] = [];

  lines.push("# VLLNT UI");
  lines.push("");
  lines.push(
    "> Agent-first React component registry. " +
      `${items.length} accessible components built on Radix UI, Tailwind CSS, and CVA. ` +
      "Install via the shadcn CLI against any /r/<name>.json endpoint.",
  );
  lines.push("");

  lines.push("## Docs");
  lines.push("");
  lines.push(`- [Get Started](${SITE_URL}/): install and use any component`);
  lines.push(
    `- [Documentation](${SITE_URL}/docs): theming, registry usage, conventions`,
  );
  lines.push(
    `- [Philosophy](${SITE_URL}/philosophy): design principles and component patterns`,
  );
  lines.push(
    `- [Components index](${SITE_URL}/components): browse all components by category`,
  );
  lines.push(
    `- [Templates](${SITE_URL}/templates): starter kits for full VLLNT UI apps`,
  );
  lines.push("");

  lines.push("## Templates");
  lines.push("");
  for (const template of TEMPLATES) {
    lines.push(
      `- [${template.title}](${SITE_URL}${getTemplatePath(template)}): ` +
        `${template.description} Install: \`${getTemplateInstallCommand(template)}\``,
    );
  }
  lines.push("");

  lines.push("## Registry API");
  lines.push("");
  lines.push(
    `- [Registry index](${SITE_URL}/r/registry.json): full machine-readable list of all components`,
  );
  lines.push(
    `- [Sitemap](${SITE_URL}/sitemap.xml): every public route, refreshed per deploy`,
  );
  lines.push(
    "- Install command: `pnpm dlx shadcn@latest add " +
      `${SITE_URL}/r/<name>.json` +
      "`",
  );
  lines.push("");

  for (const category of sortedCategories) {
    const bucket = grouped.get(category);
    if (!bucket || bucket.length === 0) continue;
    const label = CATEGORY_LABEL[category] ?? category;
    lines.push(`## Components — ${label}`);
    lines.push("");
    for (const item of [...bucket].sort((a, b) => a.name.localeCompare(b.name))) {
      lines.push(
        `- [${item.title}](${SITE_URL}/components/${item.name}): ${item.description}`,
      );
    }
    lines.push("");
  }

  return lines.join("\n");
}

export const dynamic = "force-static";
export const revalidate = 86400;

export function GET(): Response {
  return new Response(buildLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
