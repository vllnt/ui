"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

import {
  Button,
  isThemePresetName,
  setCustomTheme,
  setThemePreset,
} from "@vllnt/ui";
import { useTranslations } from "next-intl";

import type { EditorPreset } from "@/lib/editor-presets";
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

function readActiveTheme(
  presets: readonly EditorPreset[],
): ThemeData | undefined {
  const active = document.documentElement.dataset.theme;
  if (active && active !== "custom") {
    const preset = presets.find((item) => item.name === active);
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

type RestoredTheme = {
  /** True when the theme came from the `?t=` token; the editor applies it site-wide. */
  readonly fromUrl: boolean;
  readonly theme: ThemeData;
};

function readRestoredTheme(
  presets: readonly EditorPreset[],
): RestoredTheme | undefined {
  const fromUrl = new URLSearchParams(window.location.search).get("t");
  const urlTheme = fromUrl ? decodeTheme(fromUrl) : undefined;
  if (urlTheme) {
    return { fromUrl: true, theme: urlTheme };
  }
  const restored = readActiveTheme(presets);
  return restored ? { fromUrl: false, theme: restored } : undefined;
}

function noopUnsubscribe() {
  return;
}

function subscribeToStaticValue() {
  return noopUnsubscribe;
}

function getServerRestoredTheme(): RestoredTheme | undefined {
  return undefined;
}

/**
 * Interactive theme editor. Picking a preset or editing a token re-themes the
 * entire site live (and persists across navigation); the controls also drive
 * the export panel and a focused preview of the chosen mode.
 */
export function ThemeEditor({
  presets,
}: {
  readonly presets: readonly EditorPreset[];
}) {
  const t = useTranslations("pages.themes.editor");
  // Presets are static per page; read them once on mount like the old module constant.
  const initialPresets = useRef(presets);
  const restoredCache = useRef<{ value?: RestoredTheme }>(undefined);
  /* Reads the theme to restore (URL token, then active preset or saved token)
     once per mount. The server snapshot is empty, so the server and the
     hydrating client render the default theme and the restored one follows. */
  const getRestoredTheme = useCallback((): RestoredTheme | undefined => {
    restoredCache.current ??= {
      value: readRestoredTheme(initialPresets.current),
    };
    return restoredCache.current.value;
  }, []);
  const restored = useSyncExternalStore(
    subscribeToStaticValue,
    getRestoredTheme,
    getServerRestoredTheme,
  );
  const [editedTheme, setEditedTheme] = useState<ThemeData>();
  const theme = editedTheme ?? restored?.theme ?? DEFAULT_THEME;
  const [mode, setMode] = useState<ThemeMode>("dark");
  const persistedTheme = useRef<ThemeData>(DEFAULT_THEME);

  useEffect(() => {
    if (restored?.fromUrl) {
      setCustomTheme(restored.theme);
    }
  }, [restored]);

  useEffect(() => {
    // Persist every change away from the theme last rendered (initially the default).
    if (theme === persistedTheme.current) {
      return;
    }
    persistedTheme.current = theme;
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
    // Keep the local DEFAULT_THEME identity: "Default" on a fresh editor is a no-op.
    setEditedTheme(preset.name === "default" ? DEFAULT_THEME : preset.theme);
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
    setEditedTheme(next);
    setCustomTheme(next);
  };

  const updateRadius = (radius: string): void => {
    const next: ThemeData = { ...theme, radius };
    setEditedTheme(next);
    setCustomTheme(next);
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,28rem)]">
      <div className="min-w-0 space-y-6">
        <div className="space-y-2">
          <span className="text-sm font-semibold">{t("theme")}</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
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
              setEditedTheme(DEFAULT_THEME);
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
