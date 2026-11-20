import { Platform } from "react-native";

/** Font families `Text` offers, matching the web `Text` `family` prop. */
export type TextFamily = "mono" | "sans";

/**
 * The platform monospace face. iOS has no `monospace` alias, so it uses Menlo,
 * which every iOS version ships; Android and web resolve the generic name.
 */
export const monospaceFontFamily = Platform.select({
  default: "monospace",
  ios: "Menlo",
});

/**
 * The `fontFamily` style for a family. `sans` leaves the font unset, so text
 * keeps the platform system face, as native `Text` always has.
 */
export function fontFamilyStyle(family: TextFamily): { fontFamily?: string } {
  return family === "mono" ? { fontFamily: monospaceFontFamily } : {};
}
