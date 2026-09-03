/**
 * Registry types. The shape lives in the Zod schema at `@/lib/registry`; this
 * module re-exports the inferred types so the canonical `@/types/registry`
 * import path keeps working.
 */
export type {
  ComponentCategory,
  ComponentPlatform,
  Registry,
  RegistryComponent,
  UsageExample,
} from "@/lib/registry";
