import { z } from "zod";

export const ogTypeSchema = z.enum(["home", "component", "docs", "page"]);

const ogImageFrontmatterSchema = z.object({
  category: z.string().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
  type: ogTypeSchema.optional(),
});

export const pageFrontmatterSchema = z.object({
  description: z.string().min(1),
  og: ogImageFrontmatterSchema.optional(),
  title: z.string().min(1),
  type: ogTypeSchema.default("page"),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
