"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type ReactNode,
} from "react";

import { cn } from "@vllnt/ui";

/**
 * One saved viewport.
 *
 * @public
 */
export type ViewportBookmark = {
  /** Optional accent color for the row glyph. */
  color?: string;
  /** Optional secondary line (zoom level, last-visited, owner). */
  detail?: ReactNode;
  /** Stable identifier — used as the React key. */
  id: string;
  /** Display name for the bookmark. */
  label: ReactNode;
};

/**
 * Localizable strings.
 *
 * @public
 */
export type ViewportBookmarksLabels = {
  /** Empty-state copy. Defaults to `"No saved views"`. */
  empty?: string;
  /** Aria-label override. Defaults to `"Viewport bookmarks"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  empty: "No saved views",
  region: "Viewport bookmarks",
} as const satisfies Required<ViewportBookmarksLabels>;

/**
 * Props for {@link ViewportBookmarks}.
 *
 * @public
 */
export type ViewportBookmarksProps = {
  /** Optional active bookmark id — renders the row in the selected state. */
  activeId?: string;
  /** Bookmark entries in render order. */
  bookmarks: ViewportBookmark[];
  /** Localizable strings. */
  labels?: ViewportBookmarksLabels;
  /** Click handler — receives the activated bookmark id. */
  onSelect?: (id: string) => void;
  /** Optional title rendered above the rows. Defaults to `"Saved views"`. */
  title?: ReactNode;
} & ComponentPropsWithoutRef<"section">;

const Row = (props: {
  active: boolean;
  bookmark: ViewportBookmark;
  onSelect?: (id: string) => void;
}): React.ReactElement => {
  const { active, bookmark, onSelect } = props;
  const handleSelectBookmark = (): void => {
    onSelect?.(bookmark.id);
  };
  const rowClass =
    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors";
  const activeClass = active
    ? "bg-muted/60 text-foreground"
    : "text-muted-foreground hover:bg-muted/30 hover:text-foreground";
  if (onSelect) {
    return (
      <button
        aria-pressed={active}
        className={cn(
          rowClass,
          activeClass,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        )}
        data-viewport-bookmark={bookmark.id}
        data-viewport-bookmark-active={active}
        onClick={handleSelectBookmark}
        type="button"
      >
        <RowBody bookmark={bookmark} />
      </button>
    );
  }
  return (
    <span
      className={cn(rowClass, activeClass)}
      data-viewport-bookmark={bookmark.id}
      data-viewport-bookmark-active={active}
    >
      <RowBody bookmark={bookmark} />
    </span>
  );
};

const RowBody = (props: { bookmark: ViewportBookmark }): React.ReactElement => {
  const { bookmark } = props;
  return (
    <>
      <span
        aria-hidden="true"
        className="size-1.5 rounded-full"
        style={{ backgroundColor: bookmark.color ?? "hsl(var(--foreground))" }}
      />
      <span className="flex flex-1 flex-col text-left">
        <span className="truncate font-medium">{bookmark.label}</span>
        {bookmark.detail ? (
          <span
            className="truncate text-[10px] text-muted-foreground"
            data-viewport-bookmark-detail
          >
            {bookmark.detail}
          </span>
        ) : null}
      </span>
    </>
  );
};

/**
 * Saved-view list for the canvas — the spatial parallel of a tab
 * bar's pinned tabs. Each bookmark stores a viewport target the host
 * resolves to a pan / zoom transition. Pure presentation; the host
 * owns the bookmark store and the camera animation.
 *
 * @example
 * ```tsx
 * <ViewportBookmarks
 *   activeId={active}
 *   bookmarks={[
 *     { id: "home", label: "Home base", color: "#5b8def" },
 *     { id: "incidents", label: "Incidents", detail: "5 open", color: "#ef4444" },
 *   ]}
 *   onSelect={jumpTo}
 * />
 * ```
 *
 * @public
 */
export const ViewportBookmarks = forwardRef<
  HTMLElement,
  ViewportBookmarksProps
>((props, ref) => {
  const {
    activeId,
    bookmarks,
    className,
    labels,
    onSelect,
    title = "Saved views",
    ...rest
  } = props;
  const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
  return (
    <section
      aria-label={resolvedLabels.region}
      className={cn(
        "flex w-full flex-col gap-1 rounded-lg border border-border bg-background p-2 text-foreground",
        className,
      )}
      data-viewport-bookmarks
      ref={ref}
      {...rest}
    >
      <header className="px-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </header>
      {bookmarks.length === 0 ? (
        <p
          className="px-2 py-3 text-center text-[11px] text-muted-foreground"
          data-viewport-bookmarks-state="empty"
        >
          {resolvedLabels.empty}
        </p>
      ) : (
        <ul className="space-y-0.5">
          {bookmarks.map((bookmark) => (
            <li key={bookmark.id}>
              <Row
                active={activeId === bookmark.id}
                bookmark={bookmark}
                onSelect={onSelect}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
});
ViewportBookmarks.displayName = "ViewportBookmarks";
