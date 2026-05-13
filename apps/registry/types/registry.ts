export type RegistryFile = {
  path: string;
  type: string;
};

export type ComponentCategory =
  | "ai"
  | "billing"
  | "content"
  | "core"
  | "data"
  | "data-display"
  | "educational"
  | "form"
  | "learning"
  | "navigation"
  | "overlay"
  | "utility";

export type Stability = "stable" | "beta" | "experimental" | "deprecated";

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
  framework?: "react" | "next";
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

export type RegistryComponent = {
  a11y?: A11ySchema;
  category?: ComponentCategory;
  dependencies?: string[];
  description?: string;
  descriptions?: Partial<Record<string, string>>;
  examples?: UsageExample[];
  files: RegistryFile[];
  name: string;
  props?: PropDefinition[];
  registryDependencies?: string[];
  replacedBy?: string;
  stability?: Stability;
  title: string;
  type: "registry:component";
  version?: string;
};

export type RegistryItem = RegistryComponent;

export type Registry = {
  $schema?: string;
  generatedAt?: string;
  homepage?: string;
  items: RegistryItem[];
  name: string;
  version?: string;
};
