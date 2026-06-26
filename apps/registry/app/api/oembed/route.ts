import type { NextRequest } from "next/server";
import { z } from "zod";

import componentMetadata from "@/lib/component-metadata.json";
import { registry } from "@/lib/registry";
import {
  buildEmbedSnippet,
  EMBED_DEFAULT_HEIGHT,
  EMBED_DEFAULT_WIDTH,
  SITE_URL,
} from "@/lib/share";
import type { RegistryComponent } from "@/types/registry";

const metadataMap = componentMetadata as Record<
  string,
  { category?: string; description?: string; title?: string }
>;

const querySchema = z.object({
  format: z.enum(["json", "xml"]).default("json"),
  maxheight: z.coerce.number().int().positive().max(2000).optional(),
  maxwidth: z.coerce.number().int().positive().max(2000).optional(),
  url: z.url(),
});

const COMPONENT_PATH = /\/components\/([^#/?]+)/;

const JSON_HEADERS = {
  "access-control-allow-origin": "*",
  "cache-control": "public, max-age=3600, s-maxage=86400",
  "content-type": "application/json; charset=utf-8",
} as const;

function slugFromUrl(pageUrl: string): string | undefined {
  try {
    const parsed = new URL(pageUrl);
    if (parsed.origin !== new URL(SITE_URL).origin) {
      return undefined;
    }
    return COMPONENT_PATH.exec(parsed.pathname)?.[1];
  } catch {
    return undefined;
  }
}

function findComponent(slug: string): RegistryComponent | undefined {
  return registry.items.find(
    (item): item is RegistryComponent =>
      item.name === slug && item.type === "registry:component",
  );
}

function buildThumbnailUrl(input: {
  category?: string;
  description: string;
  slug: string;
  title: string;
}): string {
  const url = new URL("/api/og", SITE_URL);
  url.searchParams.set("title", input.title);
  url.searchParams.set("type", "component");
  if (input.description) {
    url.searchParams.set("description", input.description);
  }
  if (input.category) {
    url.searchParams.set("category", input.category);
  }
  url.searchParams.set("url", `ui.vllnt.ai/components/${input.slug}`);
  return url.toString();
}

function buildPayload(
  slug: string,
  component: RegistryComponent,
  size: { height: number; width: number },
): Record<string, unknown> {
  const meta = metadataMap[slug];
  const title = meta?.title ?? component.title ?? slug;
  const description = meta?.description ?? component.description ?? "";
  const { height, width } = size;

  return {
    author_name: "VLLNT UI",
    author_url: SITE_URL,
    height,
    html: buildEmbedSnippet(slug, title, { height, ref: "oembed", width }),
    provider_name: "VLLNT UI",
    provider_url: SITE_URL,
    thumbnail_height: 1260,
    thumbnail_url: buildThumbnailUrl({
      category: meta?.category,
      description,
      slug,
      title,
    }),
    thumbnail_width: 2400,
    title,
    type: "rich",
    version: "1.0",
    width,
  };
}

/**
 * oEmbed provider endpoint (https://oembed.com). Lets WordPress, Ghost,
 * Discourse, dev.to, and similar tools auto-unfurl any
 * `ui.vllnt.ai/components/*` URL into a rich embed. The returned `html`
 * carries the live-preview iframe and a caption anchor — that anchor lands in
 * the host's DOM and becomes the backlink.
 */
export function GET(request: NextRequest): Response {
  const parsed = querySchema.safeParse(
    Object.fromEntries(request.nextUrl.searchParams),
  );

  if (!parsed.success) {
    return Response.json(
      { error: "Invalid oEmbed request" },
      { headers: JSON_HEADERS, status: 400 },
    );
  }

  if (parsed.data.format === "xml") {
    return Response.json(
      { error: "Only json format is supported" },
      { headers: JSON_HEADERS, status: 501 },
    );
  }

  const slug = slugFromUrl(parsed.data.url);
  const component = slug ? findComponent(slug) : undefined;

  if (!slug || !component) {
    return Response.json(
      { error: "No embeddable component for that URL" },
      { headers: JSON_HEADERS, status: 404 },
    );
  }

  const width = Math.min(parsed.data.maxwidth ?? EMBED_DEFAULT_WIDTH, 2000);
  const height = Math.min(parsed.data.maxheight ?? EMBED_DEFAULT_HEIGHT, 2000);

  return Response.json(buildPayload(slug, component, { height, width }), {
    headers: JSON_HEADERS,
  });
}
