import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";

import { cn } from "../../../lib/utils";

const linkVariants = cva(
  "inline-flex items-center gap-1 rounded-sm underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "",
        lg: "h-control-xs px-1 text-sm",
        sm: "text-xs",
      },
      variant: {
        default: "font-medium text-primary hover:underline",
        foreground: "text-foreground hover:underline",
        muted: "text-muted-foreground hover:text-foreground hover:underline",
        skip: "sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:h-11 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-4 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-md",
        underline: "font-medium text-primary underline hover:text-primary/80",
      },
    },
  },
);

/** Props for the {@link Link} component. */
export type LinkProps = {
  /** Render the styles onto the single child element instead of an `<a>`. */
  asChild?: boolean;
  /**
   * Treat the link as external: opens in a new tab, applies safe `rel`, and
   * appends an external-link icon (unless `showExternalIcon` is `false`).
   */
  external?: boolean;
  /** Show the external-link affordance icon for external links. */
  showExternalIcon?: boolean;
} & React.AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof linkVariants>;

/**
 * Styled anchor with selectable emphasis and an external-link affordance.
 * Composes onto custom routing components via `asChild`.
 *
 * `size="lg"` is the bar link: 14 px label, 4 px side padding, and a height
 * from `--size-control-xs` (32 px, 44 px under `@media (pointer: coarse)`).
 * `variant="foreground"` takes the ink colour with no primary. `variant="skip"`
 * is a skip-to-content link: visually hidden until it takes focus, then shown
 * at the top left, 44 px high, above other content. Point it at the main
 * landmark with `href="#main"`.
 * @example
 * <Link href="/docs">Read the docs</Link>
 * <Link href="https://example.com" external>Visit example</Link>
 * <Link href="#main" variant="skip">Skip to content</Link>
 */
const Link = ({
  asChild = false,
  children,
  className,
  external = false,
  ref,
  rel,
  showExternalIcon = true,
  size,
  target,
  variant,
  ...props
}: LinkProps & { ref?: React.Ref<HTMLAnchorElement> }) => {
  const Comp = asChild ? Slot : "a";

  return (
    <Comp
      className={cn(linkVariants({ size, variant }), className)}
      ref={ref}
      rel={external ? (rel ?? "noreferrer noopener") : rel}
      target={external ? (target ?? "_blank") : target}
      {...props}
    >
      {asChild ? (
        children
      ) : (
        <>
          {children}
          {external && showExternalIcon ? (
            <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
          ) : null}
        </>
      )}
    </Comp>
  );
};
Link.displayName = "Link";

export { Link, linkVariants };
