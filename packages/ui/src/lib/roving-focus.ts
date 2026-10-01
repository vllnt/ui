import type { KeyboardEvent } from "react";

/** Arrow keys a composite widget responds to. */
export type RovingOrientation = "both" | "horizontal" | "vertical";

/** Options for {@link moveRovingFocus}. */
export type RovingFocusOptions = {
  /** Click the newly focused item, so selection follows focus. Defaults to `false`. */
  activate?: boolean;
  /** Wrap from the last item to the first and back. Defaults to `true`. */
  loop?: boolean;
  /** Arrow keys that move focus. Defaults to `"horizontal"`. */
  orientation?: RovingOrientation;
  /** Items PageUp / PageDown skip. PageUp / PageDown are ignored when unset. */
  pageStep?: number;
};

const PREVIOUS_KEYS: Record<RovingOrientation, readonly string[]> = {
  both: ["ArrowLeft", "ArrowUp"],
  horizontal: ["ArrowLeft"],
  vertical: ["ArrowUp"],
};

const NEXT_KEYS: Record<RovingOrientation, readonly string[]> = {
  both: ["ArrowRight", "ArrowDown"],
  horizontal: ["ArrowRight"],
  vertical: ["ArrowDown"],
};

function isEnabled(item: HTMLElement): boolean {
  return (
    !item.hasAttribute("disabled") &&
    item.getAttribute("aria-disabled") !== "true"
  );
}

function targetIndex(
  key: string,
  index: number,
  count: number,
  options: RovingFocusOptions,
): null | number {
  const { loop = true, orientation = "horizontal", pageStep } = options;
  const last = count - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  if (pageStep !== undefined && key === "PageUp") {
    return Math.max(index - pageStep, 0);
  }
  if (pageStep !== undefined && key === "PageDown") {
    return Math.min(index + pageStep, last);
  }
  const step = PREVIOUS_KEYS[orientation].includes(key)
    ? -1
    : NEXT_KEYS[orientation].includes(key)
      ? 1
      : 0;
  if (step === 0) return null;
  const next = index + step;
  if (loop) return (next + count) % count;
  return Math.min(Math.max(next, 0), last);
}

/**
 * Keyboard handler for a composite widget that uses a roving tabindex
 * (WAI-ARIA APG, "Keyboard Navigation Inside Components"). Call it from the
 * container's `onKeyDown`: when the key is an arrow key for `orientation`,
 * Home / End or (with `pageStep`) PageUp / PageDown, focus moves to the
 * matching enabled item inside `event.currentTarget` and the event is
 * prevented. Keys already handled (`defaultPrevented`) or pressed with a
 * modifier are ignored.
 *
 * @param event - keydown event from the container.
 * @param itemSelector - CSS selector for the items, e.g. `'[role="tab"]'`.
 * @param options - orientation, wrapping, paging and activation.
 * @returns the newly focused item, or `null` when the key was not handled.
 */
export function moveRovingFocus(
  event: KeyboardEvent<HTMLElement>,
  itemSelector: string,
  options: RovingFocusOptions = {},
): HTMLElement | null {
  if (
    event.defaultPrevented ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey
  ) {
    return null;
  }
  const items = [
    ...event.currentTarget.querySelectorAll<HTMLElement>(itemSelector),
  ].filter((item) => isEnabled(item));
  const { target } = event;
  const index = items.findIndex(
    (item) => target instanceof Node && item.contains(target),
  );
  if (index < 0) return null;
  const nextIndex = targetIndex(event.key, index, items.length, options);
  if (nextIndex === null) return null;
  const next = items[nextIndex];
  if (next === undefined) return null;
  event.preventDefault();
  if (nextIndex === index) return next;
  next.focus();
  if (options.activate === true) next.click();
  return next;
}
