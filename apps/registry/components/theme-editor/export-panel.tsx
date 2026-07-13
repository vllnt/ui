"use client";

import { useMemo, useState, useSyncExternalStore } from "react";

import { Button } from "@vllnt/ui";
import { useTranslations } from "next-intl";

import {
  themeInstallUrl,
  themeToCss,
  themeToTokensJson,
} from "@/lib/theme-serialize";
import type { ThemeData } from "@/lib/theme-tokens";

type ExportTab = "cli" | "css" | "json";

type ExportPanelProps = {
  readonly theme: ThemeData;
};

const TABS: { id: ExportTab; label: string }[] = [
  { id: "css", label: "CSS" },
  { id: "cli", label: "shadcn CLI" },
  { id: "json", label: "tokens.json" },
];

const unsubscribeNoop = (): void => undefined;
const subscribeNever = (): (() => void) => unsubscribeNoop;

function useOrigin(): string {
  return useSyncExternalStore(
    subscribeNever,
    () => window.location.origin,
    () => "https://ui.vllnt.com",
  );
}

function download(filename: string, content: string): void {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
}

/** Copy/download the theme as CSS, a shadcn CLI command, or tokens.json. */
export function ExportPanel({ theme }: ExportPanelProps) {
  const t = useTranslations("pages.themes.editor");
  const [tab, setTab] = useState<ExportTab>("css");
  const [copied, setCopied] = useState(false);
  const origin = useOrigin();

  const css = useMemo(() => themeToCss(theme), [theme]);
  const json = useMemo(
    () => JSON.stringify(themeToTokensJson(theme), null, 2),
    [theme],
  );
  const cli = useMemo(
    () => `npx shadcn@latest add ${themeInstallUrl(origin, theme)}`,
    [origin, theme],
  );

  const value = tab === "css" ? css : tab === "json" ? json : cli;

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch {
      /* clipboard blocked (insecure context or denied permission) */
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((item) => (
          <button
            aria-pressed={item.id === tab}
            className="rounded-md border border-border px-3 py-1 text-xs aria-[pressed=true]:border-foreground aria-[pressed=true]:bg-accent"
            key={item.id}
            onClick={() => {
              setTab(item.id);
            }}
            type="button"
          >
            {item.label}
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <Button onClick={copy} size="sm" variant="outline">
            {copied ? t("copied") : t("copy")}
          </Button>
          {tab === "cli" ? undefined : (
            <Button
              onClick={() => {
                download(tab === "css" ? "theme.css" : "tokens.json", value);
              }}
              size="sm"
              variant="outline"
            >
              {t("download")}
            </Button>
          )}
        </div>
      </div>
      <pre className="max-h-80 overflow-auto rounded-md border border-border bg-muted/30 p-4 text-xs leading-relaxed">
        <code>{value}</code>
      </pre>
    </div>
  );
}
