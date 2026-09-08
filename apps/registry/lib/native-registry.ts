import { z } from "zod";

import nativeRegistryData from "../../../packages/ui-native/registry.json";

const REACT_NATIVE_PACKAGE = "react-native";

export const nativeCompatibilitySchema = z.enum([
  "native-adapted",
  "portable-options",
]);

const nativeComponentSchema = z.object({
  compatibility: nativeCompatibilitySchema,
  name: z.string().regex(/^[a-z][\da-z-]*$/),
  source: z.string().regex(/^src\/components(?:\/[a-z][\da-z-]*){2}\.tsx$/),
});

export const nativeRegistrySchema = z.object({
  $schema: z.string().optional(),
  availability: z.enum(["package", "source"]),
  channel: z.literal("canary"),
  components: z.array(nativeComponentSchema).min(1),
  installation: z.object({
    available: z.boolean(),
    command: z.literal("pnpm add @vllnt/ui-native@canary"),
    reason: z.string().min(1),
  }),
  minimumReact: z.string(),
  minimumReactNative: z.string(),
  package: z.literal("@vllnt/ui-native"),
  peerDependencies: z.object({
    react: z.string(),
    [REACT_NATIVE_PACKAGE]: z.string(),
  }),
  schemaVersion: z.string(),
  status: z.literal("experimental"),
});

export type NativeRegistry = z.infer<typeof nativeRegistrySchema>;

export const nativeRegistry: NativeRegistry =
  nativeRegistrySchema.parse(nativeRegistryData);
