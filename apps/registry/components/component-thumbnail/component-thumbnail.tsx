"use client";

import * as React from "react";

import { ComponentPreview } from "@/components/component-preview/component-preview";

type ComponentThumbnailProps = {
  componentName: string;
};

/**
 * Renders a live, non-interactive preview of a component for gallery cards.
 *
 * Defers mounting the heavy, client-side {@link ComponentPreview} until the card
 * scrolls into view, so the 200+ component grid does not render and animate every
 * preview up front. Mounting in the browser also keeps previews that depend on
 * browser APIs (e.g. `useSearchParams`, `window`) out of the static build.
 *
 * `[contain:layout]` makes the card the containing block for `position: fixed`
 * previews (e.g. StepNavigation, ContentIntro) so they render clipped inside the
 * card instead of escaping to float over the whole viewport.
 *
 * @param componentName - Registry slug used to resolve the matching preview.
 */
/**
 * Scales its child down (never up) so the whole preview fits the card without
 * clipping or overflow. Measures the natural content size with a ResizeObserver
 * and applies a centered `transform: scale` — `contain` behaviour for a live
 * component. Large components render small but complete; the detail page shows
 * them full size.
 */
function FitPreview({ children }: { children: React.ReactNode }) {
  const boxRef = React.useRef<HTMLDivElement>(null);
  const stageRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    const box = boxRef.current;
    const stage = stageRef.current;
    if (!box || !stage) {
      return;
    }

    const observer = new ResizeObserver(() => {
      const availableWidth = box.clientWidth - 32;
      const availableHeight = box.clientHeight - 32;
      const contentWidth = stage.scrollWidth;
      const contentHeight = stage.scrollHeight;
      if (contentWidth === 0 || contentHeight === 0) {
        return;
      }
      const next = Math.min(
        availableWidth / contentWidth,
        availableHeight / contentHeight,
        1,
      );
      setScale(next > 0 ? next : 1);
    });

    observer.observe(box);
    observer.observe(stage);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div
      className="flex h-full w-full items-center justify-center overflow-hidden"
      ref={boxRef}
    >
      <div
        className="shrink-0"
        ref={stageRef}
        style={{ transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}

export function ComponentThumbnail({
  componentName,
}: ComponentThumbnailProps): React.ReactElement {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const element = containerRef.current;
    if (!element || isVisible) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible]);

  return (
    <div
      className="pointer-events-none h-44 overflow-hidden border-b bg-muted/30 [contain:layout]"
      inert
      ref={containerRef}
    >
      {isVisible ? (
        <FitPreview>
          <ComponentPreview componentName={componentName} />
        </FitPreview>
      ) : null}
    </div>
  );
}
