"use client";

import { Button } from "@vllnt/ui";
import { useEffect, useRef, useState } from "react";

import { EDITOR_PRESETS } from "@/lib/editor-presets";
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

function readInitialTheme(): ThemeData | undefined {
  const fromUrl = new URLSearchParams(window.location.search).get("t");
  const urlTheme = fromUrl ? decodeTheme(fromUrl) : undefined;
  if (urlTheme) {
    return urlTheme;
  }
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? decodeTheme(stored) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Interactive theme editor: edit OKLCH tokens per mode, seed from a preset,
 * preview live, and persist to the URL (shareable) and localStorage.
 */
export function ThemeEditor() {
  const [theme, setTheme] = useState<ThemeData>(DEFAULT_THEME);
  const [mode, setMode] = useState<ThemeMode>("light");
  const isFirstRender = useRef(true);

  useEffect(() => {
    const initial = readInitialTheme();
    if (initial) {
      setTheme(initial);
    }
  }, []);

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

  const updateColor = (name: string, channels: string): void => {
    setTheme((previous) => ({
      ...previous,
      [mode]: { ...previous[mode], [name]: channels },
    }));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold">Start from</span>
          <div className="flex flex-wrap gap-2">
            {EDITOR_PRESETS.map((preset) => (
              <button
                className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs hover:bg-accent"
                key={preset.name}
                onClick={() => {
                  setTheme(preset.theme);
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
            }}
            size="sm"
            variant="ghost"
          >
            Reset
          </Button>
        </div>

        <ColorControls
          colors={theme[mode]}
          onColorChange={updateColor}
          onRadiusChange={(radius) => {
            setTheme((previous) => ({ ...previous, radius }));
          }}
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
