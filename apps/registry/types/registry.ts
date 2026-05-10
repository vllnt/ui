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

export type RegistryComponent = {
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
