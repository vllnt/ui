/** Renderers represented in VLLNT UI registry metadata. */
export const componentPlatforms = ["web", "native"] as const;

/** A renderer target represented in VLLNT UI registry metadata. */
export type ComponentPlatform = (typeof componentPlatforms)[number];

/** Returns whether an unknown value is a supported renderer target. */
export function isComponentPlatform(
  value: unknown,
): value is ComponentPlatform {
  return value === "web" || value === "native";
}
