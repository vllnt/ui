/**
 * Shapes of registry.json and packages/ui-native/registry.json shared by the
 * registry build scripts (type-only; nothing here runs).
 */

export type RegistryFile = {
  path: string;
  type: string;
};

export type Stability = "stable" | "beta" | "experimental" | "deprecated";
export type ComponentPlatform = "native" | "web";
export type NativeCompatibility = "native-adapted" | "portable-options";
export type NativeAvailability = "package" | "source";

export type NativeRenderer = {
  availability: NativeAvailability;
  channel: "canary";
  compatibility: NativeCompatibility;
  package: "@vllnt/ui-native";
  source: string;
  status: "experimental";
};

export type NativeRegistry = {
  availability: NativeAvailability;
  channel: "canary";
  components: {
    compatibility: NativeCompatibility;
    name: string;
    source: string;
  }[];
  package: "@vllnt/ui-native";
  status: "experimental";
};

export type A11yKeyboardBinding = {
  keys: string;
  action: string;
};

export type A11ySchema = {
  role?: string;
  keyboard?: A11yKeyboardBinding[];
  aria?: string[];
  focusManagement?: "auto" | "manual";
  notes?: string;
};

export type UsageExample = {
  title: string;
  description?: string;
  code: string;
  framework?: "next" | "react" | "react-native";
  storyId?: string;
};

export type PropDefinition = {
  name: string;
  type: string;
  required?: boolean;
  defaultValue?: string;
  description?: string;
  deprecated?: boolean;
};

export type RegistryItem = {
  a11y?: A11ySchema;
  category?: string;
  dependencies?: string[];
  description?: string;
  examples?: UsageExample[];
  files: RegistryFile[];
  name: string;
  native?: NativeRenderer;
  platforms: ComponentPlatform[];
  props?: PropDefinition[];
  registryDependencies?: string[];
  replacedBy?: string;
  stability?: Stability;
  title?: string;
  type: string;
  version?: string;
};

export type Registry = {
  $schema?: string;
  generatedAt?: string;
  homepage?: string;
  items: RegistryItem[];
  name?: string;
  version?: string;
};
