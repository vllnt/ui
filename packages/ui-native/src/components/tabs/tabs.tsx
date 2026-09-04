"use client";

import {
  createContext,
  type ReactNode,
  type Ref,
  use,
  useId,
  useMemo,
} from "react";

import {
  Pressable,
  type PressableProps,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import { isSingleSelected } from "../../primitives/selection";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

type TabsContextValue = {
  readonly baseId: string;
  readonly onValueChange: (value: string) => void;
  readonly value: string;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

function useTabs(): TabsContextValue {
  const context = use(TabsContext);
  if (!context) throw new Error("Tab components must be used within Tabs");
  return context;
}

/** Props for controlled or uncontrolled native tabs. */
export type TabsProps = Omit<ViewProps, "children" | "ref"> & {
  readonly children: ReactNode;
  readonly defaultValue?: string;
  readonly id?: string;
  readonly onValueChange?: (value: string) => void;
  readonly ref?: Ref<View>;
  readonly value?: string;
};

/** Props for the horizontally scrollable tab list. */
export type TabsListProps = Omit<
  ScrollViewProps,
  "children" | "horizontal" | "ref"
> & {
  readonly children: ReactNode;
  readonly ref?: Ref<ScrollView>;
};

/** Props for one native tab trigger. */
export type TabsTriggerProps = Omit<
  PressableProps,
  "children" | "onPress" | "ref"
> & {
  readonly children: ReactNode;
  readonly ref?: Ref<View>;
  readonly value: string;
};

/** Props for a panel rendered only while its tab is selected. */
export type TabsContentProps = Omit<ViewProps, "children" | "ref"> & {
  readonly children?: ReactNode;
  readonly ref?: Ref<View>;
  readonly value: string;
};

const styles = StyleSheet.create({
  list: { borderBottomWidth: 1, flexDirection: "row" },
  trigger: {
    alignItems: "center",
    borderBottomWidth: 2,
    justifyContent: "center",
    minHeight: 44,
  },
});

/** Native tabs state boundary with stable trigger and panel identifiers. */
function Tabs({
  children,
  defaultValue = "",
  id,
  onValueChange,
  ref,
  style,
  value,
  ...props
}: TabsProps) {
  const generatedId = useId();
  const options: ControllableStateOptions<string> =
    value === undefined
      ? { defaultValue, mode: "uncontrolled", onChange: onValueChange }
      : { mode: "controlled", onChange: onValueChange, value };
  const [selectedValue, setSelectedValue] = useControllableState(options);
  const context = useMemo(
    () => ({
      baseId: id ?? generatedId,
      onValueChange: setSelectedValue,
      value: selectedValue,
    }),
    [generatedId, id, selectedValue, setSelectedValue],
  );

  return (
    <TabsContext value={context}>
      <View {...props} ref={ref} style={style}>
        {children}
      </View>
    </TabsContext>
  );
}
Tabs.displayName = "Tabs";

/** Accessible horizontal list of native tab triggers. */
function TabsList({
  children,
  contentContainerStyle,
  ref,
  style,
  ...props
}: TabsListProps) {
  const theme = useTheme();
  return (
    <ScrollView
      {...props}
      accessibilityRole="tablist"
      contentContainerStyle={[
        styles.list,
        { borderBottomColor: theme.colors.border },
        contentContainerStyle,
      ]}
      horizontal
      ref={ref}
      showsHorizontalScrollIndicator={false}
      style={style}
    >
      {children}
    </ScrollView>
  );
}
TabsList.displayName = "TabsList";

/** Selectable native tab with selected semantics and stable identifiers. */
function TabsTrigger({
  accessibilityLabel,
  children,
  disabled = false,
  ref,
  style,
  value,
  ...props
}: TabsTriggerProps) {
  const theme = useTheme();
  const tabs = useTabs();
  const selected = isSingleSelected(
    tabs.value,
    value,
    (candidate) => candidate,
  );
  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ disabled: disabled ?? undefined, selected }}
      aria-controls={selected ? `${tabs.baseId}-panel-${value}` : undefined}
      disabled={disabled}
      id={`${tabs.baseId}-tab-${value}`}
      onPress={() => {
        tabs.onValueChange(value);
      }}
      ref={ref}
      style={(state) => [
        styles.trigger,
        {
          backgroundColor: state.pressed ? theme.colors.accent : "transparent",
          borderBottomColor: selected ? theme.colors.primary : "transparent",
          opacity: disabled ? 0.5 : state.pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[4],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          size="small"
          tone={selected ? "default" : "muted"}
          weight="medium"
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}
TabsTrigger.displayName = "TabsTrigger";

/** Optional native tab panel, omitted when not selected. */
function TabsContent({
  children,
  ref,
  style,
  value,
  ...props
}: TabsContentProps) {
  const theme = useTheme();
  const tabs = useTabs();
  if (!isSingleSelected(tabs.value, value, (candidate) => candidate)) {
    return null;
  }
  return (
    <View
      {...props}
      aria-labelledby={`${tabs.baseId}-tab-${value}`}
      id={`${tabs.baseId}-panel-${value}`}
      ref={ref}
      style={[{ paddingTop: theme.spacing[4] }, style]}
    >
      {children}
    </View>
  );
}
TabsContent.displayName = "TabsContent";

export { Tabs, TabsContent, TabsList, TabsTrigger };
