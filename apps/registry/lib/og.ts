import type { Metadata } from "next";
import { z } from "zod";

export const OG_IMAGE_WIDTH = 2400;
export const OG_IMAGE_HEIGHT = 1260;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ui.vllnt.ai";

export const ogImageParametersSchema = z.object({
  category: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  title: z.string().min(1).max(200).default("VLLNT UI"),
  type: z.enum(["home", "component", "docs", "page"]).default("page"),
  url: z.string().max(200).optional(),
});

export type OGImageParametersInput = z.input<typeof ogImageParametersSchema>;
export type OGImageParameters = z.infer<typeof ogImageParametersSchema>;

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

export function generateOGMetadata(
  parameters: OGImageParametersInput,
): Metadata["openGraph"] {
  const validated = ogImageParametersSchema.parse(parameters);
  const ogImageURL = new URL(
    generateOGImageURL(validated),
    SITE_URL,
  ).toString();

  return {
    description: validated.description,
    images: [
      {
        alt: validated.title,
        height: OG_IMAGE_HEIGHT,
        url: ogImageURL,
        width: OG_IMAGE_WIDTH,
      },
    ],
    siteName: "VLLNT UI",
    title: validated.title,
    type: "website",
    url: SITE_URL,
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
