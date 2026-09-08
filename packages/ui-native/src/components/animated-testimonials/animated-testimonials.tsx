"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { Ref } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified testimonial. */
export type AnimatedTestimonial = {
  readonly id: string;
  readonly name: string;
  readonly quote: string;
  readonly title: string;
};

/** Localized labels for testimonial navigation. */
export type AnimatedTestimonialsLabels = {
  readonly next: string;
  readonly pause: string;
  readonly position: (index: number, total: number) => string;
  readonly previous: string;
  readonly region: string;
  readonly resume: string;
};

/** Props for controlled or uncontrolled native testimonial rotation. */
export type AnimatedTestimonialsProps = Omit<ViewProps, "children" | "ref"> & {
  readonly autoplay?: boolean;
  readonly autoplayInterval?: number;
  readonly defaultSelectedId?: string;
  readonly labels: AnimatedTestimonialsLabels;
  readonly onSelectedIdChange?: (id: string) => void;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly selectedId?: string;
  readonly testimonials: readonly AnimatedTestimonial[];
};

const MAX_TIMER_DELAY = 2_147_483_647;
const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  root: { borderWidth: 1 },
});

function TestimonialCard({
  animate,
  reduceMotion,
  testimonial,
}: {
  readonly animate: boolean;
  readonly reduceMotion: boolean;
  readonly testimonial: AnimatedTestimonial;
}) {
  const theme = useTheme();
  const [animateOnMount, setAnimateOnMount] = useState(animate);
  const [progress, setProgress] = useState(
    () => new Animated.Value(animate && !reduceMotion ? 0 : 1),
  );
  void setAnimateOnMount;
  void setProgress;
  const animationConsumed = useRef(false);

  useEffect(() => {
    if (reduceMotion) {
      animationConsumed.current = true;
      progress.stopAnimation();
      progress.setValue(1);
      return;
    }
    if (!animateOnMount || animationConsumed.current) return;

    animationConsumed.current = true;
    const animation = Animated.timing(progress, {
      duration: 100,
      toValue: 1,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
      progress.setValue(1);
    };
  }, [animateOnMount, progress, reduceMotion]);
  return (
    <Animated.View
      accessibilityLiveRegion="polite"
      style={{
        gap: theme.spacing[2],
        opacity: progress,
        transform: [
          {
            translateX: progress.interpolate({
              inputRange: [0, 1],
              outputRange: [4, 0],
            }),
          },
        ],
      }}
    >
      <Text
        style={[
          theme.typography.scale.bodyLarge,
          { color: theme.colors.cardForeground },
        ]}
      >
        {testimonial.quote}
      </Text>
      <Text
        style={[
          theme.typography.scale.bodySmall,
          {
            color: theme.colors.cardForeground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {testimonial.name}
      </Text>
      <Text
        style={[
          theme.typography.scale.caption,
          { color: theme.colors.mutedForeground },
        ]}
      >
        {testimonial.title}
      </Text>
    </Animated.View>
  );
}
TestimonialCard.displayName = "TestimonialCard";

/**
 * Keeps the initial testimonial visible and animates later selections only
 * after a non-reduced motion preference is known.
 */
function AnimatedTestimonials({
  autoplay = false,
  autoplayInterval = 5000,
  defaultSelectedId,
  labels,
  onSelectedIdChange,
  reducedMotionService,
  ref,
  selectedId,
  style,
  testimonials,
  ...props
}: AnimatedTestimonialsProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const [autoplayPaused, setAutoplayPaused] = useState(false);
  const [selection, setSelection] = useControllableState(
    selectedId === undefined
      ? {
          defaultValue: defaultSelectedId ?? testimonials[0]?.id ?? "",
          mode: "uncontrolled",
          onChange: onSelectedIdChange,
        }
      : { mode: "controlled", onChange: onSelectedIdChange, value: selectedId },
  );
  const selectedIndex = Math.max(
    0,
    testimonials.findIndex((item) => item.id === selection),
  );
  const active = testimonials[selectedIndex];
  const move = useCallback(
    (step: number) => {
      if (testimonials.length === 0) return;
      const nextIndex =
        (selectedIndex + step + testimonials.length) % testimonials.length;
      const next = testimonials[nextIndex];
      if (next) setSelection(next.id);
    },
    [selectedIndex, setSelection, testimonials],
  );

  useEffect(() => {
    if (!autoplay || autoplayPaused || reduceMotion || testimonials.length <= 1)
      return;
    const safeInterval = Number.isFinite(autoplayInterval)
      ? Math.min(MAX_TIMER_DELAY, Math.max(1000, autoplayInterval))
      : 5000;
    const timer = setInterval(() => {
      move(1);
    }, safeInterval);
    return () => {
      clearInterval(timer);
    };
  }, [
    autoplay,
    autoplayInterval,
    autoplayPaused,
    move,
    reduceMotion,
    testimonials.length,
  ]);

  if (!active) return null;
  const controlsDisabled = testimonials.length <= 1;
  return (
    <View
      {...props}
      accessibilityLabel={labels.region}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          gap: theme.spacing[4],
          padding: theme.spacing[6],
        },
        style,
      ]}
    >
      <TestimonialCard
        animate={!reduceMotion}
        key={active.id}
        reduceMotion={reduceMotion}
        testimonial={active}
      />
      <View style={styles.actions}>
        <Pressable
          accessibilityLabel={labels.previous}
          accessibilityRole="button"
          accessibilityState={{ disabled: controlsDisabled }}
          disabled={controlsDisabled}
          onPress={() => {
            if (autoplay) setAutoplayPaused(true);
            move(-1);
          }}
          style={styles.action}
        >
          <Text style={{ color: theme.colors.foreground }}>
            {labels.previous}
          </Text>
        </Pressable>
        <Text
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {labels.position(selectedIndex + 1, testimonials.length)}
        </Text>
        {autoplay && !reduceMotion && !controlsDisabled ? (
          <Pressable
            accessibilityLabel={autoplayPaused ? labels.resume : labels.pause}
            accessibilityRole="button"
            onPress={() => {
              setAutoplayPaused((paused) => !paused);
            }}
            style={styles.action}
          >
            <Text style={{ color: theme.colors.foreground }}>
              {autoplayPaused ? labels.resume : labels.pause}
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          accessibilityLabel={labels.next}
          accessibilityRole="button"
          accessibilityState={{ disabled: controlsDisabled }}
          disabled={controlsDisabled}
          onPress={() => {
            if (autoplay) setAutoplayPaused(true);
            move(1);
          }}
          style={styles.action}
        >
          <Text style={{ color: theme.colors.foreground }}>{labels.next}</Text>
        </Pressable>
      </View>
    </View>
  );
}
AnimatedTestimonials.displayName = "AnimatedTestimonials";

export { AnimatedTestimonials };
