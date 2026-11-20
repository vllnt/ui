"use client";

import {
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Animated,
  type GestureResponderEvent,
  type LayoutChangeEvent,
  PanResponder,
  type PanResponderGestureState,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type ViewStyle,
} from "react-native";

import {
  decorativeProps,
  useFocusWhenShown,
} from "../../../primitives/accessibility";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../../primitives/modal-layer";
import {
  clampDelta,
  resolveRelease,
  resolveSnapPoints,
  type SnapPoint,
} from "../../../primitives/snap-points";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

export type { SnapPoint } from "../../../primitives/snap-points";

/** Edge a native drawer slides in from. */
export type DrawerDirection = "bottom" | "left" | "right" | "top";

/** Props for an edge-anchored native modal drawer. */
export type DrawerProps = {
  /** Snap point the drawer rests on; controlled when present. */
  readonly activeSnapPoint?: null | SnapPoint;
  /** Moves screen-reader focus to the title when the drawer opens. */
  readonly autoFocus?: boolean;
  readonly children?: ReactNode;
  readonly closeLabel: string;
  /** Fraction of the drawer a drag must cover to close it. Defaults to 0.25. */
  readonly closeThreshold?: number;
  readonly defaultOpen?: boolean;
  readonly description?: string;
  /** Edge the drawer slides in from. Defaults to `"bottom"`. */
  readonly direction?: DrawerDirection;
  /** `false` blocks closing by back, escape and drag; the close button stays. */
  readonly dismissible?: boolean;
  /** Spoken name of the snap handle; defaults to the title. */
  readonly handleLabel?: string;
  /** Only the handle starts a drag, not the whole drawer. */
  readonly handleOnly?: boolean;
  /** `false` draws the drawer in place instead of in a host Modal. */
  readonly modal?: boolean;
  /** Called when a snap or drag-dismiss animation settles. */
  readonly onAnimationEnd?: (open: boolean) => void;
  /** Called whenever the drawer closes itself. */
  readonly onClose?: () => void;
  /** Called while dragging with the fraction dragged toward closing. */
  readonly onDrag?: (
    event: GestureResponderEvent,
    percentageDragged: number,
  ) => void;
  readonly onOpenChange?: (open: boolean) => void;
  /** Called when a drag is released; `open` is whether the drawer stays open. */
  readonly onRelease?: (event: GestureResponderEvent, open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly safeArea?: (content: ReactNode) => ReactNode;
  readonly setActiveSnapPoint?: (snapPoint: null | SnapPoint) => void;
  /**
   * Sizes the drawer rests on: a fraction of the window from 0 to 1, or a
   * `"<n>px"` string. Invalid entries are ignored.
   */
  readonly snapPoints?: readonly SnapPoint[];
  /** A fling moves one snap point at a time instead of to the furthest. */
  readonly snapToSequentialPoint?: boolean;
  readonly title: string;
};

const SNAP_DURATION = 220;
const DRAG_SLOP = 8;

const styles = StyleSheet.create({
  body: { flexGrow: 1, flexShrink: 1 },
  close: {
    alignItems: "center",
    justifyContent: "center",
  },
  handleSlot: { alignItems: "center", justifyContent: "center" },
  horizontalBar: { height: 48, width: 4 },
  verticalBar: { height: 4, width: 48 },
});

type Layout = { readonly content: ViewStyle; readonly surface: ViewStyle };

function layoutFor(
  direction: DrawerDirection,
  radius: number,
  snapSize: number | undefined,
): Layout {
  switch (direction) {
    case "top":
      return {
        content: { flex: 1, justifyContent: "flex-start" },
        surface: {
          borderBottomLeftRadius: radius,
          borderBottomRightRadius: radius,
          borderBottomWidth: 1,
          flexDirection: "column-reverse",
          height: snapSize,
          width: "100%",
        },
      };

    case "left":
      return {
        content: { alignItems: "flex-start", flex: 1 },
        surface: {
          borderBottomRightRadius: radius,
          borderRightWidth: 1,
          borderTopRightRadius: radius,
          flexDirection: "row-reverse",
          height: "100%",
          width: snapSize ?? "82%",
        },
      };

    case "right":
      return {
        content: { alignItems: "flex-end", flex: 1 },
        surface: {
          borderBottomLeftRadius: radius,
          borderLeftWidth: 1,
          borderTopLeftRadius: radius,
          flexDirection: "row",
          height: "100%",
          width: snapSize ?? "82%",
        },
      };

    case "bottom":
      return {
        content: { flex: 1, justifyContent: "flex-end" },
        surface: {
          borderTopLeftRadius: radius,
          borderTopRightRadius: radius,
          borderTopWidth: 1,
          height: snapSize,
          width: "100%",
        },
      };
  }
}

type GestureState = {
  readonly activeIndex: number;
  readonly closeThreshold: number;
  readonly dismissible: boolean;
  readonly enabled: boolean;
  readonly onDrag: DrawerProps["onDrag"];
  readonly onRelease: DrawerProps["onRelease"];
  readonly restFor: (index: number) => number;
  readonly sequential: boolean;
  readonly settle: (
    release: ReleaseTarget,
    event: GestureResponderEvent,
  ) => void;
  readonly sign: number;
  readonly sizes: readonly number[];
  readonly vertical: boolean;
};

type ReleaseTarget = ReturnType<typeof resolveRelease>;

function axisOf(gesture: PanResponderGestureState, vertical: boolean) {
  return vertical
    ? { cross: gesture.dx, distance: gesture.dy, speed: gesture.vy }
    : { cross: gesture.dy, distance: gesture.dx, speed: gesture.vx };
}

/**
 * Edge modal presentation with web drawer behaviour: snap points, drag to
 * snap or dismiss, direction and `dismissible`. Native dismissal maps back to
 * owned open state. A drag has a single-pointer alternative: with more than
 * one snap point the handle is an adjustable control that steps between them.
 */
function Drawer({
  activeSnapPoint,
  autoFocus = true,
  children,
  closeLabel,
  closeThreshold = 0.25,
  defaultOpen = false,
  description,
  direction = "bottom",
  dismissible = true,
  handleLabel,
  handleOnly = false,
  modal = true,
  onAnimationEnd,
  onClose,
  onDrag,
  onOpenChange,
  onRelease,
  onRequestClose,
  open,
  ref,
  safeArea,
  setActiveSnapPoint,
  snapPoints,
  snapToSequentialPoint = false,
  title,
}: DrawerProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const windowSize = useWindowDimensions();
  const [visible, setVisible] = useControllableState(
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const [activeSnap, setActiveSnap] = useControllableState(
    controllableOptions<null | SnapPoint>(
      activeSnapPoint,
      null,
      setActiveSnapPoint,
    ),
  );
  const [measured, setMeasured] = useState(0);
  const [released, setReleased] = useState(0);
  const travel = useMemo(() => new Animated.Value(0), []);
  const titleRef = useFocusWhenShown<Text>(visible && autoFocus);

  const vertical = direction === "top" || direction === "bottom";
  const sign = direction === "bottom" || direction === "right" ? 1 : -1;
  const axis = vertical ? windowSize.height : windowSize.width;
  const snaps = resolveSnapPoints(snapPoints ?? [], axis);
  const hasSnaps = snaps.length > 0;
  const sizes = hasSnaps ? snaps.map((snap) => snap.size) : [measured];
  const largest = sizes.at(-1) ?? 0;
  const found = snaps.findIndex((snap) => snap.point === activeSnap);
  const activeIndex = Math.max(found, 0);
  const restFor = (index: number) => largest - (sizes[index] ?? 0);
  const rest = restFor(activeIndex);
  const shownPercent = Math.round(
    ((sizes[activeIndex] ?? 0) / Math.max(axis, 1)) * 100,
  );

  const moveTo = useCallback(
    (target: number, done?: () => void) => {
      Animated.timing(travel, {
        duration: reduceMotion ? 0 : SNAP_DURATION,
        toValue: sign * target,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) done?.();
      });
    },
    [reduceMotion, sign, travel],
  );

  const closeFromUser = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    onClose?.();
    setVisible(false);
  };

  const applied = useRef<{ released: number; rest: number }>(undefined);
  useEffect(() => {
    const previous = applied.current;
    if (!visible) {
      applied.current = undefined;
      return;
    }
    applied.current = { released, rest };
    if (!previous) travel.setValue(sign * rest);
    else if (previous.rest !== rest || previous.released !== released) {
      moveTo(rest, () => onAnimationEnd?.(true));
    }
  }, [moveTo, onAnimationEnd, released, rest, sign, travel, visible]);

  const settle = (release: ReleaseTarget, event: GestureResponderEvent) => {
    onRelease?.(event, !release.close);
    if (release.close) {
      moveTo(largest, () => {
        onAnimationEnd?.(false);
        closeFromUser("requestClose");
      });
      return;
    }
    const next = snaps[release.index];
    if (next && release.index !== activeIndex) setActiveSnap(next.point);
    setReleased((count) => count + 1);
  };

  const latest = useRef<GestureState>(undefined);
  useLayoutEffect(() => {
    latest.current = {
      activeIndex,
      closeThreshold,
      dismissible,
      enabled: hasSnaps ? snaps.length > 1 || dismissible : dismissible,
      onDrag,
      onRelease,
      restFor,
      sequential: snapToSequentialPoint,
      settle,
      sign,
      sizes,
      vertical,
    };
  });

  const responder = useMemo(() => {
    const deltaOf = (gesture: PanResponderGestureState) => {
      const state = latest.current;
      if (!state) return 0;
      const { distance } = axisOf(gesture, state.vertical);
      return clampDelta(state.sign * distance, {
        activeIndex: state.activeIndex,
        dismissible: state.dismissible,
        sizes: state.sizes,
      });
    };
    return PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) => {
        const state = latest.current;
        if (!state?.enabled) return false;
        const { cross, distance } = axisOf(gesture, state.vertical);
        return (
          Math.abs(distance) > DRAG_SLOP && Math.abs(distance) > Math.abs(cross)
        );
      },
      onPanResponderGrant: () => {
        travel.stopAnimation();
      },
      onPanResponderMove: (event, gesture) => {
        const state = latest.current;
        if (!state) return;
        const delta = deltaOf(gesture);
        travel.setValue(
          state.sign * (state.restFor(state.activeIndex) + delta),
        );
        const size = state.sizes[state.activeIndex] ?? 1;
        state.onDrag?.(event, Math.min(Math.max(delta / size, 0), 1));
      },
      onPanResponderRelease: (event, gesture) => {
        const state = latest.current;
        if (!state) return;
        state.settle(
          resolveRelease({
            activeIndex: state.activeIndex,
            closeThreshold: state.closeThreshold,
            delta: deltaOf(gesture),
            dismissible: state.dismissible,
            sequential: state.sequential,
            sizes: state.sizes,
            velocity: state.sign * axisOf(gesture, state.vertical).speed,
          }),
          event,
        );
      },
      onPanResponderTerminate: (event) => {
        const state = latest.current;
        if (!state) return;
        state.settle({ close: false, index: state.activeIndex }, event);
      },
    });
  }, [travel]);

  const goToSnap = (index: number) => {
    const next = snaps[index];
    if (next) setActiveSnap(next.point);
  };
  const stepSnap = (step: -1 | 1) => {
    goToSnap(Math.min(Math.max(activeIndex + step, 0), snaps.length - 1));
  };

  const layout = layoutFor(
    direction,
    theme.radius.lg,
    hasSnaps ? largest : undefined,
  );
  const barStyle = [
    vertical ? styles.verticalBar : styles.horizontalBar,
    { backgroundColor: theme.colors.muted, borderRadius: theme.radius.full },
  ];
  const panHandlers = responder.panHandlers;

  return (
    <ModalLayer
      animationType={reduceMotion ? "none" : "slide"}
      contentProps={{ style: layout.content }}
      keyboardAvoidingViewProps={{ style: layout.content }}
      modal={modal}
      onClose={(reason) => {
        if (dismissible) closeFromUser(reason);
      }}
      presentationStyle="overFullScreen"
      ref={ref}
      safeArea={safeArea}
      visible={visible}
    >
      <Animated.View
        {...(handleOnly ? null : panHandlers)}
        accessible={false}
        onLayout={(event: LayoutChangeEvent) => {
          const { height, width } = event.nativeEvent.layout;
          setMeasured(vertical ? height : width);
        }}
        style={[
          layout.surface,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            gap: theme.spacing[4],
            padding: theme.spacing[4],
            transform: [
              vertical ? { translateY: travel } : { translateX: travel },
            ],
          },
        ]}
      >
        <View
          {...(handleOnly ? panHandlers : null)}
          accessible={false}
          style={styles.handleSlot}
        >
          {snaps.length > 1 ? (
            <InteractivePressable
              accessibilityActions={[
                { name: "increment" },
                { name: "decrement" },
              ]}
              accessibilityLabel={handleLabel ?? title}
              accessibilityRole="adjustable"
              accessibilityValue={{
                max: snaps.length - 1,
                min: 0,
                now: activeIndex,
                text: `${shownPercent}%`,
              }}
              onAccessibilityAction={(event) => {
                if (event.nativeEvent.actionName === "increment") stepSnap(1);
                if (event.nativeEvent.actionName === "decrement") stepSnap(-1);
              }}
              onPress={() => {
                goToSnap((activeIndex + 1) % snaps.length);
              }}
              style={styles.handleSlot}
            >
              <View {...decorativeProps} style={barStyle} />
            </InteractivePressable>
          ) : (
            <View {...decorativeProps} style={barStyle} />
          )}
        </View>
        <View style={[styles.body, { gap: theme.spacing[4] }]}>
          <Text
            accessibilityRole="header"
            ref={titleRef}
            style={typeStyle(theme, "bodyLarge", {
              color: "foreground",
              fontWeight: theme.typography.fontWeight.heading,
            })}
          >
            {title}
          </Text>
          {description ? (
            <Text style={typeStyle(theme, "bodySmall", "mutedForeground")}>
              {description}
            </Text>
          ) : null}
          {children}
          <InteractivePressable
            accessibilityLabel={closeLabel}
            accessibilityRole="button"
            filled
            onPress={() => {
              closeFromUser("requestClose");
            }}
            style={[
              styles.close,
              {
                backgroundColor: theme.colors.secondary,
                borderRadius: theme.radius.md,
              },
            ]}
          >
            <Text style={{ color: theme.colors.secondaryForeground }}>
              {closeLabel}
            </Text>
          </InteractivePressable>
        </View>
      </Animated.View>
    </ModalLayer>
  );
}
Drawer.displayName = "Drawer";

export { Drawer };
