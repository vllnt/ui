/** Axis whose arrow keys move between the items of a group. */
export type RovingOrientation = "horizontal" | "vertical";

/** Inputs of {@link rovingTarget}. */
export type RovingTargetOptions = {
  /** Index of the item that has focus. */
  readonly current: number;
  /** Whether each item can take focus, in order. */
  readonly enabled: readonly boolean[];
  /** The pressed key, as in `KeyboardEvent.key`. */
  readonly key: string;
  /** Wrap from the last item to the first, and back. */
  readonly loop: boolean;
  /** Restricts the arrow keys to one axis; both axes work when omitted. */
  readonly orientation?: RovingOrientation;
};

const AXES: readonly RovingOrientation[] = ["horizontal", "vertical"];
const FORWARD_KEY = {
  horizontal: "ArrowRight",
  vertical: "ArrowDown",
} as const;
const BACKWARD_KEY = { horizontal: "ArrowLeft", vertical: "ArrowUp" } as const;

function stepOf(key: string, orientation?: RovingOrientation): -1 | 0 | 1 {
  const axes = orientation === undefined ? AXES : [orientation];
  if (axes.some((axis) => FORWARD_KEY[axis] === key)) return 1;
  if (axes.some((axis) => BACKWARD_KEY[axis] === key)) return -1;
  return 0;
}

function edgeOf(
  key: string,
  enabled: readonly boolean[],
  current: number,
): number | undefined {
  const index =
    key === "Home" ? enabled.indexOf(true) : enabled.lastIndexOf(true);
  return index === -1 || index === current ? undefined : index;
}

/**
 * Picks the item a key press moves focus to, with the rules of the web roving
 * focus group. Arrows step to the next enabled item and wrap past the last
 * item when `loop` holds. Home and End jump to the first and last enabled
 * item. Other keys do nothing. React Native delivers these keys from hardware
 * keyboards and D-pads that emit `onKeyDown`.
 *
 * @param options - The focused index, which items can take focus, the key, the wrap rule and the axis.
 * @returns The index to focus, or `undefined` when focus does not move.
 * @example
 * rovingTarget({ current: 2, enabled: [true, true, true], key: "ArrowRight", loop: true }); // 0
 */
export function rovingTarget({
  current,
  enabled,
  key,
  loop,
  orientation,
}: RovingTargetOptions): number | undefined {
  const count = enabled.length;
  if (current < 0 || current >= count) return undefined;
  if (key === "Home" || key === "End") return edgeOf(key, enabled, current);
  const step = stepOf(key, orientation);
  if (step === 0) return undefined;
  return Array.from(
    { length: count - 1 },
    (_, offset) => current + step * (offset + 1),
  )
    .filter((raw) => loop || (raw >= 0 && raw < count))
    .map((raw) => ((raw % count) + count) % count)
    .find((index) => enabled[index] === true);
}
