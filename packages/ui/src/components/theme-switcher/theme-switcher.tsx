"use client";

import { useMounted } from "../../lib/use-mounted";
import { useThemePreset } from "../../lib/use-theme-preset";
import { cn } from "../../lib/utils";

export type ThemeSwitcherProps = {
  readonly className?: string;
};

/**
 * A compact swatch row for switching between built-in theme presets. Reads and
 * writes the active preset through {@link useThemePreset}, so it stays in sync
 * with every other consumer on the page.
 */
export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const mounted = useMounted();
  const { preset, presets, setPreset } = useThemePreset();

  return (
    <div
      aria-label="Theme preset"
      className={cn("flex items-center gap-1.5", className)}
      role="radiogroup"
    >
      {presets.map((item) => {
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
            title={item.label}
            type="button"
          />
        );
      })}
    </div>
  );
}
