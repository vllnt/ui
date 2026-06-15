/* eslint-disable @typescript-eslint/naming-convention */
/**
 * Shared theme model for the editor and the export endpoint. Token values are
 * OKLCH channel strings ("L C H"). A fixed token order lets a theme serialize to
 * a compact, positional array.
 */

export type ThemeMode = "dark" | "light";

export type ThemeColors = Record<string, string>;

export type ThemeData = {
  readonly dark: ThemeColors;
  readonly light: ThemeColors;
  readonly radius: string;
};

export type ThemeTokenMeta = {
  /** Full CSS custom property name. */
  readonly cssVar: string;
  /** Whether this token is a foreground paired with the preceding surface. */
  readonly isForeground: boolean;
  /** Human-readable label for the editor. */
  readonly label: string;
  /** Token name without the leading `--` (matches shadcn cssVars keys). */
  readonly name: string;
};

export const THEME_TOKENS: readonly ThemeTokenMeta[] = [
  {
    cssVar: "--background",
    isForeground: false,
    label: "Background",
    name: "background",
  },
  {
    cssVar: "--foreground",
    isForeground: true,
    label: "Foreground",
    name: "foreground",
  },
  { cssVar: "--card", isForeground: false, label: "Card", name: "card" },
  {
    cssVar: "--card-foreground",
    isForeground: true,
    label: "Card Foreground",
    name: "card-foreground",
  },
  {
    cssVar: "--popover",
    isForeground: false,
    label: "Popover",
    name: "popover",
  },
  {
    cssVar: "--popover-foreground",
    isForeground: true,
    label: "Popover Foreground",
    name: "popover-foreground",
  },
  {
    cssVar: "--primary",
    isForeground: false,
    label: "Primary",
    name: "primary",
  },
  {
    cssVar: "--primary-foreground",
    isForeground: true,
    label: "Primary Foreground",
    name: "primary-foreground",
  },
  {
    cssVar: "--secondary",
    isForeground: false,
    label: "Secondary",
    name: "secondary",
  },
  {
    cssVar: "--secondary-foreground",
    isForeground: true,
    label: "Secondary Foreground",
    name: "secondary-foreground",
  },
  { cssVar: "--muted", isForeground: false, label: "Muted", name: "muted" },
  {
    cssVar: "--muted-foreground",
    isForeground: true,
    label: "Muted Foreground",
    name: "muted-foreground",
  },
  { cssVar: "--accent", isForeground: false, label: "Accent", name: "accent" },
  {
    cssVar: "--accent-foreground",
    isForeground: true,
    label: "Accent Foreground",
    name: "accent-foreground",
  },
  {
    cssVar: "--destructive",
    isForeground: false,
    label: "Destructive",
    name: "destructive",
  },
  {
    cssVar: "--destructive-foreground",
    isForeground: true,
    label: "Destructive Foreground",
    name: "destructive-foreground",
  },
  { cssVar: "--border", isForeground: false, label: "Border", name: "border" },
  { cssVar: "--input", isForeground: false, label: "Input", name: "input" },
  { cssVar: "--ring", isForeground: false, label: "Ring", name: "ring" },
];

export const DEFAULT_RADIUS = "0.5rem";

export const DEFAULT_THEME: ThemeData = {
  dark: {
    accent: "0.2686 0 0",
    "accent-foreground": "0.9848 0 0",
    background: "0 0 0",
    border: "0.2686 0 0",
    card: "0.1445 0 0",
    "card-foreground": "0.9848 0 0",
    destructive: "0.3959 0.1331 25.721",
    "destructive-foreground": "0.9848 0 0",
    foreground: "0.9848 0 0",
    input: "0.2686 0 0",
    muted: "0.2686 0 0",
    "muted-foreground": "0.7153 0 0",
    popover: "0.1445 0 0",
    "popover-foreground": "0.9848 0 0",
    primary: "0.9848 0 0",
    "primary-foreground": "0.2044 0 0",
    ring: "0.8697 0 0",
    secondary: "0.2686 0 0",
    "secondary-foreground": "0.9848 0 0",
  },
  light: {
    accent: "0.9703 0 0",
    "accent-foreground": "0.2044 0 0",
    background: "1 0 0",
    border: "0.9219 0 0",
    card: "1 0 0",
    "card-foreground": "0.1445 0 0",
    destructive: "0.6368 0.2078 25.326",
    "destructive-foreground": "0.9848 0 0",
    foreground: "0.1445 0 0",
    input: "0.9219 0 0",
    muted: "0.9703 0 0",
    "muted-foreground": "0.5555 0 0",
    popover: "1 0 0",
    "popover-foreground": "0.1445 0 0",
    primary: "0.2044 0 0",
    "primary-foreground": "0.9848 0 0",
    ring: "0.1445 0 0",
    secondary: "0.9703 0 0",
    "secondary-foreground": "0.2044 0 0",
  },
  radius: DEFAULT_RADIUS,
};
