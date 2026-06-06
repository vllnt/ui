"use client";

import { useSyncExternalStore } from "react";

import {
  CUSTOM_THEME_NAME,
  DEFAULT_THEME_PRESET,
  isThemePresetName,
  THEME_CUSTOM_CSS_STORAGE_KEY,
  THEME_CUSTOM_STYLE_ID,
  THEME_PRESET_STORAGE_KEY,
  THEME_PRESETS,
  type ThemePreset,
  type ThemePresetName,
} from "./theme-presets";

export type CustomTheme = {
  readonly dark: Record<string, string>;
  readonly light: Record<string, string>;
  readonly radius?: string;
};

function themeDeclarations(variables: Record<string, string>): string {
  return Object.entries(variables)
    .map(([token, value]) => `--${token}:${value}`)
    .join(";");
}

function buildCustomCss(theme: CustomTheme): string {
  const light =
    themeDeclarations(theme.light) +
    (theme.radius ? `;--radius:${theme.radius}` : "");
  return (
    `html[data-theme="${CUSTOM_THEME_NAME}"]{${light}}` +
    `html[data-theme="${CUSTOM_THEME_NAME}"].dark{${themeDeclarations(theme.dark)}}`
  );
}

function clearCustomTheme(): void {
  document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`)?.remove();
  try {
    window.localStorage.removeItem(THEME_CUSTOM_CSS_STORAGE_KEY);
  } catch {
    /* localStorage may be unavailable. */
  }
}

const listeners = new Set<() => void>();

function emit(): void {
  listeners.forEach((listener) => {
    listener();
  });
}

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): ThemePresetName {
  const value = document.documentElement.dataset.theme;
  return value && isThemePresetName(value) ? value : DEFAULT_THEME_PRESET;
}

function getServerSnapshot(): ThemePresetName {
  return DEFAULT_THEME_PRESET;
}

/**
 * Apply a theme preset to the document root and persist it. Passing the default
 * preset removes the `data-theme` attribute so the base tokens take over.
 */
export function setThemePreset(name: ThemePresetName): void {
  clearCustomTheme();
  const root = document.documentElement;
  if (name === DEFAULT_THEME_PRESET) {
    delete root.dataset.theme;
  } else {
    root.dataset.theme = name;
  }
  try {
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, name);
  } catch {
    /* localStorage may be unavailable (private mode, blocked cookies). */
  }
  emit();
}

/**
 * Apply and persist a user-authored custom theme by injecting a stylesheet and
 * setting `data-theme="custom"` so the whole document re-themes; the next load
 * reapplies the choice before paint.
 */
export function setCustomTheme(theme: CustomTheme): void {
  const css = buildCustomCss(theme);
  const existing = document.querySelector(`#${THEME_CUSTOM_STYLE_ID}`);
  const style =
    existing instanceof HTMLStyleElement
      ? existing
      : document.createElement("style");
  style.id = THEME_CUSTOM_STYLE_ID;
  style.textContent = css;
  if (!existing) {
    document.head.append(style);
  }
  document.documentElement.dataset.theme = CUSTOM_THEME_NAME;
  try {
    window.localStorage.setItem(THEME_PRESET_STORAGE_KEY, CUSTOM_THEME_NAME);
    window.localStorage.setItem(THEME_CUSTOM_CSS_STORAGE_KEY, css);
  } catch {
    /* localStorage may be unavailable. */
  }
  emit();
}

export type UseThemePresetResult = {
  /** The active preset. */
  readonly preset: ThemePresetName;
  /** All built-in presets, including `default`. */
  readonly presets: readonly ThemePreset[];
  /** Apply and persist a preset. */
  readonly setPreset: (name: ThemePresetName) => void;
};

/**
 * Read and control the active runtime theme preset. Backed by the document
 * root's `data-theme` attribute so it stays in sync across every consumer.
 */
export function useThemePreset(): UseThemePresetResult {
  const preset = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return { preset, presets: THEME_PRESETS, setPreset: setThemePreset };
}
