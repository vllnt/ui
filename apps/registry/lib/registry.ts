import { z } from "zod";

import type { Registry, RegistryComponent } from "@/types/registry";

import registryJson from "../registry.json";

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

const usageExampleSchema = z.object({
  code: z.string(),
  description: z.string().optional(),
  framework: z.enum(["next", "react"]).optional(),
  storyId: z.string().optional(),
  title: z.string(),
});

const propertyDefinitionSchema = z.object({
  defaultValue: z.string().optional(),
  deprecated: z.boolean().optional(),
  description: z.string().optional(),
  name: z.string(),
  required: z.boolean().optional(),
  type: z.string(),
});

const componentCategorySchema = z.enum([
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

const registryComponentSchema = z.object({
  a11y: a11ySchema.optional(),
  category: componentCategorySchema.optional(),
  dependencies: z.array(z.string()).optional(),
  description: z.string().optional(),
  examples: z.array(usageExampleSchema).optional(),
  files: z.array(registryFileSchema),
  name: z.string(),
  props: z.array(propertyDefinitionSchema).optional(),
  registryDependencies: z.array(z.string()).optional(),
  replacedBy: z.string().optional(),
  stability: z
    .enum(["stable", "beta", "experimental", "deprecated"])
    .optional(),
  title: z.string(),
  type: z.literal("registry:component"),
  version: z.string().optional(),
});

const registrySchema = z.object({
  $schema: z.string().optional(),
  generatedAt: z.string().optional(),
  homepage: z.string().optional(),
  items: z.array(registryComponentSchema),
  name: z.string(),
  version: z.string().optional(),
}) satisfies z.ZodType<Registry>;

/**
 * Parses an unknown value into a {@link Registry}, throwing with a precise
 * error when the shape drifts from the canonical contract.
 */
export function parseRegistry(raw: unknown): Registry {
  return registrySchema.parse(raw);
}

const REGISTRY: Registry = parseRegistry(registryJson);

/** The registry feed, parsed and validated once at module load. */
export function getRegistry(): Registry {
  return REGISTRY;
}

/** Every component item in the registry feed. */
export function getRegistryItems(): readonly RegistryComponent[] {
  return REGISTRY.items;
}
