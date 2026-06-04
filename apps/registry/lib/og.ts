import type { Metadata } from "next";
import { z } from "zod";

import type { Locale } from "@/i18n/routing";
import { alternateOgLocales, canonical, ogLocale } from "@/lib/seo";

export const OG_IMAGE_WIDTH = 2400;
export const OG_IMAGE_HEIGHT = 1260;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

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

function generateOGImageURL(parameters: OGImageParametersInput): string {
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

export function generateOGMetadata(
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
    description: validated.description,
    images: [ogImageURL],
    title: validated.title,
  };
}
