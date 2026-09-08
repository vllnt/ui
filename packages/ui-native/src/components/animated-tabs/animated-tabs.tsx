"use client";

import { useEffect, useId, useRef } from "react";

import type { ReactNode, Ref } from "react";
import {
  Animated,
  Pressable,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { isSingleSelected } from "../../primitives/selection";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import type { ReducedMotionService } from "../../primitives/use-reduced-motion";
import { useReducedMotion } from "../../primitives/use-reduced-motion";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** One native animated tab. */
export type AnimatedTab = {
  readonly disabled?: boolean;
  readonly label: string;
  readonly panel?: ReactNode;
  readonly value: string;
};

/** Props for token-driven animated native tabs. */
export type AnimatedTabsProps = Omit<ViewProps, "children" | "ref"> & {
  readonly defaultValue?: string;
  readonly id?: string;
  readonly onValueChange?: (value: string) => void;
  readonly reducedMotionService?: ReducedMotionService;
  readonly ref?: Ref<View>;
  readonly tabs: readonly AnimatedTab[];
  readonly value?: string;
};

type AnimatedTabTriggerProps = {
  readonly baseId: string;
  readonly onSelect: () => void;
  readonly reduceMotion: boolean;
  readonly selected: boolean;
  readonly tab: AnimatedTab;
};

const styles = StyleSheet.create({
  indicator: { bottom: 0, left: 0, position: "absolute", right: 0, top: 0 },
  list: { flexDirection: "row" },
  root: { width: "100%" },
  trigger: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

function AnimatedTabTrigger({
  baseId,
  onSelect,
  reduceMotion,
  selected,
  tab,
}: AnimatedTabTriggerProps) {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(selected ? 1 : 0)).current;

  useEffect(() => {
    const animation = Animated.timing(opacity, {
      duration: reduceMotion ? 0 : 100,
      toValue: selected ? 1 : 0,
      useNativeDriver: true,
    });
    animation.start();
    return () => {
      animation.stop();
    };
  }, [opacity, reduceMotion, selected]);

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ disabled: tab.disabled, selected }}
      aria-controls={
        selected && tab.panel !== undefined
          ? `${baseId}-panel-${tab.value}`
          : undefined
      }
      disabled={tab.disabled}
      id={`${baseId}-tab-${tab.value}`}
      onPress={onSelect}
      style={[
        styles.trigger,
        {
          borderRadius: theme.radius.md,
          paddingHorizontal: theme.spacing[3],
        },
      ]}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.indicator,
          {
            backgroundColor: theme.colors.primary,
            borderRadius: theme.radius.md,
            opacity,
          },
        ]}
      />
      <Text
        size="small"
        style={{
          color: selected
            ? theme.colors.primaryForeground
            : theme.colors.mutedForeground,
        }}
        weight="medium"
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}
AnimatedTabTrigger.displayName = "AnimatedTabTrigger";

/** Native tabs with a purposeful selected pill and reduced-motion support. */
function AnimatedTabs({
  defaultValue,
  id,
  onValueChange,
  reducedMotionService,
  ref,
  style,
  tabs,
  value,
  ...props
}: AnimatedTabsProps) {
  const theme = useTheme();
  const generatedId = useId();
  const reduceMotion = useReducedMotion(reducedMotionService);
  const options: ControllableStateOptions<string> =
    value === undefined
      ? {
          defaultValue: defaultValue ?? tabs[0]?.value ?? "",
          mode: "uncontrolled",
          onChange: onValueChange,
        }
      : {
          mode: "controlled",
          onChange: onValueChange,
          value,
        };
  const [selectedValue, setSelectedValue] = useControllableState(options);
  const selectedTab = tabs.find((tab) =>
    isSingleSelected(selectedValue, tab, (candidate) => candidate.value),
  );
  const baseId = id ?? generatedId;

  return (
    <View {...props} ref={ref} style={[styles.root, style]}>
      <View
        accessibilityRole="tablist"
        style={[
          styles.list,
          {
            backgroundColor: theme.colors.muted,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            borderWidth: 1,
            gap: theme.spacing[1],
            padding: theme.spacing[1],
          },
        ]}
      >
        {tabs.map((tab) => (
          <AnimatedTabTrigger
            baseId={baseId}
            key={tab.value}
            onSelect={() => {
              setSelectedValue(tab.value);
            }}
            reduceMotion={reduceMotion}
            selected={isSingleSelected(
              selectedValue,
              tab,
              (candidate) => candidate.value,
            )}
            tab={tab}
          />
        ))}
      </View>
      {selectedTab?.panel === undefined ? null : (
        <View
          aria-labelledby={`${baseId}-tab-${selectedTab.value}`}
          id={`${baseId}-panel-${selectedTab.value}`}
          style={{ paddingTop: theme.spacing[4] }}
        >
          {selectedTab.panel}
        </View>
      )}
    </View>
  );
}
AnimatedTabs.displayName = "AnimatedTabs";

export { AnimatedTabs };
