import { screen } from "@testing-library/react-native";
import type { ViewStyle } from "react-native";

import { styleOf } from "./test-utils";

/** A rendered host element, as `screen.toJSON()` reports it. */
export type HostJson = {
  readonly children: readonly (HostJson | string)[];
  readonly props: Readonly<Record<string, unknown>>;
  readonly type: string;
};

type Sides = {
  readonly bottom: number;
  readonly left: number;
  readonly right: number;
  readonly top: number;
};

type Bag = Readonly<Record<string, unknown>>;

/**
 * What decides a control's outer size: its own size rules, its margin, the
 * space padding and border take inside it, and the in-flow children that fill
 * it. Colours, opacity and outlines are not part of it.
 */
export type LayoutBox = {
  readonly flow: readonly LayoutBox[];
  /** Padding plus border on each side. */
  readonly inset: Sides;
  readonly margin: Sides;
  readonly size: Bag;
};

const SIZE_KEYS = [
  "flex",
  "flexBasis",
  "flexGrow",
  "flexShrink",
  "height",
  "maxHeight",
  "maxWidth",
  "minHeight",
  "minWidth",
  "width",
] as const;

const SIDE_NAMES = {
  bottom: "Bottom",
  left: "Left",
  right: "Right",
  top: "Top",
} as const;

const AXIS_NAMES = {
  bottom: "Vertical",
  left: "Horizontal",
  right: "Horizontal",
  top: "Vertical",
} as const;

type Side = keyof Sides;

function isRecord(value: unknown): value is Bag {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toHost(value: unknown): HostJson | undefined {
  if (!isRecord(value) || typeof value.type !== "string") return undefined;
  const children = Array.isArray(value.children)
    ? value.children.flatMap((child: unknown): (HostJson | string)[] => {
        if (typeof child === "string") return [child];
        const host = toHost(child);
        return host ? [host] : [];
      })
    : [];
  return {
    children,
    props: isRecord(value.props) ? value.props : {},
    type: value.type,
  };
}

function rootHosts(): HostJson[] {
  const tree: unknown = screen.toJSON();
  return (Array.isArray(tree) ? tree : [tree]).flatMap((root: unknown) => {
    const host = toHost(root);
    return host ? [host] : [];
  });
}

function descendants(host: HostJson): HostJson[] {
  return [
    host,
    ...host.children.flatMap((child) =>
      typeof child === "string" ? [] : descendants(child),
    ),
  ];
}

function textOf(host: HostJson): string {
  return host.children
    .map((child) => (typeof child === "string" ? child : textOf(child)))
    .join("");
}

function nameOf(host: HostJson): string {
  const { accessibilityLabel } = host.props;
  return typeof accessibilityLabel === "string"
    ? accessibilityLabel
    : textOf(host);
}

function pixels(value: unknown): number {
  return typeof value === "number" ? value : 0;
}

function spacing(style: Bag, kind: "margin" | "padding", side: Side): number {
  return pixels(
    style[`${kind}${SIDE_NAMES[side]}`] ??
      style[`${kind}${AXIS_NAMES[side]}`] ??
      style[kind],
  );
}

function border(style: Bag, side: Side): number {
  return pixels(style[`border${SIDE_NAMES[side]}Width`] ?? style.borderWidth);
}

function sides(read: (side: Side) => number): Sides {
  return {
    bottom: read("bottom"),
    left: read("left"),
    right: read("right"),
    top: read("top"),
  };
}

function lyingOutOfFlow(host: HostJson): boolean {
  return { ...styleOf(host) }.position === "absolute";
}

/**
 * Finds the host with an accessibility role and a name (its label, or else its
 * text) in the current render.
 *
 * @param role - The `accessibilityRole` to match.
 * @param name - The accessibility label or text content to match.
 * @returns The first matching host.
 * @example
 * findHost("button", "Save");
 */
export function findHost(role: string, name: string): HostJson {
  const found = rootHosts()
    .flatMap(descendants)
    .find(
      (host) => host.props.accessibilityRole === role && nameOf(host) === name,
    );
  if (!found) throw new Error(`No ${role} named "${name}" in the render`);
  return found;
}

/**
 * Reduces a host to the values that decide its outer size, with one level of
 * in-flow children. A child with `position: "absolute"` sits out of the flow
 * and cannot change the box, so the measure skips it.
 *
 * @param host - The host to measure.
 * @param depth - The number of levels of in-flow children to include.
 * @returns The layout box, comparable with `toEqual`.
 * @example
 * expect(layoutBox(findHost("button", "Save"))).toEqual(rest);
 */
export function layoutBox(host: HostJson, depth = 1): LayoutBox {
  const style: Bag = { ...styleOf(host) };
  return {
    flow:
      depth > 0
        ? host.children.flatMap((child) =>
            typeof child === "string" || lyingOutOfFlow(child)
              ? []
              : [layoutBox(child, depth - 1)],
          )
        : [],
    inset: sides(
      (side) => spacing(style, "padding", side) + border(style, side),
    ),
    margin: sides((side) => spacing(style, "margin", side)),
    size: Object.fromEntries(SIZE_KEYS.map((key) => [key, style[key]])),
  };
}

/**
 * The first child of a host with `position: "absolute"`, which is where a
 * control draws its selection frame.
 *
 * @param host - The control's host.
 * @returns The frame's props and flattened style, or `undefined` without one.
 * @example
 * frameOf(findHost("togglebutton", "Bold"))?.style.borderWidth; // 2
 */
export function frameOf(
  host: HostJson,
): undefined | { readonly props: Bag; readonly style: ViewStyle } {
  const frame = host.children.find(
    (child): child is HostJson =>
      typeof child !== "string" && lyingOutOfFlow(child),
  );
  return frame
    ? { props: frame.props, style: { ...styleOf(frame) } }
    : undefined;
}
