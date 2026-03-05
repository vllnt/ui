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

export type RegistryComponent = {
  category?: ComponentCategory;
  dependencies?: string[];
  description?: string;
  files: RegistryFile[];
  name: string;
  registryDependencies?: string[];
  title: string;
  type: "registry:component";
};

export type RegistryItem = RegistryComponent;

export type Registry = {
  $schema?: string;
  homepage?: string;
  items: RegistryItem[];
  name: string;
};
