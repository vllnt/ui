"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link CardFlip}. */
export type CardFlipProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Content shown on the back face. */
  back: React.ReactNode;
  /** Whether hovering flips the card. Click toggles when disabled. Defaults to `true`. */
  flipOnHover?: boolean;
  /** Content shown on the front face. */
  front: React.ReactNode;
};

function Inner({
  back,
  flipOnHover,
  flipped,
  front,
}: {
  back: React.ReactNode;
  flipOnHover: boolean;
  flipped: boolean;
  front: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative h-full min-h-40 transition-transform duration-500 [transform-style:preserve-3d] motion-reduce:transition-none",
        flipOnHover && "group-hover:[transform:rotateY(180deg)]",
        !flipOnHover && flipped && "[transform:rotateY(180deg)]",
      )}
    >
      <div className="absolute inset-0 [backface-visibility:hidden]">
        {front}
      </div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
        {back}
      </div>
    </div>
  );
}

/**
 * Card that flips in 3D between a front and a back face on hover or click.
 *
 * Respects `prefers-reduced-motion`: the flip happens without a transition.
 *
 * @example
 * ```tsx
 * <CardFlip front={<p>Front</p>} back={<p>Back</p>} />
 * ```
 */
export const CardFlip = React.forwardRef<HTMLDivElement, CardFlipProps>(
  ({ back, className, flipOnHover = true, front, ...props }, ref) => {
    const [flipped, setFlipped] = React.useState(false);
    const base = cn(
      "relative min-h-40 [perspective:1000px]",
      flipOnHover && "group",
      className,
    );

    if (flipOnHover) {
      return (
        <div className={base} ref={ref} {...props}>
          <Inner
            back={back}
            flipOnHover={true}
            flipped={flipped}
            front={front}
          />
        </div>
      );
    }

    return (
      <div
        className={base}
        onClick={() => {
          setFlipped((current) => !current);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setFlipped((current) => !current);
          }
        }}
        ref={ref}
        role="button"
        tabIndex={0}
        {...props}
      >
        <Inner
          back={back}
          flipOnHover={false}
          flipped={flipped}
          front={front}
        />
      </div>
    );
  },
);
CardFlip.displayName = "CardFlip";
