"use client";

import { type ReactNode, useEffect } from "react";

import {
  CUSTOM_THEME_NAME,
  DEFAULT_THEME_PRESET,
  THEME_CUSTOM_CSS_STORAGE_KEY,
  THEME_CUSTOM_STYLE_ID,
  THEME_PRESET_STORAGE_KEY,
} from "../../lib/theme-presets";

const FOUC_SCRIPT = `(function(){try{var v=localStorage.getItem(${JSON.stringify(
  THEME_PRESET_STORAGE_KEY,
)});if(!v||v===${JSON.stringify(
  DEFAULT_THEME_PRESET,
)})return;document.documentElement.setAttribute("data-theme",v);if(v===${JSON.stringify(
  CUSTOM_THEME_NAME,
)}){var c=localStorage.getItem(${JSON.stringify(
  THEME_CUSTOM_CSS_STORAGE_KEY,
)});if(c){var s=document.createElement("style");s.id=${JSON.stringify(
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
    if (!stored) {
      document.documentElement.dataset.theme = defaultPreset;
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
