"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useSyncExternalStore,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";
import { Command } from "lucide-react";

import { cn } from "../../../lib/utils";

const kbdVariants = cva(
  "inline-flex select-none items-center justify-center font-mono font-medium text-foreground [&>svg]:h-3 [&>svg]:w-3",
  {
    defaultVariants: {
      size: "md",
      variant: "default",
    },
    variants: {
      size: {
        lg: "h-7 min-w-[1.75rem] px-2 text-sm",
        md: "h-5 min-w-[1.25rem] px-1.5 text-xs",
        sm: "h-4 min-w-[1rem] px-1 text-[10px]",
      },
      variant: {
        bracket: "gap-0.5",
        default:
          "rounded border border-border bg-muted shadow-[0_1px_0_0_oklch(var(--border))]",
      },
    },
  },
);

const MAC_PLATFORM_PATTERN = /mac|iphone|ipad|ipod/i;

const COMMAND_GLYPH = "⌘";
const COMMAND_NAME = "Command";

const MODIFIER_LABELS: Record<
  "alt" | "ctrl" | "meta" | "mod" | "shift",
  { mac: string; other: string }
> = {
  alt: { mac: "⌥", other: "Alt" },
  ctrl: { mac: "⌃", other: "Ctrl" },
  meta: { mac: "⌘", other: "Win" },
  mod: { mac: "⌘", other: "Ctrl" },
  shift: { mac: "⇧", other: "Shift" },
};

const SPECIAL_KEY_LABELS: Record<string, string> = {
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  backspace: "⌫",
  delete: "⌦",
  enter: "↵",
  escape: "Esc",
  return: "↵",
  space: "Space",
  tab: "⇥",
};

const SHORTCUT_SEPARATOR = "+";

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return MAC_PLATFORM_PATTERN.test(navigator.userAgent);
}

function noopUnsubscribe(): void {
  return;
}

function subscribeNoop(): () => void {
  return noopUnsubscribe;
}

function getServerSnapshot(): boolean {
  return false;
}

function useIsMac(): boolean {
  return useSyncExternalStore(subscribeNoop, isMacPlatform, getServerSnapshot);
}

function isModifier(value: string): value is keyof typeof MODIFIER_LABELS {
  return Object.hasOwn(MODIFIER_LABELS, value);
}

function formatToken(token: string, mac: boolean): string {
  const lowered = token.toLowerCase();
  if (isModifier(lowered)) {
    const labels = MODIFIER_LABELS[lowered];
    return mac ? labels.mac : labels.other;
  }
  const special = SPECIAL_KEY_LABELS[lowered];
  if (special !== undefined) return special;
  return token.length === 1 ? token.toUpperCase() : token;
}

type KbdVariant = VariantProps<typeof kbdVariants>["variant"];

function describeLabel(label: string): string {
  return label === COMMAND_GLYPH ? COMMAND_NAME : label;
}

function renderLabel(label: string): ReactNode {
  if (label !== COMMAND_GLYPH) return label;
  return <Command aria-label={COMMAND_NAME} role="img" />;
}

function withBrackets(content: ReactNode, variant: KbdVariant): ReactNode {
  if (variant !== "bracket") return content;
  return (
    <>
      <span aria-hidden="true" className="text-muted-foreground">
        [
      </span>
      {content}
      <span aria-hidden="true" className="text-muted-foreground">
        ]
      </span>
    </>
  );
}

/**
 * Platform whose modifier labels a `shortcut` expands to. `auto` follows the
 * browser user agent.
 *
 * @public
 */
export type KbdPlatform = "auto" | "mac" | "win";

/**
 * Props for {@link Kbd}.
 *
 * @public
 */
export type KbdProps = {
  /** Optional explicit children. Takes precedence over `shortcut`. */
  children?: ReactNode;
  /**
   * Platform used to expand `shortcut` modifiers: `mac` renders the command
   * key as a vector icon, `win` renders `Ctrl` / `Win` text, and `auto`
   * (default) detects it from the user agent. Has no effect on `children`.
   */
  platform?: KbdPlatform;
  /**
   * Shortcut string in the form `"mod+k"` or `"ctrl+shift+p"`. The `mod`
   * token expands to the command icon on Mac and `Ctrl` elsewhere.
   */
  shortcut?: string;
} & ComponentPropsWithoutRef<"kbd"> &
  VariantProps<typeof kbdVariants>;

/**
 * Keyboard key indicator. Renders a single key when used with `children`,
 * or expands a shortcut string with platform-aware modifiers when given a
 * `shortcut` prop. The `bracket` variant drops the key cap and wraps each key
 * in decorative brackets.
 *
 * @example
 * ```tsx
 * <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
 *
 * {/* Renders the command icon + K on Mac, Ctrl + K elsewhere *\/}
 * <Kbd shortcut="mod+k" />
 *
 * {/* Force one platform, bracket style *\/}
 * <Kbd platform="win" shortcut="mod+k" variant="bracket" />
 * ```
 *
 * @public
 */
export const Kbd = ({
  children,
  className,
  platform = "auto",
  ref,
  shortcut,
  size,
  variant,
  ...rest
}: KbdProps & { ref?: React.Ref<HTMLElement> }) => {
  const detectedMac = useIsMac();
  const isMac = platform === "auto" ? detectedMac : platform === "mac";
  const keyClassName = cn(kbdVariants({ size, variant }), className);

  if (children !== undefined) {
    return (
      <kbd className={keyClassName} ref={ref} {...rest}>
        {withBrackets(children, variant)}
      </kbd>
    );
  }

  if (shortcut) {
    // Split on "+" and trim, instead of a whitespace-greedy regex that
    // backtracks polynomially on long runs of spaces.
    const tokens = shortcut
      .split(SHORTCUT_SEPARATOR)
      .map((token) => token.trim())
      .filter(Boolean);
    const keys = tokens.map((token) => ({
      label: formatToken(token, isMac),
      token,
    }));
    return (
      <span
        aria-label={keys.map(({ label }) => describeLabel(label)).join(" + ")}
        className="inline-flex items-center gap-1"
        role="img"
      >
        {keys.map(({ label, token }, index) => (
          <kbd
            className={keyClassName}
            key={`${token}-${index.toString()}`}
            ref={index === 0 ? ref : undefined}
            {...(index === 0 ? rest : {})}
          >
            {withBrackets(renderLabel(label), variant)}
          </kbd>
        ))}
      </span>
    );
  }

  return <kbd className={keyClassName} ref={ref} {...rest} />;
};
Kbd.displayName = "Kbd";

export { kbdVariants };
