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
  /** Items PageUp / PageDown skip. Without it, PageUp / PageDown do nothing. */
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

type Position = { count: number; index: number };

function isEnabled(item: HTMLElement): boolean {
  return (
    !item.hasAttribute("disabled") &&
    item.getAttribute("aria-disabled") !== "true"
  );
}

function arrowStep(key: string, orientation: RovingOrientation): number {
  if (PREVIOUS_KEYS[orientation].includes(key)) return -1;
  if (NEXT_KEYS[orientation].includes(key)) return 1;
  return 0;
}

function pageTarget(
  key: string,
  { count, index }: Position,
  pageStep: number | undefined,
): number | undefined {
  if (pageStep === undefined) return undefined;
  if (key === "PageUp") return Math.max(index - pageStep, 0);
  if (key === "PageDown") return Math.min(index + pageStep, count - 1);
  return undefined;
}

function targetIndex(
  key: string,
  position: Position,
  options: RovingFocusOptions,
): number | undefined {
  const { loop = true, orientation = "horizontal", pageStep } = options;
  const { count, index } = position;
  if (key === "Home") return 0;
  if (key === "End") return count - 1;
  const paged = pageTarget(key, position, pageStep);
  if (paged !== undefined) return paged;
  const step = arrowStep(key, orientation);
  if (step === 0) return undefined;
  const next = index + step;
  if (loop) return (next + count) % count;
  return Math.min(Math.max(next, 0), count - 1);
}

function enabledItems(
  container: HTMLElement,
  itemSelector: string,
): HTMLElement[] {
  return [...container.querySelectorAll<HTMLElement>(itemSelector)].filter(
    (item) => isEnabled(item),
  );
}

/**
 * Keyboard handler for a composite widget that uses a roving tabindex
 * (WAI-ARIA APG, "Keyboard Navigation Inside Components"). Call it from the
 * container's `onKeyDown`: for an arrow key along `orientation`, Home / End
 * or (with `pageStep`) PageUp / PageDown, focus moves to the matching enabled
 * item inside `event.currentTarget` and the default action stops. The helper
 * skips keys another handler already took (`defaultPrevented`) and keys
 * pressed with Alt, Ctrl or Meta.
 *
 * @param event - keydown event from the container.
 * @param itemSelector - CSS selector for the items, e.g. `'[role="tab"]'`.
 * @param options - orientation, wrapping, paging and activation.
 * @returns the newly focused item, or `undefined` when the key does not apply.
 */
export function moveRovingFocus(
  event: KeyboardEvent<HTMLElement>,
  itemSelector: string,
  options: RovingFocusOptions = {},
): HTMLElement | undefined {
  const {
    altKey,
    ctrlKey,
    currentTarget,
    defaultPrevented,
    key,
    metaKey,
    target,
  } = event;
  if (defaultPrevented || altKey || ctrlKey || metaKey) return undefined;
  const items = enabledItems(currentTarget, itemSelector);
  const index = items.findIndex(
    (item) => target instanceof Node && item.contains(target),
  );
  if (index < 0) return undefined;
  const nextIndex = targetIndex(key, { count: items.length, index }, options);
  const next = nextIndex === undefined ? undefined : items[nextIndex];
  if (next === undefined) return undefined;
  event.preventDefault();
  if (nextIndex === index) return next;
  next.focus();
  if (options.activate === true) next.click();
  return next;
}
