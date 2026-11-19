import nativeRegistry from "@vllnt/ui-native/registry.json";

export const nativeComponentNames: readonly string[] =
  nativeRegistry.components.map((component) => component.name);

export const nativeComponentCount = nativeComponentNames.length;
