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
  };

/**
 * Body text whose family and scale come from theme-overridable tokens
 * (`--font-sans`, `--font-size-body*`). Polymorphic via `as` — the dynamic
 * element type means this primitive is not ref-forwarding; wrap it if you need
 * an imperative handle.
 *
 * @example
 * <Text size="lead" tone="muted">Intro copy</Text>
 */
const Text = ({
  as = "p",
  className,
  size,
  tone,
  weight,
  ...props
}: TextProps) => {
  const Component: React.ElementType = as;

  return (
    <Component
      className={cn(textVariants({ size, tone, weight }), className)}
      {...props}
    />
  );
};
Text.displayName = "Text";

export { Text };
