"use client";

import {
  Children,
  type ReactNode,
  type Ref,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Animated,
  Easing,
  type LayoutChangeEvent,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Native marquee speed presets. */
export type MarqueeSpeed = "fast" | "normal" | "slow";

/** Props for a content-sized native marquee lane. */
export type MarqueeProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly duration?: number;
  readonly gap?: number;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly repeat?: number;
  readonly reverse?: boolean;
  readonly speed?: MarqueeSpeed;
  readonly vertical?: boolean;
};

const styles = StyleSheet.create({
  root: { overflow: "hidden", width: "100%" },
  row: { alignItems: "center", flexDirection: "row" },
  track: { flexShrink: 0 },
  vertical: { flexDirection: "column" },
});

function getDuration(
  duration: number | undefined,
  speed: MarqueeSpeed,
): number {
  if (duration !== undefined) return duration;
  if (speed === "fast") return 10;
  if (speed === "slow") return 32;
  return 20;
}

function MarqueeItems({
  children,
  repeat,
}: {
  readonly children: ReactNode;
  readonly repeat: number;
}) {
  const items = Children.toArray(children);
  return Array.from(
    { length: Math.max(1, Math.floor(repeat)) },
    (_, copyIndex) =>
      items.map((item, itemIndex) => (
        <View key={`${copyIndex}-${itemIndex}`}>{item}</View>
      )),
  );
}
MarqueeItems.displayName = "MarqueeItems";

function useMarqueeOffset({
  duration,
  gap,
  laneSize,
  reduceMotion,
  reverse,
}: {
  readonly duration: number;
  readonly gap: number;
  readonly laneSize: number;
  readonly reduceMotion: boolean;
  readonly reverse: boolean;
}): Animated.Value {
  const offset = useMemo(() => new Animated.Value(0), []);
  useEffect(() => {
    offset.stopAnimation();
    if (reduceMotion || laneSize <= 0 || duration <= 0) {
      offset.setValue(0);
      return;
    }
    const distance = laneSize + gap;
    offset.setValue(reverse ? -distance : 0);
    const animation = Animated.loop(
      Animated.timing(offset, {
        duration: duration * 1000,
        easing: Easing.linear,
        toValue: reverse ? 0 : -distance,
        useNativeDriver: true,
      }),
    );
    animation.start();
    return () => {
      animation.stop();
    };
  }, [duration, gap, laneSize, offset, reduceMotion, reverse]);
  return offset;
}

function MarqueeTrack({
  children,
  directionStyle,
  gap,
  onLaneSize,
  reduceMotion,
  transformStyle,
  vertical,
  viewportMinimum,
}: {
  readonly children: ReactNode;
  readonly directionStyle: ViewProps["style"];
  readonly gap: number;
  readonly onLaneSize: (size: number) => void;
  readonly reduceMotion: boolean;
  readonly transformStyle: ViewProps["style"];
  readonly vertical: boolean;
  readonly viewportMinimum: ViewProps["style"];
}) {
  return (
    <Animated.View
      style={[styles.track, directionStyle, { gap }, transformStyle]}
    >
      <View
        onLayout={(event) => {
          onLaneSize(
            vertical
              ? event.nativeEvent.layout.height
              : event.nativeEvent.layout.width,
          );
        }}
        style={[directionStyle, viewportMinimum, { gap }]}
      >
        {children}
      </View>
      {reduceMotion ? null : (
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          style={[directionStyle, viewportMinimum, { gap }]}
        >
          {children}
        </View>
      )}
    </Animated.View>
  );
}
MarqueeTrack.displayName = "MarqueeTrack";

/**
 * Continuous RN Animated content lane. Native core intentionally leaves out
 * hover pausing and edge masks because it lacks those interaction primitives.
 */
function Marquee({
  children,
  duration,
  gap,
  onLayout,
  reducedMotionService,
  ref,
  repeat = 1,
  reverse = false,
  speed = "normal",
  style,
  vertical = false,
  ...props
}: MarqueeProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [laneSize, setLaneSize] = useState(0);
  const [viewportSize, setViewportSize] = useState(0);
  const resolvedGap = gap ?? theme.spacing[4];
  const resolvedDuration = getDuration(duration, speed);
  const offset = useMarqueeOffset({
    duration: resolvedDuration,
    gap: resolvedGap,
    laneSize,
    reduceMotion,
    reverse,
  });
  const directionStyle = vertical ? styles.vertical : styles.row;
  const viewportMinimum = vertical
    ? { minHeight: viewportSize }
    : { minWidth: viewportSize };
  const transformStyle = vertical
    ? { transform: [{ translateY: offset }] }
    : { transform: [{ translateX: offset }] };
  const trackItems = useMemo(
    () => <MarqueeItems repeat={repeat}>{children}</MarqueeItems>,
    [children, repeat],
  );

  const handleRootLayout = (event: LayoutChangeEvent) => {
    const layout = event.nativeEvent.layout;
    setViewportSize(vertical ? layout.height : layout.width);
    onLayout?.(event);
  };

  return (
    <View
      {...props}
      onLayout={handleRootLayout}
      ref={ref}
      style={[styles.root, style]}
    >
      <MarqueeTrack
        directionStyle={directionStyle}
        gap={resolvedGap}
        onLaneSize={setLaneSize}
        reduceMotion={reduceMotion}
        transformStyle={transformStyle}
        vertical={vertical}
        viewportMinimum={viewportMinimum}
      >
        {trackItems}
      </MarqueeTrack>
    </View>
  );
}
Marquee.displayName = "Marquee";

export { Marquee };
