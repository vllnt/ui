"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "../../lib/utils";

/**
 * A saved viewport position. The shape is intentionally generic — pass
 * any state you need to restore the viewport (pan, zoom, selection,
 * filters) through `data` and read it back in the `onSelect` handler.
 *
 * @public
 */
export type ViewportBookmark = {
  /** Optional payload to pass back when the user picks the bookmark. */
  data?: unknown;
  /** Stable identifier. */
  id: string;
  /** Display label. */
  label: ReactNode;
  /** Optional sublabel (timestamp, scale, etc.). */
  meta?: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ViewportBookmarksLabels = {
  /** Empty-state body. Defaults to `"No saved viewports"`. */
  empty?: string;
  /** Aria-label for the chip row. Defaults to `"Saved viewports"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No saved viewports",
  region: "Saved viewports",
} as const satisfies Required<ViewportBookmarksLabels>;

/**
 * Props for {@link ViewportBookmarks}.
 *
 * @public
 */
export type ViewportBookmarksProps = {
  /** Optional id of the active bookmark — adds a primary outline. */
  activeId?: string;
  /** Saved bookmarks. */
  bookmarks: ViewportBookmark[];
  /** Localizable strings. */
  labels?: ViewportBookmarksLabels;
  /** Fires when the user picks a bookmark. */
  onSelect?: (bookmark: ViewportBookmark) => void;
} & ComponentPropsWithoutRef<"nav">;

/**
 * Compact chip row of saved viewport positions. Pair with
 * `InfinitePlane` to jump between scenes (project → board → focus
 * mode) without losing track of named contexts.
 *
 * @example
 * ```tsx
 * <ViewportBookmarks
 *   bookmarks={[
 *     { id: "overview", label: "Overview" },
 *     { id: "release", label: "Release", meta: "Today" },
 *   ]}
 *   activeId={current}
 *   onSelect={(b) => restore(b.id)}
 * />
 * ```
 *
 * @public
 */
export const ViewportBookmarks = forwardRef<
  HTMLElement,
  ViewportBookmarksProps
>((props, ref) => {
  const { activeId, bookmarks, className, labels, onSelect, ...rest } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <nav
      aria-label={resolvedLabels.region}
      className={cn(
        "flex flex-wrap items-center gap-1.5 rounded-md border border-border bg-background/95 px-2 py-1 text-xs text-foreground shadow-sm backdrop-blur",
        className,
      )}
      data-bookmarks-count={bookmarks.length}
      ref={ref}
      {...rest}
    >
      {bookmarks.length === 0 ? (
        <span className="text-muted-foreground">{resolvedLabels.empty}</span>
      ) : (
        bookmarks.map((bookmark) => {
          const active = bookmark.id === activeId;
          return (
            <button
              aria-pressed={active}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              data-active={active ? "true" : undefined}
              data-bookmark-id={bookmark.id}
              key={bookmark.id}
              onClick={() => onSelect?.(bookmark)}
              type="button"
            >
              <span>{bookmark.label}</span>
              {bookmark.meta ? (
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {bookmark.meta}
                </span>
              ) : null}
            </button>
          );
        })
      )}
    </nav>
  );
});
ViewportBookmarks.displayName = "ViewportBookmarks";
