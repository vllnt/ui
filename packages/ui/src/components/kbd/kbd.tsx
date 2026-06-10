"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
  useSyncExternalStore,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

const kbdVariants = cva(
  "inline-flex select-none items-center justify-center rounded border border-border bg-muted font-mono font-medium text-foreground shadow-[0_1px_0_0_oklch(var(--border))] [&>svg]:h-3 [&>svg]:w-3",
  {
    defaultVariants: {
      size: "md",
    },
    variants: {
      size: {
        lg: "h-7 min-w-[1.75rem] px-2 text-sm",
        md: "h-5 min-w-[1.25rem] px-1.5 text-xs",
        sm: "h-4 min-w-[1rem] px-1 text-[10px]",
      },
    },
  },
);

const MAC_PLATFORM_PATTERN = /mac|iphone|ipad|ipod/i;

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

const SHORTCUT_SEPARATOR = /\s*\+\s*/;

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

/**
 * Props for {@link Kbd}.
 *
 * @public
 */
export type KbdProps = {
  /** Optional explicit children. Takes precedence over `shortcut`. */
  children?: ReactNode;
  /**
   * Shortcut string in the form `"mod+k"` or `"ctrl+shift+p"`. The `mod`
   * token expands to `⌘` on Mac and `Ctrl` elsewhere.
   */
  shortcut?: string;
} & ComponentPropsWithoutRef<"kbd"> &
  VariantProps<typeof kbdVariants>;

/**
 * Keyboard key indicator. Renders a single key when used with `children`,
 * or expands a shortcut string with platform-aware modifiers when given a
 * `shortcut` prop.
 *
 * @example
 * ```tsx
 * <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>
 *
 * {/* Renders ⌘+K on Mac, Ctrl+K elsewhere *\/}
 * <Kbd shortcut="mod+k" />
 * ```
 *
 * @public
 */
export const Kbd = forwardRef<HTMLElement, KbdProps>(
  ({ children, className, shortcut, size, ...rest }, ref) => {
    const isMac = useIsMac();

    if (children !== undefined) {
      return (
        <kbd
          className={cn(kbdVariants({ size }), className)}
          ref={ref}
          {...rest}
        >
          {children}
        </kbd>
      );
    }

    if (shortcut) {
      const tokens = shortcut.split(SHORTCUT_SEPARATOR).filter(Boolean);
      const ariaLabel = tokens
        .map((token) => formatToken(token, isMac))
        .join(" + ");
      return (
        <span aria-label={ariaLabel} className="inline-flex items-center gap-1">
          {tokens.map((token, index) => (
            <kbd
              className={cn(kbdVariants({ size }), className)}
              key={`${token}-${index.toString()}`}
              ref={index === 0 ? ref : undefined}
              {...(index === 0 ? rest : {})}
            >
              {formatToken(token, isMac)}
            </kbd>
          ))}
        </span>
      );
    }

    return (
      <kbd
        className={cn(kbdVariants({ size }), className)}
        ref={ref}
        {...rest}
      />
    );
  },
);
Kbd.displayName = "Kbd";

export { kbdVariants };
