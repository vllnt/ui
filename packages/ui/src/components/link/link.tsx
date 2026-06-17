import { forwardRef } from "react";

import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";

import { cn } from "../../lib/utils";

const linkVariants = cva(
  "inline-flex items-center gap-1 rounded-sm underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        default: "font-medium text-primary hover:underline",
        muted: "text-muted-foreground hover:text-foreground hover:underline",
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
 * @example
 * <Link href="/docs">Read the docs</Link>
 * <Link href="https://example.com" external>Visit example</Link>
 */
const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    {
      asChild = false,
      children,
      className,
      external = false,
      rel,
      showExternalIcon = true,
      target,
      variant,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "a";

    return (
      <Comp
        className={cn(linkVariants({ variant }), className)}
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
  },
);
Link.displayName = "Link";

export { Link, linkVariants };
