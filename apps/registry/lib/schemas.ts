import { z } from "zod";

export const ogImageFrontmatterSchema = z.object({
  category: z.string().optional(),
  description: z.string().optional(),
  title: z.string().optional(),
  type: z.enum(["home", "component", "docs", "page"]).optional(),
});

export const pageFrontmatterSchema = z.object({
  description: z.string().min(1),
  og: ogImageFrontmatterSchema.optional(),
  title: z.string().min(1),
  type: z.enum(["home", "component", "docs", "page"]).default("page"),
});

export type PageFrontmatter = z.infer<typeof pageFrontmatterSchema>;
export type OGImageFrontmatter = z.infer<typeof ogImageFrontmatterSchema>;
