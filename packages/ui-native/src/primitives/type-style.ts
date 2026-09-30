import type { NativeTheme } from "@vllnt/ui-core";
import type { TextStyle } from "react-native";

type TypeScale = NativeTheme["typography"]["scale"];
type ThemeColor = keyof NativeTheme["colors"];

/** Semantic color name, or text style whose `color` names a semantic color. */
type TypeStyleText =
  | (Omit<TextStyle, "color"> & { readonly color: ThemeColor })
  | ThemeColor;

/**
 * Pairs a theme type-scale entry with a semantic text color as the two-entry
 * style array `[scale, { color, ...rest }]`.
 */
function typeStyle(
  theme: NativeTheme,
  scale: keyof TypeScale,
  text: TypeStyleText,
): [TypeScale[keyof TypeScale], TextStyle] {
  const { color, ...rest } = typeof text === "string" ? { color: text } : text;
  return [
    theme.typography.scale[scale],
    { color: theme.colors[color], ...rest },
  ];
}

export { typeStyle };
