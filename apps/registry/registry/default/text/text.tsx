import { createElement } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@vllnt/ui";

/**
 * Body-text scale for the {@link Text} primitive. Exposed so consumers can
 * compose the same token-driven styles onto bespoke elements.
 */
export const textVariants = cva(
  "font-[family-name:var(--font-sans)] text-foreground",
  {
    defaultVariants: {
      size: "base",
      tone: "default",
      weight: "normal",
    },
    variants: {
      size: {
        base: "text-[length:var(--font-size-body)] leading-[var(--line-height-body)]",
        caption:
          "text-[length:var(--font-size-caption)] leading-[var(--line-height-caption)]",
        lead: "text-[length:var(--font-size-body-lg)] leading-[var(--line-height-body-lg)]",
        small:
          "text-[length:var(--font-size-body-sm)] leading-[var(--line-height-body-sm)]",
      },
      tone: {
        default: "",
        muted: "text-muted-foreground",
      },
      weight: {
        medium: "font-medium",
        normal: "font-normal",
        semibold: "font-semibold",
      },
    },
  },
);

/** HTML element the {@link Text} primitive renders as. */
export type TextElement = "div" | "label" | "p" | "span";

/** Props for {@link Text}. */
export type TextProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    as?: TextElement;
    ref?: React.Ref<HTMLElement>;
  };

/**
 * Body text whose family, scale, and weight come from theme-overridable tokens
 * (`--font-sans`, `--font-size-body*`). Polymorphic via `as`. Forwards `ref` to
 * the rendered element.
 *
 * Use `tone="muted"` on the default `background`; on `muted`/`card` surfaces the
 * muted foreground can fall below WCAG AA contrast for body text.
 *
 * @example
 * <Text size="lead" tone="muted">Intro copy</Text>
 */
const Text = ({
  as = "p",
  className,
  ref,
  size,
  tone,
  weight,
  ...props
}: TextProps) =>
  createElement(as, {
    className: cn(textVariants({ size, tone, weight }), className),
    ref,
    ...props,
  });
Text.displayName = "Text";

export { Text };
