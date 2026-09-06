"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { useControllableState } from "../../primitives/use-controllable-state";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified native carousel slide. */
export type CarouselItem = {
  readonly content: ReactNode;
  readonly id: string;
  readonly label: string;
};

/** Localized labels for native carousel controls and position. */
export type CarouselLabels = {
  readonly next: string;
  readonly position: (index: number, total: number) => string;
  readonly previous: string;
  readonly region: string;
};

/** Props for the swipeable, controlled or uncontrolled native carousel. */
export type CarouselProps = Omit<ViewProps, "children" | "ref"> & {
  readonly defaultSelectedId?: string;
  readonly items: readonly CarouselItem[];
  readonly labels: CarouselLabels;
  readonly loop?: boolean;
  readonly onSelectedIdChange?: (id: string) => void;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly selectedId?: string;
};

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
  root: { overflow: "hidden", width: "100%" },
  slides: { flexDirection: "row" },
});

function targetIndex({
  count,
  current,
  loop,
  step,
}: {
  readonly count: number;
  readonly current: number;
  readonly loop: boolean;
  readonly step: number;
}): number {
  if (count === 0) return 0;
  if (loop) return (current + step + count) % count;
  return Math.min(count - 1, Math.max(0, current + step));
}

/**
 * Native horizontal paging surface with swipe gestures and accessible actions.
 * The host supplies stable slide ids and localized control text.
 */
function Carousel({
  defaultSelectedId,
  items,
  labels,
  loop = false,
  onLayout,
  onSelectedIdChange,
  reducedMotionService,
  ref,
  selectedId,
  style,
  ...props
}: CarouselProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const scrollRef = useRef<null | ScrollView>(null);
  const [width, setWidth] = useState(0);
  const [selection, setSelection] = useControllableState(
    selectedId === undefined
      ? {
          defaultValue: defaultSelectedId ?? items[0]?.id ?? "",
          mode: "uncontrolled",
          onChange: onSelectedIdChange,
        }
      : { mode: "controlled", onChange: onSelectedIdChange, value: selectedId },
  );
  const foundIndex = items.findIndex((item) => item.id === selection);
  const selectedIndex = foundIndex < 0 ? 0 : foundIndex;
  const move = useCallback(
    (step: number) => {
      const next =
        items[
          targetIndex({
            count: items.length,
            current: selectedIndex,
            loop,
            step,
          })
        ];
      if (next) setSelection(next.id);
    },
    [items, loop, selectedIndex, setSelection],
  );

  useEffect(() => {
    if (width <= 0) return;
    scrollRef.current?.scrollTo({
      animated: !reduceMotion,
      x: selectedIndex * width,
      y: 0,
    });
  }, [reduceMotion, selectedIndex, width]);

  const previousDisabled = items.length <= 1 || (!loop && selectedIndex === 0);
  const nextDisabled =
    items.length <= 1 || (!loop && selectedIndex === items.length - 1);
  const position =
    items.length === 0
      ? labels.position(0, 0)
      : labels.position(selectedIndex + 1, items.length);
  return (
    <View
      {...props}
      accessibilityActions={[
        { label: labels.previous, name: "decrement" },
        { label: labels.next, name: "increment" },
      ]}
      accessibilityLabel={labels.region}
      accessibilityRole="adjustable"
      accessibilityValue={{ text: position }}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === "decrement") move(-1);
        if (event.nativeEvent.actionName === "increment") move(1);
      }}
      onLayout={(event) => {
        setWidth(event.nativeEvent.layout.width);
        onLayout?.(event);
      }}
      ref={ref}
      style={[styles.root, style]}
    >
      <ScrollView
        decelerationRate="fast"
        horizontal
        onMomentumScrollEnd={(event) => {
          if (width <= 0) return;
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          const item = items[index];
          if (item) setSelection(item.id);
        }}
        pagingEnabled
        ref={scrollRef}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.slides}>
          {items.map((item, index) => (
            <View
              accessibilityElementsHidden={index !== selectedIndex}
              accessibilityLabel={item.label}
              accessibilityRole="summary"
              importantForAccessibility={
                index === selectedIndex ? "yes" : "no-hide-descendants"
              }
              key={item.id}
              style={{ width: width > 0 ? width : undefined }}
            >
              {item.content}
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.actions, { paddingTop: theme.spacing[2] }]}>
        <Pressable
          accessibilityLabel={labels.previous}
          accessibilityRole="button"
          accessibilityState={{ disabled: previousDisabled }}
          disabled={previousDisabled}
          onPress={() => {
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
          {position}
        </Text>
        <Pressable
          accessibilityLabel={labels.next}
          accessibilityRole="button"
          accessibilityState={{ disabled: nextDisabled }}
          disabled={nextDisabled}
          onPress={() => {
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
Carousel.displayName = "Carousel";

export { Carousel };
