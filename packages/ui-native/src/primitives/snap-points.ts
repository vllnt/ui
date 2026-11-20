/**
 * Snap point of a drawer, as on vaul. A number from 0 to 1 is a fraction of
 * the window along the drawer's axis. A string such as `"148px"` is a size in
 * points.
 */
export type SnapPoint = number | string;

/** A snap point with the size it shows, in points. */
export type ResolvedSnapPoint = {
  readonly point: SnapPoint;
  readonly size: number;
};

/** Where a released drag settles: on a snap index, or closed. */
export type SnapRelease =
  | { readonly close: false; readonly index: number }
  | { readonly close: true };

/** What a live drag needs to know about the drawer. */
export type SnapDrag = {
  readonly activeIndex: number;
  readonly dismissible: boolean;
  /** Visible sizes, smallest first. */
  readonly sizes: readonly number[];
};

/** Inputs of {@link resolveRelease}. */
export type SnapReleaseInput = SnapDrag & {
  /** Fraction of the lowest snap point a drag must cover to close. */
  readonly closeThreshold: number;
  /** Points dragged toward closing; negative toward larger. */
  readonly delta: number;
  /** A fling moves one snap point, not to the furthest. */
  readonly sequential: boolean;
  /** Points per millisecond toward closing; negative toward larger. */
  readonly velocity: number;
};

/** Drag speed, in points per millisecond, that counts as a fling. */
const FLING_VELOCITY = 0.4;
const PIXEL_SIZE = /^(\d+(?:\.\d+)?)px$/;

function sizeOf(point: SnapPoint, container: number): number | undefined {
  if (typeof point === "number") {
    return point > 0 && point <= 1 ? point * container : undefined;
  }
  const pixels = PIXEL_SIZE.exec(point)?.[1];
  if (pixels === undefined) return undefined;
  const size = Number(pixels);
  return size > 0 ? Math.min(size, container) : undefined;
}

/**
 * Resolves snap points against the window size along the drawer's axis. It
 * drops points that are neither a fraction in (0, 1] nor a `"<n>px"` string,
 * and returns the rest smallest first.
 *
 * @param points - Caller snap points.
 * @param container - Window size along the drawer's axis, in points.
 * @returns The valid points with their sizes, ascending.
 * @example
 * resolveSnapPoints([1, "148px", 0.5], 800); // sizes 148, 400, 800
 */
function resolveSnapPoints(
  points: readonly SnapPoint[],
  container: number,
): readonly ResolvedSnapPoint[] {
  return points
    .flatMap((point) => {
      const size = sizeOf(point, container);
      return size === undefined ? [] : [{ point, size }];
    })
    .sort((left, right) => left.size - right.size);
}

/**
 * Keeps a live drag inside what the drawer can show. It stops at the largest
 * snap point, and at the lowest one unless the drawer can close.
 *
 * @param delta - Points dragged toward closing.
 * @param drag - Snap sizes, the snap the drag started on, and `dismissible`.
 * @returns The delta to show.
 */
function clampDelta(delta: number, drag: SnapDrag): number {
  const { activeIndex, dismissible, sizes } = drag;
  const active = sizes[activeIndex] ?? 0;
  const largest = sizes.at(-1) ?? active;
  const lowest = sizes[0] ?? active;
  const max = dismissible ? active : active - lowest;
  return Math.min(Math.max(delta, active - largest), max);
}

function nearestIndex(
  sizes: readonly number[],
  visible: number,
  candidates: readonly number[],
): number {
  const [first = 0] = candidates;
  return candidates.reduce(
    (best, index) =>
      Math.abs((sizes[index] ?? 0) - visible) <
      Math.abs((sizes[best] ?? 0) - visible)
        ? index
        : best,
    first,
  );
}

function resolveFling(input: SnapReleaseInput): SnapRelease {
  const { activeIndex, dismissible, sequential, sizes, velocity } = input;
  const closing = velocity > 0;
  if (closing && activeIndex === 0) {
    return dismissible ? { close: true } : { close: false, index: 0 };
  }
  const last = sizes.length - 1;
  if (sequential) {
    const next = activeIndex + (closing ? -1 : 1);
    return { close: false, index: Math.min(Math.max(next, 0), last) };
  }
  return { close: false, index: closing ? 0 : last };
}

function resolveSlowDrag(input: SnapReleaseInput): SnapRelease {
  const { activeIndex, closeThreshold, delta, dismissible, sequential, sizes } =
    input;
  const lowest = sizes[0] ?? 0;
  const visible = (sizes[activeIndex] ?? 0) - delta;
  const covered = (lowest - visible) / lowest;
  if (
    dismissible &&
    lowest > 0 &&
    visible < lowest &&
    covered >= closeThreshold
  ) {
    return { close: true };
  }
  const all = sizes.map((_size, index) => index);
  const candidates = sequential
    ? all.filter((index) => Math.abs(index - activeIndex) <= 1)
    : all;
  return { close: false, index: nearestIndex(sizes, visible, candidates) };
}

/**
 * Decides where a released drag settles. A fling goes to the furthest snap
 * point (the adjacent one when `sequential`), and a fling toward closing from
 * the lowest snap point closes a dismissible drawer. A slower drag closes a
 * dismissible drawer once it covers `closeThreshold` of the lowest snap point,
 * and otherwise settles on the nearest snap point.
 *
 * @param input - Drag distance, speed and the drawer's snap settings.
 * @returns The snap index to rest on, or a close.
 * @example
 * resolveRelease({ activeIndex: 0, closeThreshold: 0.25, delta: 120,
 *   dismissible: true, sequential: false, sizes: [400], velocity: 0 });
 */
function resolveRelease(input: SnapReleaseInput): SnapRelease {
  return Math.abs(input.velocity) > FLING_VELOCITY
    ? resolveFling(input)
    : resolveSlowDrag(input);
}

export { clampDelta, resolveRelease, resolveSnapPoints };
