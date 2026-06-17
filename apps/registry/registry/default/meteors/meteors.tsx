"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link Meteors}. */
export type MeteorsProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Count of meteors streaking across the field. Defaults to `12`. */
  count?: number;
};

type Meteor = {
  delay: number;
  duration: number;
  left: number;
  top: number;
};

function createMeteors(count: number): Meteor[] {
  return Array.from({ length: count }, () => ({
    delay: Math.random(),
    duration: 2 + Math.random() * 4,
    left: Math.random() * 100,
    top: -(Math.random() * 10),
  }));
}

type MeteorStyle = React.CSSProperties & {
  "--vllnt-meteor-angle"?: string;
};

function meteorStyle(meteor: Meteor): MeteorStyle {
  return {
    "--vllnt-meteor-angle": "215deg",
    animation: `vllnt-meteor ${meteor.duration}s linear infinite`,
    animationDelay: `${meteor.delay}s`,
    left: `${meteor.left}%`,
    top: `${meteor.top}%`,
  };
}

/**
 * Decorative shower of meteors falling diagonally across the field.
 *
 * Respects `prefers-reduced-motion`: the meteors stay parked.
 *
 * @example
 * ```tsx
 * <Meteors count={20} />
 * ```
 */
export const Meteors = React.forwardRef<HTMLDivElement, MeteorsProps>(
  ({ className, count = 12, ...props }, ref) => {
    const [meteors] = React.useState(() => createMeteors(count));

    return (
      <div
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 overflow-hidden",
          className,
        )}
        ref={ref}
        {...props}
      >
        {meteors.map((meteor, index) => (
          <span
            className="absolute h-0.5 w-0.5 rounded-full bg-muted-foreground motion-reduce:animate-none"
            key={index}
            style={meteorStyle(meteor)}
          >
            <span
              className="absolute right-0 top-1/2 h-px w-12 -translate-y-1/2"
              style={{
                background:
                  "linear-gradient(90deg, oklch(var(--muted-foreground)), transparent)",
              }}
            />
          </span>
        ))}
      </div>
    );
  },
);
Meteors.displayName = "Meteors";
