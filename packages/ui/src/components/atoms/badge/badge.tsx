import { cva, type VariantProps } from "class-variance-authority";

import { isStatusTone, statusDotVariants } from "../../../lib/status-dot";
import { cn } from "../../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    compoundVariants: [
      {
        class:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        tone: "danger-solid",
      },
      {
        class:
          "border-destructive/30 bg-destructive/10 text-foreground hover:bg-destructive/15",
        tone: "danger-tint",
      },
      {
        class:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        tone: "solid",
      },
      { border: "none", class: "border-transparent" },
      { border: "strong", class: "border-foreground" },
    ],
    defaultVariants: {
      dot: false,
      size: "default",
      variant: "default",
    },
    variants: {
      border: {
        none: "",
        strong: "",
      },
      dot: {
        false: "",
        true: "gap-1.5",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        header: "px-3 py-1 text-sm",
        inline: "px-1.5 py-0 text-[10px] leading-4",
        sm: "px-2 py-0 text-[11px] leading-[1.125rem]",
      },
      tone: {
        danger: "",
        "danger-solid": "",
        "danger-tint": "",
        info: "",
        neutral: "",
        primary: "",
        solid: "",
        success: "",
        warning: "",
      },
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        soft: "border-transparent bg-muted text-foreground hover:bg-secondary/80",
      },
    },
  },
);

type BadgeStyle = VariantProps<typeof badgeVariants>;

/**
 * Props for {@link Badge}.
 *
 * `variant`, `tone`, `size` and `border` are the Penpot library axes `Variant`,
 * `Tone`, `Size` and `Border`, with the same values. A Penpot Badge instance
 * maps to these props one to one. `dot` shows the Penpot `Dot` layer.
 *
 * @public
 */
export type BadgeProps = {
  /**
   * Border weight. Omit it to keep the border the `variant` draws (a hairline
   * on `outline`, none on the filled variants). `"none"` removes the border;
   * `"strong"` draws a full-contrast 1px border.
   */
  border?: BadgeStyle["border"];
  /**
   * Show a leading status dot. The dot is decorative (`aria-hidden`), so the
   * label has to say the status in words: colour never carries it alone.
   * The dot takes its colour from `tone`. Without a `tone` it follows the
   * label colour.
   */
  dot?: boolean;
  /**
   * Chip size: `"default"` (12px label), `"header"` (14px, for page headers),
   * `"inline"` (10px, sits in running text without growing the line) or
   * `"sm"` (11px, for dense lists and tables).
   */
  size?: BadgeStyle["size"];
  /**
   * Meaning of the chip, matching the Penpot `Tone` axis.
   *
   * - `"neutral"`, `"primary"`, `"info"`, `"success"`, `"warning"` and
   *   `"danger"` put the colour on the dot. The label stays foreground and the
   *   surface stays neutral. When `variant` is not set, these tones use the
   *   `"secondary"` surface.
   * - `"solid"`, `"danger-solid"` and `"danger-tint"` set their own surface
   *   (filled primary, filled destructive, tinted destructive) and override
   *   `variant`. `"danger-tint"` is the single tinted surface; use it when a
   *   failure has to stand out from a row of neutral chips. Its label stays
   *   foreground (status colour never goes on words); the tint, the border and
   *   the dot carry the colour.
   *
   * Omit `tone` to get the plain `variant` look.
   */
  tone?: BadgeStyle["tone"];
  /**
   * Surface of the chip: `"default"` (filled primary), `"secondary"`,
   * `"soft"` (muted) or `"outline"`.
   *
   * `"destructive"` still works, but new code should use
   * `tone="danger-solid"`, or `tone="danger"` with a dot for a calmer chip.
   */
  variant?: BadgeStyle["variant"];
} & React.HTMLAttributes<HTMLSpanElement>;

/**
 * Small status label.
 *
 * For a status chip, set a `tone` and a `dot`: the dot carries the status
 * colour and the label stays foreground on a neutral surface.
 *
 * @example
 * ```tsx
 * <Badge dot tone="success">Active</Badge>
 * <Badge dot size="sm" tone="warning" variant="outline">Past due</Badge>
 * ```
 *
 * @public
 */
function Badge({
  border,
  children,
  className,
  dot = false,
  ref,
  size,
  tone,
  variant,
  ...props
}: BadgeProps & { ref?: React.Ref<HTMLSpanElement> }): React.ReactElement {
  const statusTone = isStatusTone(tone) ? tone : undefined;
  const surface = variant ?? (statusTone ? "secondary" : "default");
  const dotTone = tone === "danger-tint" ? "danger" : statusTone;
  return (
    <span
      className={cn(
        badgeVariants({ border, dot, size, tone, variant: surface }),
        className,
      )}
      ref={ref}
      {...props}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={statusDotVariants({ tone: dotTone })}
          data-badge-dot=""
        />
      ) : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
