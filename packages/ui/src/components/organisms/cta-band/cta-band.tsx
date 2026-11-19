import * as React from "react";

import { cva } from "class-variance-authority";

import { cn } from "../../../lib/utils";
import { Heading, type HeadingLevel } from "../../atoms/heading/heading";
import { Separator } from "../../atoms/separator/separator";
import { Text } from "../../atoms/text/text";

/** Surface tone of a {@link CtaBand}. */
export type CtaBandTone = "default" | "muted";

/** Props for {@link CtaBand}. */
export type CtaBandProps = Omit<
  React.ComponentPropsWithoutRef<"section">,
  "title"
> & {
  /** Buttons or links rendered side by side after the header, e.g. a primary and a secondary action. */
  actions?: React.ReactNode;
  /** Supporting copy under the title. */
  description?: React.ReactNode;
  /** Draws a rule between the header and the description. */
  divider?: boolean;
  /** Semantic rank of the title, `h1`–`h6`. The visual scale stays fixed. */
  headingLevel?: HeadingLevel;
  /** Decorative glyph before the title. Hidden from assistive technology. */
  icon?: React.ReactNode;
  /** Call-to-action headline. */
  title: React.ReactNode;
  /** `default` sits on the page background, `muted` on the muted surface. */
  tone?: CtaBandTone;
};

const ctaBandVariants = cva(
  "flex w-full flex-col gap-6 border-y border-border px-6 py-10 text-foreground md:flex-row md:items-center md:justify-between md:gap-10 md:px-10 md:py-12",
  {
    defaultVariants: {
      tone: "default",
    },
    variants: {
      tone: {
        default: "bg-background",
        muted: "bg-muted",
      },
    },
  },
);

/**
 * Full-width call-to-action band: a title with optional icon, description and
 * divider, followed by a row of actions that stacks under the copy on small
 * screens. Renders a `<section>`; pass `aria-labelledby` or `aria-label` to
 * expose it as a landmark. Server-component friendly: no state, no hooks.
 *
 * @example
 * <CtaBand
 *   actions={<Button>Get started</Button>}
 *   description="Free for personal projects."
 *   title="Ship your next release faster"
 * />
 */
export const CtaBand = ({
  actions,
  className,
  description,
  divider = false,
  headingLevel = 2,
  icon,
  ref: reference,
  title,
  tone = "default",
  ...props
}: CtaBandProps & { ref?: React.Ref<HTMLElement> }) => (
  <section
    className={cn(ctaBandVariants({ tone }), className)}
    data-slot="cta-band"
    data-tone={tone}
    ref={reference}
    {...props}
  >
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex items-center gap-3">
        {icon ? (
          <span
            aria-hidden="true"
            className="inline-flex shrink-0 text-muted-foreground [&_svg]:size-6"
            data-slot="cta-band-icon"
          >
            {icon}
          </span>
        ) : null}
        <Heading level={headingLevel} size={2}>
          {title}
        </Heading>
      </div>
      {divider ? <Separator data-slot="cta-band-divider" /> : null}
      {description ? (
        <Text
          data-slot="cta-band-description"
          size="lead"
          tone={tone === "muted" ? "default" : "muted"}
        >
          {description}
        </Text>
      ) : null}
    </div>
    {actions ? (
      <div
        className="flex shrink-0 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center"
        data-slot="cta-band-actions"
      >
        {actions}
      </div>
    ) : null}
  </section>
);

CtaBand.displayName = "CtaBand";
