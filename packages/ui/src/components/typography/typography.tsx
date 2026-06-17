import { forwardRef } from "react";

import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../../lib/utils";

/**
 * Shared typographic scale for the semantic text primitives. Exposed so
 * consumers can compose the same styles onto bespoke elements.
 */
export const typographyVariants = cva("", {
  defaultVariants: {
    variant: "p",
  },
  variants: {
    variant: {
      blockquote: "mt-6 border-l-2 border-border pl-6 italic text-foreground",
      h1: "scroll-m-20 text-4xl font-extrabold tracking-tight text-balance lg:text-5xl",
      h2: "scroll-m-20 border-b border-border pb-2 text-3xl font-semibold tracking-tight first:mt-0",
      h3: "scroll-m-20 text-2xl font-semibold tracking-tight",
      h4: "scroll-m-20 text-xl font-semibold tracking-tight",
      inlineCode:
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground",
      lead: "text-xl text-muted-foreground",
      list: "my-6 ml-6 list-disc [&>li]:mt-2",
      muted: "text-sm text-muted-foreground",
      p: "leading-7 [&:not(:first-child)]:mt-6",
    },
  },
});

/** Variant key accepted by {@link typographyVariants}. */
export type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>["variant"]
>;

/** Props for a heading-level typographic primitive. */
export type HeadingProps = React.HTMLAttributes<HTMLHeadingElement>;

/** Props for a paragraph-level typographic primitive. */
export type ParagraphProps = React.HTMLAttributes<HTMLParagraphElement>;

/** Props for the blockquote primitive. */
export type BlockquoteProps = React.BlockquoteHTMLAttributes<HTMLQuoteElement>;

/** Props for the inline code primitive. */
export type InlineCodeProps = React.HTMLAttributes<HTMLElement>;

/** Props for the unordered list primitive. */
export type ListProps = React.HTMLAttributes<HTMLUListElement>;

/**
 * Top-level page heading.
 * @example
 * <H1>Page title</H1>
 */
const H1 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, className, ...props }, ref) => (
    <h1
      className={cn(typographyVariants({ variant: "h1" }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </h1>
  ),
);
H1.displayName = "H1";

/** Section heading. */
const H2 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, className, ...props }, ref) => (
    <h2
      className={cn(typographyVariants({ variant: "h2" }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </h2>
  ),
);
H2.displayName = "H2";

/** Subsection heading. */
const H3 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, className, ...props }, ref) => (
    <h3
      className={cn(typographyVariants({ variant: "h3" }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </h3>
  ),
);
H3.displayName = "H3";

/** Minor heading. */
const H4 = forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ children, className, ...props }, ref) => (
    <h4
      className={cn(typographyVariants({ variant: "h4" }), className)}
      ref={ref}
      {...props}
    >
      {children}
    </h4>
  ),
);
H4.displayName = "H4";

/** Body paragraph with sensible vertical rhythm. */
const P = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => (
    <p
      className={cn(typographyVariants({ variant: "p" }), className)}
      ref={ref}
      {...props}
    />
  ),
);
P.displayName = "P";

/** Emphasised introductory paragraph. */
const Lead = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => (
    <p
      className={cn(typographyVariants({ variant: "lead" }), className)}
      ref={ref}
      {...props}
    />
  ),
);
Lead.displayName = "Lead";

/** De-emphasised secondary text. */
const Muted = forwardRef<HTMLParagraphElement, ParagraphProps>(
  ({ className, ...props }, ref) => (
    <p
      className={cn(typographyVariants({ variant: "muted" }), className)}
      ref={ref}
      {...props}
    />
  ),
);
Muted.displayName = "Muted";

/** Quoted passage with a leading rule. */
const Blockquote = forwardRef<HTMLQuoteElement, BlockquoteProps>(
  ({ className, ...props }, ref) => (
    <blockquote
      className={cn(typographyVariants({ variant: "blockquote" }), className)}
      ref={ref}
      {...props}
    />
  ),
);
Blockquote.displayName = "Blockquote";

/** Inline monospaced code span. */
const InlineCode = forwardRef<HTMLElement, InlineCodeProps>(
  ({ className, ...props }, ref) => (
    <code
      className={cn(typographyVariants({ variant: "inlineCode" }), className)}
      ref={ref}
      {...props}
    />
  ),
);
InlineCode.displayName = "InlineCode";

/** Bulleted list with indentation and item spacing. */
const List = forwardRef<HTMLUListElement, ListProps>(
  ({ className, ...props }, ref) => (
    <ul
      className={cn(typographyVariants({ variant: "list" }), className)}
      ref={ref}
      {...props}
    />
  ),
);
List.displayName = "List";

export { Blockquote, H1, H2, H3, H4, InlineCode, Lead, List, Muted, P };
