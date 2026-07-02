import { createElement } from "react";

import { cn } from "@vllnt/ui";

/** HTML element the {@link Display} primitive renders as. */
export type DisplayElement = "div" | "h1" | "h2" | "p" | "span";

/** Props for {@link Display}. */
export type DisplayProps = React.HTMLAttributes<HTMLElement> & {
  /**
   * Play a rise-in reveal on mount. Automatically disabled when the user
   * requests reduced motion (`prefers-reduced-motion`).
   */
  animated?: boolean;
  as?: DisplayElement;
  ref?: React.Ref<HTMLElement>;
};

const displayBase =
  "font-[family-name:var(--font-display)] [font-weight:var(--font-weight-display)] text-[length:var(--font-size-display)] leading-[var(--line-height-display)] text-balance tracking-tight text-foreground";

/**
 * Oversized hero/display text driven by the display tokens (`--font-display`,
 * `--font-weight-display`, `--font-size-display`). Renders a non-semantic `div`
 * by default — pass `as="h1"` for a hero heading. With `animated`, a rise-in
 * reveal runs when the user permits motion; `prefers-reduced-motion` skips it.
 * Polymorphic via `as`; forwards `ref` to the rendered element.
 *
 * @example
 * <Display as="h1" animated>Ship faster</Display>
 */
const Display = ({
  animated = false,
  as = "div",
  className,
  ref,
  ...props
}: DisplayProps) =>
  createElement(as, {
    className: cn(
      displayBase,
      animated &&
        "motion-safe:animate-[vllnt-animated-text-reveal_0.6s_ease-out_both]",
      className,
    ),
    ref,
    ...props,
  });
Display.displayName = "Display";

export { Display };
