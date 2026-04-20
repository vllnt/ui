import * as React from "react";

import { cn } from "../../lib/utils";

export type BorderBeamProps = React.ComponentPropsWithoutRef<"span"> & {
  borderWidth?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
  duration?: number;
  reverse?: boolean;
};

export const BorderBeam = React.forwardRef<HTMLSpanElement, BorderBeamProps>(
  (
    {
      borderWidth = 1,
      className,
      colorFrom = "hsl(var(--primary) / 0.85)",
      colorTo = "hsl(var(--ring) / 0.25)",
      delay = 0,
      duration = 6,
      reverse = false,
      style,
      ...props
    },
    ref,
  ) => {
    const beamStyle: React.CSSProperties = {
      animationDelay: `${delay}s`,
      animationDirection: reverse ? "reverse" : "normal",
      animationDuration: `${duration}s`,
      animationIterationCount: "infinite",
      animationName: "vllnt-border-beam-angle",
      animationTimingFunction: "linear",
      background: `conic-gradient(from var(--vllnt-border-beam-angle, 90deg), transparent 0deg, transparent 220deg, ${colorFrom} 280deg, ${colorTo} 335deg, transparent 360deg)`,
      borderRadius: "inherit",
      boxSizing: "border-box",
      mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      maskComposite: "exclude",
      padding: `${borderWidth}px`,
      WebkitMask:
        "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
      WebkitMaskComposite: "xor",
      ...style,
    };

    return (
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute inset-0 rounded-[inherit]",
          className,
        )}
        ref={ref}
        style={beamStyle}
        {...props}
      />
    );
  },
);

BorderBeam.displayName = "BorderBeam";
