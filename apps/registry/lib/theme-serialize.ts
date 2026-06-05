/**
 * Encode/decode a {@link ThemeData} to a compact URL-safe token and render it
 * into the export formats: a CSS variables block, the canonical tokens.json
 * shape, and a shadcn `registry:theme` item installable via `npx shadcn add`.
 */

import { oklchToCss } from "./oklch";
import {
  DEFAULT_RADIUS,
  THEME_TOKENS,
  type ThemeData,
  type ThemeMode,
} from "./theme-tokens";

const RADIUS_VARIABLE = "--radius";

function base64UrlEncode(input: string): string {
  return btoa(input)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function base64UrlDecode(input: string): string {
  return atob(input.replaceAll("-", "+").replaceAll("_", "/"));
}

function toCamelCase(value: string): string {
  return value.replaceAll(/-([a-z])/g, (match) => match.slice(1).toUpperCase());
}

/** Serialize a theme to a positional, URL-safe token (light, dark, radius). */
export function encodeTheme(theme: ThemeData): string {
  const values = [
    ...THEME_TOKENS.map((token) => theme.light[token.name] ?? ""),
    ...THEME_TOKENS.map((token) => theme.dark[token.name] ?? ""),
    theme.radius,
  ];
  return base64UrlEncode(JSON.stringify(values));
}

/** Parse a token produced by {@link encodeTheme}; undefined when malformed. */
export function decodeTheme(token: string): ThemeData | undefined {
  try {
    const parsed: unknown = JSON.parse(base64UrlDecode(token));
    const expectedLength = THEME_TOKENS.length * 2 + 1;
    if (
      !Array.isArray(parsed) ||
      parsed.length !== expectedLength ||
      !parsed.every((value) => typeof value === "string")
    ) {
      return undefined;
    }
    const values = parsed;
    return {
      dark: Object.fromEntries(
        THEME_TOKENS.map((token, index) => [
          token.name,
          values[index + THEME_TOKENS.length] ?? "",
        ]),
      ),
      light: Object.fromEntries(
        THEME_TOKENS.map((token, index) => [token.name, values[index] ?? ""]),
      ),
      radius: values[expectedLength - 1] || DEFAULT_RADIUS,
    };
  } catch {
    return undefined;
  }
}

function cssBlock(theme: ThemeData, mode: ThemeMode): string {
  return THEME_TOKENS.map(
    (token) =>
      `  ${token.cssVar}: ${oklchToCss(theme[mode][token.name] ?? "")};`,
  ).join("\n");
}

/** Render a theme as a shadcn-style `:root` / `.dark` CSS variables block. */
export function themeToCss(theme: ThemeData): string {
  return [
    ":root {",
    cssBlock(theme, "light"),
    `  --radius: ${theme.radius};`,
    "}",
    "",
    ".dark {",
    cssBlock(theme, "dark"),
    "}",
    "",
  ].join("\n");
}

/** Render a theme in the canonical packages/design/tokens.json color shape. */
export function themeToTokensJson(theme: ThemeData): unknown {
  return {
    color: {
      format: "oklch-channel",
      semantic: Object.fromEntries(
        THEME_TOKENS.map((token) => [
          toCamelCase(token.name),
          {
            cssVariable: token.cssVar,
            dark: theme.dark[token.name],
            light: theme.light[token.name],
          },
        ]),
      ),
    },
    radius: theme.radius,
  };
}

function registryVariables(
  theme: ThemeData,
  mode: ThemeMode,
): Record<string, string> {
  return Object.fromEntries(
    THEME_TOKENS.map((token) => [
      token.name,
      oklchToCss(theme[mode][token.name] ?? ""),
    ]),
  );
}

/** Build a shadcn `registry:theme` item installable via `npx shadcn add`. */
export function themeToRegistryItem(
  theme: ThemeData,
  name = "vllnt-custom",
): unknown {
  return {
    $schema: "https://ui.shadcn.com/schema/registry-item.json",
    cssVars: {
      dark: registryVariables(theme, "dark"),
      light: registryVariables(theme, "light"),
      theme: { [RADIUS_VARIABLE]: theme.radius },
    },
    name,
    type: "registry:theme",
  };
}

/** Build the `npx shadcn add <url>` install URL for a theme. */
export function themeInstallUrl(
  origin: string,
  theme: ThemeData,
  name?: string,
): string {
  const parameters = new URLSearchParams({ t: encodeTheme(theme) });
  if (name) {
    parameters.set("name", name);
  }
  return `${origin}/r/themes?${parameters.toString()}`;
}
