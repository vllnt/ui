"use client";

import {
  type ComponentRef,
  type Ref,
  useEffect,
  useMemo,
  useState,
} from "react";

import { Animated, StyleSheet, type TextProps } from "react-native";

import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Props for the native animated number renderer. */
export type NumberTickerProps = Omit<TextProps, "children"> & {
  readonly delay?: number;
  readonly duration?: number;
  readonly formatOptions?: Intl.NumberFormatOptions;
  readonly from?: number;
  readonly locale?: string;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<ComponentRef<typeof Animated.Text>>;
  readonly value: number;
};

const styles = StyleSheet.create({
  value: { fontVariant: ["tabular-nums"] },
});

/** Animated native metric text with immediate reduced-motion state. */
function NumberTicker({
  accessibilityLabel,
  delay = 0,
  duration = 1.2,
  formatOptions,
  from = 0,
  locale,
  reducedMotionService,
  ref,
  style,
  value,
  ...props
}: NumberTickerProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const animatedValue = useMemo(() => new Animated.Value(from), [from]);
  const [currentValue, setCurrentValue] = useState(from);
  const formatter = useMemo(
    () => Intl.NumberFormat(locale, formatOptions),
    [formatOptions, locale],
  );

  useEffect(() => {
    animatedValue.stopAnimation();
    if (reduceMotion || duration <= 0) {
      animatedValue.setValue(value);
      setCurrentValue(value);
      return;
    }

    animatedValue.setValue(from);
    setCurrentValue(from);
    const listenerId = animatedValue.addListener(({ value: nextValue }) => {
      setCurrentValue(nextValue);
    });
    const animation = Animated.sequence([
      Animated.delay(Math.max(0, delay) * 1000),
      Animated.timing(animatedValue, {
        duration: Math.max(0, duration) * 1000,
        toValue: value,
        useNativeDriver: false,
      }),
    ]);
    animation.start();

    return () => {
      animation.stop();
      animatedValue.removeListener(listenerId);
    };
  }, [animatedValue, delay, duration, from, reduceMotion, value]);

  const finalLabel = formatter.format(value);
  const displayedValue = reduceMotion ? value : currentValue;
  return (
    <Animated.Text
      {...props}
      accessibilityLabel={accessibilityLabel ?? finalLabel}
      accessible
      ref={ref}
      style={[
        theme.typography.scale.body,
        styles.value,
        { color: theme.colors.foreground },
        style,
      ]}
    >
      {formatter.format(displayedValue)}
    </Animated.Text>
  );
}
NumberTicker.displayName = "NumberTicker";

export { NumberTicker };
