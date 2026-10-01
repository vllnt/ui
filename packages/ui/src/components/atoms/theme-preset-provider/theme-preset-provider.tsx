"use client";

import { type ReactNode, useEffect } from "react";

import {
  CUSTOM_THEME_NAME,
  DEFAULT_THEME_PRESET,
  isThemePresetName,
  THEME_CUSTOM_CSS_STORAGE_KEY,
  THEME_CUSTOM_STYLE_ID,
  THEME_PRESET_STORAGE_KEY,
} from "../../../lib/theme-presets";
import { setThemePreset } from "../../../lib/use-theme-preset";

const SCRIPT_UNSAFE_CHARACTERS = /[/<>\u2028\u2029]/g;
const SCRIPT_ESCAPES: Readonly<Record<string, string>> = {
  "\u2028": String.raw`\u2028`,
  "\u2029": String.raw`\u2029`,
  "/": String.raw`\u002F`,
  "<": String.raw`\u003C`,
  ">": String.raw`\u003E`,
};

/** JSON string literal that cannot close or break the inline `<script>`. */
function scriptLiteral(value: string): string {
  return JSON.stringify(value).replaceAll(
    SCRIPT_UNSAFE_CHARACTERS,
    (character) => SCRIPT_ESCAPES[character] ?? character,
  );
}

const FOUC_SCRIPT = `(function(){try{var v=localStorage.getItem(${scriptLiteral(
  THEME_PRESET_STORAGE_KEY,
)});if(!v||v===${scriptLiteral(
  DEFAULT_THEME_PRESET,
)})return;document.documentElement.setAttribute("data-theme",v);if(v===${scriptLiteral(
  CUSTOM_THEME_NAME,
)}){var c=localStorage.getItem(${scriptLiteral(
  THEME_CUSTOM_CSS_STORAGE_KEY,
)});if(c){var s=document.createElement("style");s.id=${scriptLiteral(
  THEME_CUSTOM_STYLE_ID,
)};s.textContent=c;document.head.appendChild(s);}}}catch(e){}})();`;

export type ThemePresetProviderProps = {
  readonly children?: ReactNode;
  /** Preset applied on first visit when no stored preference exists. */
  readonly defaultPreset?: string;
};

/**
 * Restores the persisted theme preset before paint (avoiding a flash) and
 * optionally seeds a default preset for first-time visitors. Render it once,
 * high in the tree, alongside the light/dark `ThemeProvider`.
 */
export function ThemePresetProvider({
  children,
  defaultPreset,
}: ThemePresetProviderProps) {
  useEffect(() => {
    if (!defaultPreset || defaultPreset === DEFAULT_THEME_PRESET) {
      return;
    }
    let stored: null | string = null;
    try {
      stored = window.localStorage.getItem(THEME_PRESET_STORAGE_KEY);
    } catch {
      stored = null;
    }
    if (!stored && isThemePresetName(defaultPreset)) {
      setThemePreset(defaultPreset);
    }
  }, [defaultPreset]);

  return (
    <>
      <script
        dangerouslySetInnerHTML={{ __html: FOUC_SCRIPT }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}
