"use client";

import { type RefObject, useCallback, useEffect, useState } from "react";

import {
  type LayoutChangeEvent,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";

/** Edge of the anchor a floating panel opens against. */
export type PlacementSide = "bottom" | "left" | "right" | "top";
/** Alignment of the panel along the anchor edge. `start` means left or top. */
export type PlacementAlign = "center" | "end" | "start";

/** Web placement props, shared by popover, dropdown menu and tooltip. */
export type PlacementProps = {
  readonly align?: PlacementAlign;
  readonly alignOffset?: number;
  readonly side?: PlacementSide;
  readonly sideOffset?: number;
};

/** Window-space box of a measured element. */
export type PlacementRect = {
  readonly height: number;
  readonly width: number;
  readonly x: number;
  readonly y: number;
};

/** Width and height of a laid-out panel or of the window. */
export type PlacementSize = {
  readonly height: number;
  readonly width: number;
};

/** The three boxes {@link computePlacement} reads. */
export type PlacementGeometry = {
  readonly anchor: PlacementRect;
  readonly bounds: PlacementSize;
  readonly panel: PlacementSize;
};

type Span = { readonly size: number; readonly start: number };
type Measured = "unmeasurable" | PlacementRect;

const EDGE_PADDING = 8;
const HIDDEN: ViewStyle = {
  left: 0,
  opacity: 0,
  position: "absolute",
  top: 0,
};

type MeasurableNode = {
  readonly measureInWindow: (
    callback: (...box: readonly number[]) => void,
  ) => void;
};

function isMeasurable(value: unknown): value is MeasurableNode {
  return (
    typeof value === "object" &&
    value !== null &&
    "measureInWindow" in value &&
    typeof value.measureInWindow === "function"
  );
}

function clamp(value: number, size: number, limit: number): number {
  const max = limit - size - EDGE_PADDING;
  return Math.max(EDGE_PADDING, Math.min(value, max));
}

function alignedStart(
  anchor: Span,
  panelSize: number,
  placement: PlacementProps,
): number {
  const { align = "center", alignOffset = 0 } = placement;
  if (align === "start") return anchor.start + alignOffset;
  if (align === "end") {
    return anchor.start + anchor.size - panelSize - alignOffset;
  }
  return anchor.start + (anchor.size - panelSize) / 2;
}

function sideStart(
  anchor: Span,
  panelSize: number,
  placement: PlacementProps,
): number {
  const { side = "bottom", sideOffset = 4 } = placement;
  return side === "top" || side === "left"
    ? anchor.start - panelSize - sideOffset
    : anchor.start + anchor.size + sideOffset;
}

/**
 * Places a panel against an anchor the way the web tokens do: on one `side`,
 * aligned along that edge, pushed away by `sideOffset` and slid along the edge
 * by `alignOffset` (toward the end for `start`, toward the start for `end`;
 * `center` ignores it). The result stays inside the window with an 8 pt
 * margin. There is no flipping: a panel that does not fit on its side stays on
 * it and overlaps the anchor through the clamp.
 *
 * @param geometry - The anchor, panel and window boxes.
 * @param placement - Web placement props; defaults are bottom, center, 4, 0.
 * @returns The panel's window-space left and top.
 * @example
 * computePlacement({ anchor, bounds, panel }, { side: "top" });
 */
function computePlacement(
  geometry: PlacementGeometry,
  placement: PlacementProps = {},
): { readonly left: number; readonly top: number } {
  const { anchor, bounds, panel } = geometry;
  const { side = "bottom" } = placement;
  const x: Span = { size: anchor.width, start: anchor.x };
  const y: Span = { size: anchor.height, start: anchor.y };
  const vertical = side === "top" || side === "bottom";
  const left = vertical
    ? alignedStart(x, panel.width, placement)
    : sideStart(x, panel.width, placement);
  const top = vertical
    ? sideStart(y, panel.height, placement)
    : alignedStart(y, panel.height, placement);
  return {
    left: clamp(left, panel.width, bounds.width),
    top: clamp(top, panel.height, bounds.height),
  };
}

function measureAnchor(node: unknown): Promise<Measured> {
  return new Promise((resolve) => {
    if (!isMeasurable(node)) {
      resolve("unmeasurable");
      return;
    }
    node.measureInWindow((...box) => {
      const [x = 0, y = 0, width = 0, height = 0] = box;
      resolve({ height, width, x, y });
    });
  });
}

function useAnchorRect(
  anchorRef: RefObject<unknown> | undefined,
  active: boolean,
): Measured | undefined {
  const { height, width } = useWindowDimensions();
  const [measured, setMeasured] = useState<Measured>();

  useEffect(() => {
    if (!active || !anchorRef) return;
    let current = true;
    void measureAnchor(anchorRef.current).then((next) => {
      if (current) setMeasured(next);
    });
    return () => {
      current = false;
      setMeasured(undefined);
    };
  }, [active, anchorRef, height, width]);

  return measured;
}

function usePanelSize() {
  const [size, setSize] = useState<PlacementSize>();
  const onLayout = useCallback((event: LayoutChangeEvent) => {
    const { height, width } = event.nativeEvent.layout;
    setSize((previous) =>
      previous?.height === height && previous.width === width
        ? previous
        : { height, width },
    );
  }, []);
  return { onLayout, size };
}

/** What {@link useAnchoredPanel} hands the panel it positions. */
export type AnchoredPanel = {
  readonly onLayout: (event: LayoutChangeEvent) => void;
  /** Absolute placement. Absent while the panel keeps its centred layout. */
  readonly style?: ViewStyle;
};

/** Options for {@link useAnchoredPanel}. */
export type AnchoredPanelOptions = PlacementProps & {
  readonly active: boolean;
  readonly anchorRef?: RefObject<unknown>;
};

/**
 * Measures `anchorRef` each time the panel opens, and when the window size
 * changes, then returns the style that places the panel against it. Without an
 * anchor, or when the anchor has no `measureInWindow`, the style stays absent
 * and the panel keeps its centred layout. While a measurement runs, the panel
 * lays out invisibly so it can report its size.
 *
 * @param options - Placement props, the anchor and whether the panel is open.
 * @returns A layout handler for the panel and its placement style.
 */
function useAnchoredPanel({
  active,
  anchorRef,
  ...placement
}: AnchoredPanelOptions): AnchoredPanel {
  const bounds = useWindowDimensions();
  const anchor = useAnchorRect(anchorRef, active);
  const { onLayout, size } = usePanelSize();

  if (!active || !anchorRef || anchor === "unmeasurable") return { onLayout };
  if (!anchor || !size) return { onLayout, style: HIDDEN };
  const { left, top } = computePlacement(
    { anchor, bounds, panel: size },
    placement,
  );
  return { onLayout, style: { left, position: "absolute", top } };
}

export { computePlacement, useAnchoredPanel };
