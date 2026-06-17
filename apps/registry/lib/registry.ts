import { z } from "zod";

import registryData from "@/registry.json";

/**
 * Single parse seam for the shipped registry.json.
 *
 * Every caller imports the typed {@link registry} export instead of re-declaring
 * the registry shape and reading it through an `as Registry` cast. An unknown
 * `category` or other bad data throws here at module load.
 */

export const componentCategorySchema = z.enum([
  "ai",
  "billing",
  "content",
  "core",
  "data",
  "data-display",
  "educational",
  "form",
  "learning",
  "navigation",
  "overlay",
  "utility",
]);

export type ComponentCategory = z.infer<typeof componentCategorySchema>;

const stabilitySchema = z.enum([
  "beta",
  "deprecated",
  "experimental",
  "stable",
]);

const registryFileSchema = z.object({
  path: z.string(),
  type: z.string(),
});

const a11yKeyboardBindingSchema = z.object({
  action: z.string(),
  keys: z.string(),
});

const a11ySchema = z.object({
  aria: z.array(z.string()).optional(),
  focusManagement: z.enum(["auto", "manual"]).optional(),
  keyboard: z.array(a11yKeyboardBindingSchema).optional(),
  notes: z.string().optional(),
  role: z.string().optional(),
});

export const usageExampleSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
  framework: z.enum(["next", "react"]).optional(),
  storyId: z.string().optional(),
  title: z.string(),
});

export type UsageExample = z.infer<typeof usageExampleSchema>;

const componentPropertyDefinitionSchema = z.object({
  defaultValue: z.string().optional(),
  deprecated: z.boolean().optional(),
  description: z.string().optional(),
  name: z.string(),
  required: z.boolean().optional(),
  type: z.string(),
});

export const registryComponentSchema = z.object({
  a11y: a11ySchema.optional(),
  category: componentCategorySchema.optional(),
  dependencies: z.array(z.string()).optional(),
  description: z.string().optional(),
  examples: z.array(usageExampleSchema).optional(),
  files: z.array(registryFileSchema),
  name: z.string(),
  props: z.array(componentPropertyDefinitionSchema).optional(),
  registryDependencies: z.array(z.string()).optional(),
  replacedBy: z.string().optional(),
  stability: stabilitySchema.optional(),
  title: z.string(),
  type: z.literal("registry:component"),
  version: z.string().optional(),
});

export type RegistryComponent = z.infer<typeof registryComponentSchema>;

export const registrySchema = z.object({
  $schema: z.string().optional(),
  generatedAt: z.string().optional(),
  homepage: z.string().optional(),
  items: z.array(registryComponentSchema),
  name: z.string(),
  version: z.string().optional(),
});

export type Registry = z.infer<typeof registrySchema>;

export const registry: Registry = registrySchema.parse(registryData);
