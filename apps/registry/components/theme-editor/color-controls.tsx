"use client";

import { hexToOklchChannels, oklchChannelsToHex } from "@/lib/oklch";
import { THEME_TOKENS, type ThemeColors } from "@/lib/theme-tokens";

const RADIUS_OPTIONS = ["0rem", "0.25rem", "0.5rem", "0.75rem", "1rem"];

type ColorControlsProps = {
  readonly colors: ThemeColors;
  readonly onColorChange: (name: string, channels: string) => void;
  readonly onRadiusChange: (radius: string) => void;
  readonly radius: string;
};

function ColorRow({
  channels,
  label,
  name,
  onChange,
}: {
  readonly channels: string;
  readonly label: string;
  readonly name: string;
  readonly onChange: (name: string, channels: string) => void;
}) {
  const inputId = `color-${name}`;
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-border px-3 py-2">
      <label className="text-sm font-medium" htmlFor={inputId}>
        {label}
      </label>
      <div className="flex items-center gap-2">
        <code className="text-xs text-muted-foreground">{channels}</code>
        <input
          aria-label={label}
          className="size-7 cursor-pointer rounded border border-border bg-transparent"
          id={inputId}
          onChange={(event) => {
            onChange(name, hexToOklchChannels(event.target.value));
          }}
          type="color"
          value={oklchChannelsToHex(channels)}
        />
      </div>
    </div>
  );
}

/** Per-token color pickers plus a border-radius selector. */
export function ColorControls({
  colors,
  onColorChange,
  onRadiusChange,
  radius,
}: ColorControlsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <span className="text-sm font-semibold">Border radius</span>
        <div className="flex flex-wrap gap-2">
          {RADIUS_OPTIONS.map((option) => (
            <button
              aria-pressed={option === radius}
              className="rounded-md border border-border px-3 py-1 text-xs aria-[pressed=true]:border-foreground aria-[pressed=true]:bg-accent"
              key={option}
              onClick={() => {
                onRadiusChange(option);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {THEME_TOKENS.map((token) => (
          <ColorRow
            channels={colors[token.name] ?? ""}
            key={token.name}
            label={token.label}
            name={token.name}
            onChange={onColorChange}
          />
        ))}
      </div>
    </div>
  );
}
