"use client";

import type { KeyboardEvent } from "react";

import { moveRovingFocus } from "../../../lib/roving-focus";
import { useMounted } from "../../../lib/use-mounted";
import { useThemePreset } from "../../../lib/use-theme-preset";
import { cn } from "../../../lib/utils";

export type ThemeSwitcherProps = {
  readonly className?: string;
};

function handleRadioKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
  moveRovingFocus(event, '[role="radio"]', {
    activate: true,
    orientation: "both",
  });
}

/**
 * A compact swatch row for switching between built-in theme presets. Reads and
 * writes the active preset through {@link useThemePreset}, so it stays in sync
 * with every other consumer on the page.
 *
 * Keyboard follows the WAI-ARIA APG radio group pattern: one tab stop on the
 * checked preset; arrow keys move focus and apply the next / previous preset.
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const mounted = useMounted();
  const { preset, presets, setPreset } = useThemePreset();
  const hasChecked = mounted && presets.some((item) => item.name === preset);

  return (
    <div
      aria-label="Theme preset"
      className={cn("flex items-center gap-1.5", className)}
      onKeyDown={handleRadioKeyDown}
      role="radiogroup"
      tabIndex={-1}
    >
      {presets.map((item, index) => {
        const active = mounted && preset === item.name;
        return (
          <button
            aria-checked={active}
            aria-label={item.label}
            className={cn(
              "size-6 rounded-full border transition-transform hover:scale-110",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-foreground ring-2 ring-ring ring-offset-2 ring-offset-background"
                : "border-border",
            )}
            key={item.name}
            onClick={() => {
              setPreset(item.name);
            }}
            role="radio"
            style={{ backgroundColor: item.swatch }}
            tabIndex={active || (!hasChecked && index === 0) ? 0 : -1}
            title={item.label}
            type="button"
          />
        );
      })}
    </div>
  );
}
