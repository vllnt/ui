import { forwardRef } from "react";

import { cn } from "../../lib/utils";

export type MiniMapMarker = {
  id: string;
  label?: string;
  x: number;
  y: number;
};

export type MiniMapPanelProps = React.ComponentPropsWithoutRef<"div"> & {
  markers?: MiniMapMarker[];
  title?: string;
  viewport: {
    height: number;
    width: number;
    x: number;
    y: number;
    zoom: number;
  };
  world: {
    height: number;
    width: number;
  };
};

const MiniMapPanel = forwardRef<HTMLDivElement, MiniMapPanelProps>(
  (
    { className, markers = [], title = "Overview", viewport, world, ...props },
    ref,
  ) => {
    const viewportWidth = Math.max((viewport.width / world.width) * 100, 8);
    const viewportHeight = Math.max((viewport.height / world.height) * 100, 8);
    const viewportLeft = Math.min(
      Math.max((viewport.x / world.width) * 100, 0),
      100 - viewportWidth,
    );
    const viewportTop = Math.min(
      Math.max((viewport.y / world.height) * 100, 0),
      100 - viewportHeight,
    );

    return (
      <div
        className={cn(
          "w-52 rounded-2xl border border-border/70 bg-background/90 p-3 shadow-sm backdrop-blur",
          className,
        )}
        ref={ref}
        {...props}
      >
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.24em] text-muted-foreground">
              {title}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Zoom {Math.round(viewport.zoom * 100)}%
            </div>
          </div>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-[radial-gradient(circle_at_center,hsl(var(--muted))_0,transparent_68%),linear-gradient(hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(90deg,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size:auto,18px_18px,18px_18px] bg-center">
          {markers.map((marker) => (
            <div
              className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-sm"
              key={marker.id}
              style={{
                left: `${(marker.x / world.width) * 100}%`,
                top: `${(marker.y / world.height) * 100}%`,
              }}
              title={marker.label}
            />
          ))}
          <div
            className="absolute rounded-lg border border-primary/80 bg-primary/10 shadow-[0_0_0_1px_hsl(var(--background)/0.65)]"
            style={{
              height: `${viewportHeight}%`,
              left: `${viewportLeft}%`,
              top: `${viewportTop}%`,
              width: `${viewportWidth}%`,
            }}
          />
        </div>
      </div>
    );
  },
);

MiniMapPanel.displayName = "MiniMapPanel";

export { MiniMapPanel };
