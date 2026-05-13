/* eslint-disable @typescript-eslint/naming-convention, functional/no-loop-statements, max-lines-per-function */

import { isLocale, routing } from "../../../i18n/routing";
import registry from "../../../registry.json";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

type RegistryItem = {
  readonly description: string;
  readonly name: string;
  readonly title: string;
};

export const dynamic = "force-dynamic";
export const revalidate = 86_400;

type RouteParameters = {
  params: Promise<{ locale: string }>;
};

function redirectToRoot(request: Request): Response {
  const url = new URL(request.url);
  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto");
  if (host) url.host = host;
  if (protocol) url.protocol = `${protocol}:`;
  url.pathname = "/llms.txt";
  return Response.redirect(url, 308);
}

export async function GET(
  request: Request,
  routeParameters: RouteParameters,
): Promise<Response> {
  const { locale } = await routeParameters.params;
  if (!isLocale(locale)) {
    return new Response("Not found", { status: 404 });
  }
  if (locale === routing.defaultLocale) {
    return redirectToRoot(request);
  }

  const items = (registry as { readonly items: readonly RegistryItem[] }).items;
  const lines: string[] = [
    "# VLLNT UI",
    "",
    "> Index francais pour agents. Les endpoints /r/*.json restent canoniques en anglais; les pages humaines existent aussi sous /fr/.",
    "",
    "## Documentation",
    "",
    `- [Accueil](${SITE_URL}/fr): demarrer avec VLLNT UI`,
    `- [Documentation](${SITE_URL}/fr/docs): installation, theming et registre`,
    `- [Composants](${SITE_URL}/fr/components): parcourir les composants`,
    `- [Version anglaise](${SITE_URL}/llms.txt): index canonique`,
    "",
    "## Registre API",
    "",
    `- [Registry index](${SITE_URL}/r/registry.json): liste machine-readable de tous les composants`,
    `- [Sitemap](${SITE_URL}/sitemap.xml): routes publiques avec hreflang`,
    "",
    "## Composants",
    "",
  ];

  for (const item of [...items].sort((a, b) => a.name.localeCompare(b.name))) {
    lines.push(
      `- [${item.title}](${SITE_URL}/fr/components/${item.name}): ${item.description}`,
    );
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
