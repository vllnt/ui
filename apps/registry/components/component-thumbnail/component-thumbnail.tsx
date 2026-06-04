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
      aria-hidden="true"
      className="pointer-events-none flex h-44 items-center justify-center overflow-hidden border-b bg-muted/30 p-4 [contain:layout]"
      ref={containerRef}
    >
      {isVisible ? <ComponentPreview componentName={componentName} /> : null}
    </div>
  );
}
