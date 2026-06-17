"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Single testimonial entry. */
export type Testimonial = {
  /** Author name. */
  name: string;
  /** Body of the testimonial. */
  quote: string;
  /** Author role or company. */
  title: string;
};

/** Props for {@link AnimatedTestimonials}. */
export type AnimatedTestimonialsProps =
  React.ComponentPropsWithoutRef<"div"> & {
    /** Advance through entries on a timer. Defaults to `false`. */
    autoplay?: boolean;
    /** Testimonials to cycle through. */
    testimonials: Testimonial[];
  };

/**
 * Carousel of testimonials with previous and next controls.
 *
 * Respects `prefers-reduced-motion`: entries swap without sliding.
 *
 * @example
 * ```tsx
 * <AnimatedTestimonials testimonials={items} autoplay />
 * ```
 */
export const AnimatedTestimonials = ({
  autoplay = false,
  className,
  ref,
  testimonials,
  ...props
}: AnimatedTestimonialsProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const count = testimonials.length;

  const goTo = React.useCallback(
    (step: number): void => {
      setActiveIndex((current) => (current + step + count) % count);
    },
    [count],
  );

  React.useEffect(() => {
    if (!autoplay || count <= 1) {
      return;
    }

    const timer = setInterval(() => {
      goTo(1);
    }, 5000);

    return () => {
      clearInterval(timer);
    };
  }, [autoplay, count, goTo]);

  const active = testimonials[activeIndex];

  if (active === undefined) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm",
        className,
      )}
      ref={ref}
      {...props}
    >
      <TestimonialCard index={activeIndex} testimonial={active} />
      <div className="flex items-center justify-between">
        <button
          className="rounded-md border px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            goTo(-1);
          }}
          type="button"
        >
          Previous
        </button>
        <button
          className="rounded-md border px-3 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
          onClick={() => {
            goTo(1);
          }}
          type="button"
        >
          Next
        </button>
      </div>
    </div>
  );
};
AnimatedTestimonials.displayName = "AnimatedTestimonials";

function TestimonialCard({
  index,
  testimonial,
}: {
  index: number;
  testimonial: Testimonial;
}) {
  return (
    <figure
      className="animate-in fade-in-0 slide-in-from-right-4 motion-reduce:animate-none"
      key={index}
    >
      <blockquote className="text-lg text-foreground">
        {testimonial.quote}
      </blockquote>
      <figcaption className="mt-2 text-sm text-muted-foreground">
        {testimonial.name} — {testimonial.title}
      </figcaption>
    </figure>
  );
}
