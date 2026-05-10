import {
  type AnchorHTMLAttributes,
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@vllnt/ui";

const navVariants = cva("grid w-full gap-3 text-sm sm:grid-cols-2", {
  defaultVariants: {
    variant: "with-title",
  },
  variants: {
    variant: {
      compact: "",
      "with-meta": "",
      "with-title": "",
    },
  },
});

const itemVariants = cva(
  "group flex flex-col gap-1 rounded-lg border border-border bg-background p-4 text-foreground transition-colors hover:border-foreground/30 hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  {
    defaultVariants: {
      side: "previous",
    },
    variants: {
      side: {
        next: "items-end text-right sm:col-start-2",
        previous: "items-start text-left",
      },
    },
  },
);

/**
 * Visual variant for {@link DocumentSiblingNav}.
 *
 * - `compact` — single-line caption and arrow, no title.
 * - `with-title` — caption plus the sibling document title (default).
 * - `with-meta` — caption, title, and an optional `meta` line (date, author, etc.).
 *
 * @public
 */
export type DocumentSiblingNavVariant = "compact" | "with-meta" | "with-title";

type AnchorPassthroughProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "title"
>;

/**
 * Per-side description for {@link DocumentSiblingNav}.
 *
 * @public
 */
export type DocumentSiblingNavLink = {
  /** Optional anchor props (rel, target, etc.) forwarded to the rendered `<a>`. */
  anchorProps?: AnchorPassthroughProps;
  /** Destination URL. */
  href: string;
  /** Optional secondary line shown when `variant="with-meta"`. */
  meta?: ReactNode;
  /** Title of the sibling document. */
  title: ReactNode;
};

type LabelDictionary = {
  /** Aria label for the wrapping `<nav>`. */
  navigation?: string;
  /** Caption above the next link. */
  next?: string;
  /** Caption above the previous link. */
  previous?: string;
};

/**
 * Props for {@link DocumentSiblingNav}.
 *
 * @public
 */
export type DocumentSiblingNavProps = {
  /** Localizable captions. */
  labels?: LabelDictionary;
  /** The next sibling, or `undefined` at the end of the series. */
  next?: DocumentSiblingNavLink;
  /** The previous sibling, or `undefined` at the start of the series. */
  previous?: DocumentSiblingNavLink;
} & Omit<ComponentPropsWithoutRef<"nav">, "title"> &
  VariantProps<typeof navVariants>;

const DEFAULT_LABELS = {
  navigation: "Document navigation",
  next: "Newer",
  previous: "Older",
} as const satisfies Required<LabelDictionary>;

type ItemProps = {
  ariaLabel: string;
  caption: string;
  link: DocumentSiblingNavLink;
  side: "next" | "previous";
  variant: DocumentSiblingNavVariant;
};

function SiblingItem({
  ariaLabel,
  caption,
  link,
  side,
  variant,
}: ItemProps): ReactNode {
  const { anchorProps, href, meta, title } = link;
  return (
    <a
      aria-label={ariaLabel}
      className={cn(itemVariants({ side }))}
      href={href}
      {...anchorProps}
    >
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {caption}
      </span>
      {variant === "compact" ? null : (
        <span className="line-clamp-2 text-sm font-semibold text-foreground group-hover:underline">
          {title}
        </span>
      )}
      {variant === "with-meta" && meta ? (
        <span className="text-xs text-muted-foreground">{meta}</span>
      ) : null}
    </a>
  );
}

function buildAriaLabel(
  caption: string,
  link: DocumentSiblingNavLink,
  variant: DocumentSiblingNavVariant,
): string {
  if (variant === "compact" || typeof link.title !== "string") {
    return caption;
  }
  return `${caption}: ${link.title}`;
}

/**
 * Sibling-document navigator. Renders previous / next links to the surrounding
 * items in an ordered series (e.g. newer/older blog post, prev/next doc page).
 * Pass `previous`, `next`, or both — the component returns `null` when both
 * are absent.
 *
 * Server-renderable — no client hooks required.
 *
 * @example
 * ```tsx
 * <DocumentSiblingNav
 *   previous={{ href: '/posts/foo', title: 'Foo post' }}
 *   next={{ href: '/posts/bar', title: 'Bar post' }}
 *   labels={{ previous: 'Older', next: 'Newer' }}
 * />
 * ```
 *
 * @public
 */
export const DocumentSiblingNav = forwardRef<
  HTMLElement,
  DocumentSiblingNavProps
>(({ className, labels, next, previous, variant, ...rest }, ref) => {
  if (!previous && !next) return null;

  const resolvedVariant: DocumentSiblingNavVariant = variant ?? "with-title";
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };

  return (
    <nav
      aria-label={resolvedLabels.navigation}
      className={cn(navVariants({ variant: resolvedVariant }), className)}
      ref={ref}
      {...rest}
    >
      {previous ? (
        <SiblingItem
          ariaLabel={buildAriaLabel(
            resolvedLabels.previous,
            previous,
            resolvedVariant,
          )}
          caption={resolvedLabels.previous}
          link={previous}
          side="previous"
          variant={resolvedVariant}
        />
      ) : (
        <span aria-hidden="true" />
      )}
      {next ? (
        <SiblingItem
          ariaLabel={buildAriaLabel(resolvedLabels.next, next, resolvedVariant)}
          caption={resolvedLabels.next}
          link={next}
          side="next"
          variant={resolvedVariant}
        />
      ) : (
        <span aria-hidden="true" />
      )}
    </nav>
  );
});
DocumentSiblingNav.displayName = "DocumentSiblingNav";

export { navVariants as documentSiblingNavVariants };
