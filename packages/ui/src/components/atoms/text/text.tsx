import { createElement } from "react";

import { cn } from "../../../lib/utils";
import { cva, type VariantProps } from "../../../lib/variants";

/**
 * Body-text scale for the {@link Text} primitive. Exposed so consumers can
 * compose the same token-driven styles onto bespoke elements.
 */
export const textVariants = cva("text-foreground", {
  defaultVariants: {
    family: "sans",
    size: "base",
    tone: "default",
    weight: "normal",
  },
  variants: {
    family: {
      mono: "font-[family-name:var(--font-mono)]",
      sans: "font-[family-name:var(--font-sans)]",
    },
    measure: {
      narrow: "max-w-[var(--size-measure-narrow)]",
      prose: "max-w-[var(--size-measure-prose)]",
    },
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
});

/** HTML element the {@link Text} primitive renders as. */
export type TextElement = "dd" | "div" | "dt" | "label" | "li" | "p" | "span";

/** Props for {@link Text}. */
export type TextProps = React.HTMLAttributes<HTMLElement> &
  VariantProps<typeof textVariants> & {
    as?: TextElement;
    ref?: React.Ref<HTMLElement>;
  };

/**
 * Body text whose family, scale, and weight come from theme-overridable tokens
 * (`--font-sans` or `--font-mono`, `--font-size-body*`). Polymorphic via `as`.
 * Forwards `ref` to the rendered element.
 *
 * `family="mono"` sets the same scale in the mono family (JetBrains Mono by
 * default): `size="base"` is 16/1.6 and `size="lead"` 18/1.7.
 *
 * `measure` caps the line length with a token: `prose` is `--size-measure-prose`
 * (720 px) for lead copy and descriptions, `narrow` is `--size-measure-narrow`
 * (480 px). Unset, the text fills its container.
 *
 * `as` also takes `dt`, `dd` and `li`, for key/value lists and prose lists. They
 * need a `dl` or `ul`/`ol` parent, which the caller renders.
 *
 * Use `tone="muted"` on the default `background`; on `muted`/`card` surfaces the
 * muted foreground can fall below WCAG AA contrast for body text.
 *
 * @example
 * <Text size="lead" tone="muted">Intro copy</Text>
 * <Text family="mono" size="lead">Mono intro copy</Text>
 * <Text measure="prose" size="lead">Lead copy capped at 720 px</Text>
 * <dl>
 *   <Text as="dt" size="small" tone="muted">Region</Text>
 *   <Text as="dd" size="small" weight="medium">Paris</Text>
 * </dl>
 */
const Text = ({
  as = "p",
  className,
  family,
  measure,
  ref,
  size,
  tone,
  weight,
  ...props
}: TextProps) =>
  createElement(as, {
    className: cn(
      textVariants({ family, measure, size, tone, weight }),
      className,
    ),
    ref,
    ...props,
  });
Text.displayName = "Text";

export { Text };
