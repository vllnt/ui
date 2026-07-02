"use client";

import { useEffect, useRef, useState } from "react";

import {
  Button,
  isThemePresetName,
  setCustomTheme,
  setThemePreset,
} from "@vllnt/ui";
import { useTranslations } from "next-intl";

import { EDITOR_PRESETS, type EditorPreset } from "@/lib/editor-presets";
import { decodeTheme, encodeTheme } from "@/lib/theme-serialize";
import {
  DEFAULT_THEME,
  type ThemeData,
  type ThemeMode,
} from "@/lib/theme-tokens";

import { ColorControls } from "./color-controls";
import { ExportPanel } from "./export-panel";
import { ThemePreview } from "./theme-preview";

const STORAGE_KEY = "vllnt-theme-editor";
const MODES: ThemeMode[] = ["light", "dark"];

function readActiveTheme(): ThemeData | undefined {
  const active = document.documentElement.dataset.theme;
  if (active && active !== "custom") {
    const preset = EDITOR_PRESETS.find((item) => item.name === active);
    if (preset) {
      return preset.theme;
    }
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? decodeTheme(stored) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Interactive theme editor. Picking a preset or editing a token re-themes the
 * entire site live (and persists across navigation); the controls also drive
 * the export panel and a focused preview of the chosen mode.
 */
export function ThemeEditor() {
  const t = useTranslations("pages.themes.editor");
  const [theme, setTheme] = useState<ThemeData>(DEFAULT_THEME);
  const [mode, setMode] = useState<ThemeMode>("dark");
  const isFirstRender = useRef(true);

  /* eslint-disable react-hooks/set-state-in-effect -- one-shot init from
     URL/localStorage after hydration; a lazy useState initializer cannot
     read window during SSR. */
  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("t");
    const urlTheme = fromUrl ? decodeTheme(fromUrl) : undefined;
    if (urlTheme) {
      setTheme(urlTheme);
      setCustomTheme(urlTheme);
      return;
    }
    const restored = readActiveTheme();
    if (restored) {
      setTheme(restored);
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const token = encodeTheme(theme);
    const url = new URL(window.location.href);
    url.searchParams.set("t", token);
    window.history.replaceState(null, "", url.toString());
    try {
      window.localStorage.setItem(STORAGE_KEY, token);
    } catch {
      /* persistence is best-effort */
    }
  }, [theme]);

  const applyPreset = (preset: EditorPreset): void => {
    setTheme(preset.theme);
    if (isThemePresetName(preset.name)) {
      setThemePreset(preset.name);
    } else {
      setCustomTheme(preset.theme);
    }
  };

  const updateColor = (name: string, channels: string): void => {
    const next: ThemeData = {
      ...theme,
      [mode]: { ...theme[mode], [name]: channels },
    };
    setTheme(next);
    setCustomTheme(next);
  };

  const updateRadius = (radius: string): void => {
    const next: ThemeData = { ...theme, radius };
    setTheme(next);
    setCustomTheme(next);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold">{t("theme")}</span>
          <div className="flex flex-wrap gap-2">
            {EDITOR_PRESETS.map((preset) => (
              <button
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
                key={preset.name}
                onClick={() => {
                  applyPreset(preset);
                }}
                type="button"
              >
                <span
                  className="size-3 rounded-full border border-border"
                  style={{ backgroundColor: preset.swatch }}
                />
                {preset.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t("intro")}</p>
        </div>

        <div className="flex items-center justify-between">
          <div className="inline-flex rounded-md border border-border p-0.5">
            {MODES.map((option) => (
              <button
                aria-pressed={option === mode}
                className="rounded px-3 py-1 text-xs capitalize aria-[pressed=true]:bg-accent"
                key={option}
                onClick={() => {
                  setMode(option);
                }}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
          <Button
            onClick={() => {
              setTheme(DEFAULT_THEME);
              setThemePreset("default");
            }}
            size="sm"
            variant="ghost"
          >
            {t("reset")}
          </Button>
        </div>

        <ColorControls
          colors={theme[mode]}
          onColorChange={updateColor}
          onRadiusChange={updateRadius}
          radius={theme.radius}
        />

        <ExportPanel theme={theme} />
      </div>

      <div className="lg:sticky lg:top-8 lg:self-start">
        <ThemePreview colors={theme[mode]} radius={theme.radius} />
      </div>
    </div>
  );
}
