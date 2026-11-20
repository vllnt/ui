"use client";

import { type Ref, useEffect, useMemo } from "react";

import {
  Animated,
  Easing,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import {
  type ReducedMotionService,
  useReducedMotion,
} from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

/** Elements the web `Display` renders as; native exposes `h1` and `h2` as headers. */
export type DisplayElement = "div" | "h1" | "h2" | "p" | "span";

/** Props for oversized native display text. */
export type DisplayProps = TextProps & {
  /**
   * Plays a rise-in reveal on mount. Skipped when the user asks the platform
   * to reduce motion.
   */
  readonly animated?: boolean;
  /**
   * Web element name. `h1` and `h2` set `accessibilityRole="header"`; every
   * other element renders plain text with no role.
   */
  readonly as?: DisplayElement;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<NativeTextInstance>;
};

const HEADER_ELEMENTS: ReadonlySet<DisplayElement> = new Set(["h1", "h2"]);

/**
 * Hero text on the theme's display type scale. A static surface, so press and
 * hover do nothing. Pass `as="h1"` for a hero heading and `animated` for a
 * rise-in reveal that reduced motion skips.
 */
function Display({
  accessibilityRole,
  animated = false,
  as = "div",
  reducedMotionService,
  ref,
  style,
  ...props
}: DisplayProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const progress = useMemo(() => new Animated.Value(1), []);
  const reveal = animated && !reduceMotion;

  useEffect(() => {
    if (!reveal) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      duration: theme.motion.duration.slow,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [progress, reveal, theme.motion.duration.slow]);

  return (
    <Animated.Text
      {...props}
      accessibilityRole={
        accessibilityRole ?? (HEADER_ELEMENTS.has(as) ? "header" : undefined)
      }
      ref={ref}
      style={[
        theme.typography.scale.display,
        {
          color: theme.colors.foreground,
          fontWeight: theme.typography.fontWeight.display,
        },
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [theme.spacing[2], 0],
              }),
            },
          ],
        },
        style,
      ]}
    />
  );
}
Display.displayName = "Display";

export { Display };
