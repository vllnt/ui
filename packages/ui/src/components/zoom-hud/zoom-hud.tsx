import { forwardRef } from "react";

import { Minus, Plus, RotateCcw } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "../button";

export type ZoomHUDProps = React.ComponentPropsWithoutRef<"div"> & {
  onReset?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  zoom: number;
};

const ZoomHUD = forwardRef<HTMLDivElement, ZoomHUDProps>(
  ({ className, onReset, onZoomIn, onZoomOut, zoom, ...props }, ref) => (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-md border border-border bg-background p-1 font-mono",
        className,
      )}
      ref={ref}
      {...props}
    >
      <Button
        aria-label="Zoom out"
        onClick={onZoomOut}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Minus className="size-4" />
      </Button>
      <div className="min-w-16 px-2 text-center text-xs font-medium tabular-nums text-foreground">
        {Math.round(zoom * 100)}%
      </div>
      <Button
        aria-label="Zoom in"
        onClick={onZoomIn}
        size="icon"
        type="button"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
      <Button
        aria-label="Reset zoom"
        onClick={onReset}
        size="icon"
        type="button"
        variant="ghost"
      >
        <RotateCcw className="size-4" />
      </Button>
    </div>
  ),
);

ZoomHUD.displayName = "ZoomHUD";

export { ZoomHUD };
