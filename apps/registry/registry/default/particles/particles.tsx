"use client";

import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link Particles}. */
export type ParticlesProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Count of drifting dots in the field. Defaults to `30`. */
  count?: number;
};

type Particle = {
  delay: number;
  duration: number;
  left: number;
  size: number;
  top: number;
};

function createParticles(count: number): Particle[] {
  return Array.from({ length: count }, () => ({
    delay: Math.random() * 4,
    duration: 4 + Math.random() * 6,
    left: Math.random() * 100,
    size: 2 + Math.random() * 3,
    top: Math.random() * 100,
  }));
}

/**
 * Decorative field of dots drifting upward at staggered speeds.
 *
 * Respects `prefers-reduced-motion`: the dots hold still.
 *
 * @example
 * ```tsx
 * <Particles count={40} />
 * ```
 */
export const Particles = ({
  className,
  count = 30,
  ref,
  ...props
}: ParticlesProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const [particles] = React.useState(() => createParticles(count));

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
      {particles.map((particle, index) => (
        <span
          className="absolute rounded-full bg-foreground/30 motion-reduce:animate-none"
          key={index}
          style={{
            animation: `vllnt-particle-float ${particle.duration}s linear infinite`,
            animationDelay: `${particle.delay}s`,
            height: `${particle.size}px`,
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            width: `${particle.size}px`,
          }}
        />
      ))}
    </div>
  );
};
Particles.displayName = "Particles";
