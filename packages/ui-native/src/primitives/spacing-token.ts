import type { NativeTheme } from "@vllnt/ui-core";

type SpacingKey = keyof NativeTheme["spacing"];

/**
 * A spacing token as a number: `3` reads `theme.spacing[3]`. Derived from the
 * theme, so it tracks the tokens ui-core generates.
 */
export type SpacingToken = SpacingKey extends infer Key
  ? Key extends `${infer Step extends number}`
    ? Step
    : never
  : never;
