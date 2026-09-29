import type { Metadata } from "next";
import { z } from "zod";

import type { Locale } from "@/i18n/routing";
import type { PageFrontmatter } from "@/lib/schemas";
import {
  alternateOgLocales,
  canonical,
  languageAlternates,
  ogLocale,
} from "@/lib/seo";

export const OG_IMAGE_WIDTH = 2400;
export const OG_IMAGE_HEIGHT = 1260;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.com";

const ogImageParametersSchema = z.object({
  category: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  title: z.string().min(1).max(200).default("VLLNT UI"),
  type: z.enum(["home", "component", "docs", "page"]).default("page"),
  url: z.string().max(200).optional(),
});

export type OGImageParametersInput = z.input<typeof ogImageParametersSchema>;

type PageMetadataOptions = {
  locale?: Locale;
  pathname?: string;
};

export function generateOGImageURL(parameters: OGImageParametersInput): string {
  const validated = ogImageParametersSchema.parse(parameters);

  const searchParameters = new URLSearchParams({
    title: validated.title,
    type: validated.type,
    ...(validated.description && { description: validated.description }),
    ...(validated.category && { category: validated.category }),
    ...(validated.url && { url: validated.url }),
  });

  return `/api/og?${searchParameters.toString()}`;
}

function generateOGMetadata(
  parameters: OGImageParametersInput,
  options: PageMetadataOptions = {},
): Metadata["openGraph"] {
  const validated = ogImageParametersSchema.parse(parameters);
  const locale = options.locale ?? "en";
  const url =
    options.pathname === undefined
      ? SITE_URL
      : canonical(options.pathname, locale);
  const ogImageURL = new URL(
    generateOGImageURL(validated),
    SITE_URL,
  ).toString();

  return {
    alternateLocale: alternateOgLocales(locale),
    description: validated.description,
    images: [
      {
        alt: validated.title,
        height: OG_IMAGE_HEIGHT,
        url: ogImageURL,
        width: OG_IMAGE_WIDTH,
      },
    ],
    locale: ogLocale(locale),
    siteName: "VLLNT UI",
    title: validated.title,
    type: "website",
    url,
  };
}

export function generateTwitterMetadata(
  parameters: OGImageParametersInput,
): Metadata["twitter"] {
  const validated = ogImageParametersSchema.parse(parameters);
  const ogImageURL = generateOGImageURL(validated);

  return {
    card: "summary_large_image",
    creator: "@vllnt",
    description: validated.description,
    images: [ogImageURL],
    site: "@vllnt",
    title: validated.title,
  };
}

type PageMetadataInput = Metadata & {
  /** Path the canonical + hreflang alternates point at; defaults to `pathname`. */
  readonly canonicalPath?: string;
  readonly locale: Locale;
  /** Social card parameters; `title`/`description` also default the page's. */
  readonly og: OGImageParametersInput;
  /** Path of the page itself (the Open Graph `url`). */
  readonly pathname: string;
};

/**
 * Page metadata with canonical + hreflang alternates and matching Open Graph
 * and Twitter cards. Any other `Metadata` field passes through unchanged.
 */
export function pageMetadata({
  alternates,
  canonicalPath,
  locale,
  og,
  pathname,
  ...metadata
}: PageMetadataInput): Metadata {
  const canonicalPathname = canonicalPath ?? pathname;

  return {
    description: og.description,
    title: og.title,
    ...metadata,
    alternates: {
      canonical: canonical(canonicalPathname, locale),
      languages: languageAlternates(canonicalPathname),
      ...alternates,
    },
    openGraph: generateOGMetadata(og, { locale, pathname }),
    twitter: generateTwitterMetadata(og),
  };
}

/** Page metadata for an MDX page; the `og` frontmatter overrides the social card. */
export function frontmatterPageMetadata(
  { description, og, title, type }: PageFrontmatter,
  options: { readonly locale: Locale; readonly pathname: string },
): Metadata {
  return pageMetadata({
    ...options,
    description,
    og: {
      description: og?.description ?? description,
      title: og?.title ?? title,
      type: og?.type ?? type,
    },
    title,
  });
}
