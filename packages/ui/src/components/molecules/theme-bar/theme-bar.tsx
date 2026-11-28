"use client";

import { useId } from "react";

import { useTheme } from "next-themes";

import { named } from "../../../lib/named";
import { PAGE_COLUMN } from "../../../lib/shell-layout";
import { useMounted } from "../../../lib/use-mounted";
import { cn } from "../../../lib/utils";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "../../atoms/segmented-control/segmented-control";

const OPTIONS = ["light", "dark", "system"] as const;
type ThemeOption = (typeof OPTIONS)[number];

/** Props for {@link ThemeBar}. */
export type ThemeBarProps = {
  /** Names the control and shows as its caption. */
  label: string;
  /** The text of each choice. */
  options: Record<ThemeOption, string>;
};

function isThemeOption(value: string): value is ThemeOption {
  return (OPTIONS as readonly string[]).includes(value);
}

/**
 * Hug width, a hairline border on the page colour, and items that keep the
 * 44 px target with a coarse pointer.
 */
const CONTROL_CLASS = "border-border bg-background p-[3px]";
const ITEM_CLASS =
  "min-h-9 border border-transparent bg-transparent px-[11px] data-[state=on]:border-border data-[state=on]:shadow-none [@media(pointer:coarse)]:min-h-target";

/**
 * The theme control of a site: a caption and a segmented control with light,
 * dark and system. It reads and sets the theme through `next-themes`, so it
 * needs a theme provider above it (`SiteFrame` has one). It sits in a page
 * column.
 *
 * The stored theme is unknown on the server, so the control renders unset and
 * inert until mount: same box, no hydration mismatch, no layout shift.
 *
 * @example
 * <ThemeBar
 *   label="Theme"
 *   options={{ dark: "Dark", light: "Light", system: "System" }}
 * />
 */
const ThemeBar = /* @__PURE__ */ named(
  "ThemeBar",
  ({ label, options }: ThemeBarProps): React.ReactElement => {
    const { setTheme, theme } = useTheme();
    const mounted = useMounted();
    const labelId = useId();

    return (
      <div className={cn(PAGE_COLUMN, "flex items-center gap-3 pb-8")}>
        <p className="m-0 flex-1 text-xs text-muted-foreground" id={labelId}>
          {label}
        </p>
        <SegmentedControl
          aria-hidden={mounted ? undefined : true}
          aria-labelledby={labelId}
          className={CONTROL_CLASS}
          fit
          inert={!mounted}
          onValueChange={(value) => {
            if (isThemeOption(value)) setTheme(value);
          }}
          size="lg"
          value={mounted ? (theme ?? "system") : ""}
          variant="hairline"
        >
          {OPTIONS.map((option) => (
            <SegmentedControlItem
              className={ITEM_CLASS}
              key={option}
              value={option}
            >
              {options[option]}
            </SegmentedControlItem>
          ))}
        </SegmentedControl>
      </div>
    );
  },
);

export { ThemeBar };
