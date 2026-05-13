/* eslint-disable @typescript-eslint/naming-convention, functional/no-loop-statements, max-lines-per-function */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { isLocale, routing } from "../../../i18n/routing";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

function stripFrontmatter(source: string): string {
  if (!source.startsWith("---")) return source;
  const end = source.indexOf("\n---", 3);
  if (end === -1) return source;
  return source.slice(end + 4).replace(/^\n+/, "");
}

async function readDocumentPage(slug: string): Promise<string> {
  const file = path.join(process.cwd(), "content", "pages", slug, "fr.mdx");
  try {
    const raw = await readFile(file, "utf8");
    return stripFrontmatter(raw).trim();
  } catch {
    return "";
  }
}

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
  url.pathname = "/llms-full.txt";
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

  const pages = [
    { slug: "home", title: "Accueil" },
    { slug: "docs", title: "Documentation" },
    { slug: "philosophy", title: "Philosophie" },
    { slug: "components", title: "Composants" },
  ];
  const lines = [
    "# VLLNT UI - Reference francaise",
    "",
    `> Contexte agent localise. Les schemas de registre restent canoniques sur ${SITE_URL}/r/<name>.json.`,
    "",
  ];

  for (const page of pages) {
    const body = await readDocumentPage(page.slug);
    if (!body) continue;
    lines.push(`## ${page.title}`);
    lines.push("");
    lines.push(body);
    lines.push("");
  }

  return new Response(lines.join("\n"), {
    headers: {
      "Cache-Control":
        "public, max-age=0, s-maxage=86400, stale-while-revalidate=604800",
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
