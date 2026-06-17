import * as React from "react";

import { cn } from "@vllnt/ui";

/** Props for {@link SpinningText}. */
export type SpinningTextProps = React.ComponentPropsWithoutRef<"div"> & {
  /** Text laid out around the ring. */
  children: string;
  /** Seconds for one full revolution. Defaults to `20`. */
  duration?: number;
  /** Radius of the text ring in pixels. Defaults to `80`. */
  radius?: number;
  /** Spin counter-clockwise when true. Defaults to `false`. */
  reverse?: boolean;
};

function splitCharacters(value: string): string[] {
  return value.match(/[\s\S]/gu) ?? [];
}

function characterStyle(
  index: number,
  total: number,
  radius: number,
): React.CSSProperties {
  return {
    left: "50%",
    position: "absolute",
    top: "50%",
    transform: `rotate(${(360 / total) * index}deg) translateY(${-radius}px)`,
    transformOrigin: "0 0",
  };
}

/**
 * Lays a string evenly around a circle and rotates the ring on a loop.
 *
 * Respects `prefers-reduced-motion`: the layout holds but the spin stops.
 *
 * @example
 * ```tsx
 * <SpinningText>vllnt design system</SpinningText>
 * ```
 */
export const SpinningText = ({
  children,
  className,
  duration = 20,
  radius = 80,
  ref,
  reverse = false,
  style,
  ...props
}: SpinningTextProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const characters = splitCharacters(children);

  return (
    <div
      aria-label={children}
      className={cn(
        "relative animate-spin motion-reduce:animate-none",
        className,
      )}
      ref={ref}
      style={{
        animationDirection: reverse ? "reverse" : "normal",
        animationDuration: `${duration}s`,
        height: radius * 2,
        width: radius * 2,
        ...style,
      }}
      {...props}
    >
      {characters.map((character, index) => (
        <span
          aria-hidden="true"
          key={`${character}-${index.toString()}`}
          style={characterStyle(index, characters.length, radius)}
        >
          {character}
        </span>
      ))}
    </div>
  );
};
SpinningText.displayName = "SpinningText";
