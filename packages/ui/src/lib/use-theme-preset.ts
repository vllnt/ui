"use client";

import { useSyncExternalStore } from "react";

import {
  DEFAULT_THEME_PRESET,
  isThemePresetName,
  THEME_PRESET_STORAGE_KEY,
  THEME_PRESETS,
  type ThemePreset,
  type ThemePresetName,
} from "./theme-presets";

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
