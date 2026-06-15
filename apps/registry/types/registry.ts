type RegistryFile = {
  path: string;
  type: string;
};

export type ComponentCategory =
  | "content"
  | "core"
  | "data"
  | "form"
  | "learning"
  | "navigation"
  | "overlay"
  | "utility";

type Stability = "beta" | "deprecated" | "experimental" | "stable";

type A11yKeyboardBinding = {
  action: string;
  keys: string;
};

type A11ySchema = {
  aria?: string[];
  focusManagement?: "auto" | "manual";
  keyboard?: A11yKeyboardBinding[];
  notes?: string;
  role?: string;
};

export type UsageExample = {
  code: string;
  description?: string;
  framework?: "next" | "react";
  storyId?: string;
  title: string;
};

type ComponentPropertyDefinition = {
  defaultValue?: string;
  deprecated?: boolean;
  description?: string;
  name: string;
  required?: boolean;
  type: string;
};

export type RegistryComponent = {
  a11y?: A11ySchema;
  category?: ComponentCategory;
  dependencies?: string[];
  description?: string;
  examples?: UsageExample[];
  files: RegistryFile[];
  name: string;
  props?: ComponentPropertyDefinition[];
  registryDependencies?: string[];
  replacedBy?: string;
  stability?: Stability;
  title: string;
  type: "registry:component";
  version?: string;
};

type RegistryItem = RegistryComponent;

export type Registry = {
  $schema?: string;
  generatedAt?: string;
  homepage?: string;
  items: RegistryItem[];
  name: string;
  version?: string;
};
