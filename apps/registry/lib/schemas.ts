import { z } from "zod";

import { OG_TYPES } from "@/lib/og-templates";

const ogImageFrontmatterSchema = z.object({
  category: z.string().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(OG_TYPES).optional(),
});

export const pageFrontmatterSchema = z.object({
  description: z.string().min(1),
  og: ogImageFrontmatterSchema.optional(),
  title: z.string().min(1),
  type: z.enum(OG_TYPES).default("page"),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
