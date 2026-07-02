import { cn } from "@vllnt/ui";

/** Heading level 1–6. Drives both the semantic element and the scale step. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/** Props for {@link Heading}. */
export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  /** Semantic rank — renders `h1`–`h6`, plus its scale step unless `size` overrides it. */
  level?: HeadingLevel;
  ref?: React.Ref<HTMLHeadingElement>;
  /**
   * Visual scale step, decoupled from the semantic `level`. Defaults to `level`.
   * Use it to keep a correct document outline while matching a design — e.g.
   * `<Heading level={2} size={1}>` is an `h2` rendered at h1 size.
   */
  size?: HeadingLevel;
};

const headingTag = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

const headingSize = {
  1: "text-[length:var(--font-size-h1)] leading-[var(--line-height-h1)]",
  2: "text-[length:var(--font-size-h2)] leading-[var(--line-height-h2)]",
  3: "text-[length:var(--font-size-h3)] leading-[var(--line-height-h3)]",
  4: "text-[length:var(--font-size-h4)] leading-[var(--line-height-h4)]",
  5: "text-[length:var(--font-size-h5)] leading-[var(--line-height-h5)]",
  6: "text-[length:var(--font-size-h6)] leading-[var(--line-height-h6)]",
} as const;

const headingBase =
  "font-[family-name:var(--font-display)] [font-weight:var(--font-weight-heading)] text-balance tracking-tight text-foreground";

/**
 * Semantic heading that reads its font family, weight, and size from
 * theme-overridable design tokens (`--font-display`, `--font-weight-heading`,
 * `--font-size-h{n}`). `level` sets the element (`h1`–`h6`); `size` overrides
 * the visual scale step (defaults to `level`), so a brand restyles every heading
 * by overriding tokens — no fork.
 *
 * @example
 * <Heading level={1}>Page title</Heading>
 * @example
 * <Heading level={2} size={1}>An h2 sized like an h1</Heading>
 */
const Heading = ({
  className,
  level = 2,
  ref,
  size,
  ...props
}: HeadingProps) => {
  const Tag = headingTag[level];

  return (
    <Tag
      className={cn(headingBase, headingSize[size ?? level], className)}
      ref={ref}
      {...props}
    />
  );
};
Heading.displayName = "Heading";

export { Heading };
