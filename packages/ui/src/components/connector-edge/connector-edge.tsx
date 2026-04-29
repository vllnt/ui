import { forwardRef } from "react";

import type { CSSProperties } from "react";

import { cn } from "../../lib/utils";
import { EdgeLabel } from "../edge-label";

export type ConnectorEdgePoint = {
  x: number;
  y: number;
};

export type ConnectorEdgeProps = React.ComponentPropsWithoutRef<"div"> & {
  end: ConnectorEdgePoint;
  label?: string;
  start: ConnectorEdgePoint;
  state?: "active" | "blocked" | "idle";
};

const strokeClasses: Record<
  NonNullable<ConnectorEdgeProps["state"]>,
  string
> = {
  active: "stroke-sky-500",
  blocked: "stroke-amber-500",
  idle: "stroke-muted-foreground/60",
};

const ConnectorEdge = forwardRef<HTMLDivElement, ConnectorEdgeProps>(
  ({ className, end, label, start, state = "idle", ...props }, ref) => {
    const width = Math.max(Math.abs(end.x - start.x), 32);
    const height = Math.max(Math.abs(end.y - start.y), 32);
    const midX = width / 2;
    const startX = start.x <= end.x ? 4 : width - 4;
    const endX = start.x <= end.x ? width - 4 : 4;
    const startY = start.y <= end.y ? 4 : height - 4;
    const endY = start.y <= end.y ? height - 4 : 4;
    const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;

    const style = {
      height,
      width,
    } satisfies CSSProperties;

    return (
      <div
        className={cn("relative inline-flex", className)}
        ref={ref}
        style={style}
        {...props}
      >
        <svg
          className="overflow-visible"
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
        >
          <path
            className={cn("fill-none stroke-[2.5]", strokeClasses[state])}
            d={path}
            strokeDasharray={state === "blocked" ? "4 4" : undefined}
            strokeLinecap="round"
          />
        </svg>
        {label ? (
          <EdgeLabel
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            emphasis={state === "active" ? "active" : "subtle"}
          >
            {label}
          </EdgeLabel>
        ) : null}
      </div>
    );
  },
);

ConnectorEdge.displayName = "ConnectorEdge";

export { ConnectorEdge };
