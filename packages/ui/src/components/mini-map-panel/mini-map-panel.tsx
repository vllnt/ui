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
          "w-52 rounded-md border border-border bg-background p-3 font-mono",
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
        <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-background">
          {markers.map((marker) => (
            <div
              className="absolute size-1.5 -translate-x-1/2 -translate-y-1/2 bg-foreground"
              key={marker.id}
              style={{
                left: `${(marker.x / world.width) * 100}%`,
                top: `${(marker.y / world.height) * 100}%`,
              }}
              title={marker.label}
            />
          ))}
          <div
            className="absolute border border-foreground/80 bg-transparent"
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
