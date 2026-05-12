"use client";

import { memo, type ReactNode } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useHorizontalScroll } from "@vllnt/ui";
import { cn } from "@vllnt/ui";
import { Button } from "@vllnt/ui";

type HorizontalScrollRowProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

const HorizontalScrollRow = memo(function HorizontalScrollRow({
  children,
  className,
  description,
  title,
}: HorizontalScrollRowProps) {
  const { canScrollLeft, canScrollRight, containerRef, scroll } =
    useHorizontalScroll();

  const showControls = canScrollLeft || canScrollRight;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{title}</h3>
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {showControls ? (
          <div className="flex gap-1">
            <Button
              aria-label="Scroll left"
              className="size-8"
              disabled={!canScrollLeft}
              onClick={() => {
                scroll("left");
              }}
              size="icon"
              variant="outline"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              aria-label="Scroll right"
              className="size-8"
              disabled={!canScrollRight}
              onClick={() => {
                scroll("right");
              }}
              size="icon"
              variant="outline"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      <div
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        ref={containerRef}
      >
        {children}
      </div>
    </section>
  );
});

HorizontalScrollRow.displayName = "HorizontalScrollRow";

export { HorizontalScrollRow };
export type { HorizontalScrollRowProps };
