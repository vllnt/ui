export type RegistryFile = {
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

export type RegistryComponent = {
  a11y?: A11ySchema;
  category?: ComponentCategory;
  dependencies?: string[];
  description?: string;
  files: RegistryFile[];
  name: string;
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
