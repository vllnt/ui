"use client";

import {
  createContext,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import type { NativeTheme } from "@vllnt/ui-core";
import {
  type PressableProps,
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
  type ViewProps,
  type ViewStyle,
} from "react-native";

import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { isSingleSelected } from "../../../primitives/selection";
import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";
import { useControllableState } from "../../../primitives/use-controllable-state";
import { useTheme } from "../../../theme/theme-provider";
import { Text } from "../../atoms/text/text";

/**
 * Look of the tab triggers, as on web: `underline` is the default, `pill` fills
 * the selected trigger and `link` is plain text with an underlined selection.
 */
export type TabsVariant = "link" | "pill" | "underline";

type TabsContextValue = {
  readonly baseId: string;
  readonly onValueChange: (value: string) => void;
  readonly panels: readonly string[];
  readonly register: (kind: "panels" | "triggers", value: string) => () => void;
  readonly triggers: readonly string[];
  readonly value: string;
  readonly variant: TabsVariant;
};

const TabsContext = createContext<TabsContextValue | undefined>(undefined);
const TabsListLabelContext = createContext<string | undefined>(undefined);

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
  /** Look of the triggers, shared with `TabsList` and `TabsTrigger`. Defaults to `underline`. */
  readonly variant?: TabsVariant;
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
  list: { flexDirection: "row" },
  trigger: { alignItems: "center", justifyContent: "center" },
  underlined: { textDecorationLine: "underline" },
});

function listStyle(theme: NativeTheme, variant: TabsVariant): ViewStyle {
  if (variant === "underline")
    return { borderBottomColor: theme.colors.border, borderBottomWidth: 1 };
  if (variant === "pill") return { gap: theme.spacing[1] };
  return {};
}

function triggerStyle(
  theme: NativeTheme,
  variant: TabsVariant,
  selected: boolean,
): ViewStyle {
  const paddingHorizontal = theme.spacing[4];
  if (variant === "pill")
    return {
      backgroundColor: selected ? theme.colors.secondary : "transparent",
      borderRadius: theme.radius.full,
      paddingHorizontal,
    };
  if (variant === "link") return { paddingHorizontal };
  return {
    borderBottomColor: selected ? theme.colors.primary : "transparent",
    borderBottomWidth: 2,
    paddingHorizontal,
  };
}

/** Native tabs state boundary with stable trigger and panel identifiers. */
function Tabs({
  children,
  defaultValue = "",
  id,
  onValueChange,
  ref,
  style,
  value,
  variant = "underline",
  ...props
}: TabsProps) {
  const generatedId = useId();
  const options: ControllableStateOptions<string> =
    value === undefined
      ? { defaultValue, mode: "uncontrolled", onChange: onValueChange }
      : { mode: "controlled", onChange: onValueChange, value };
  const [selectedValue, setSelectedValue] = useControllableState(options);
  const [mounted, setMounted] = useState<{
    panels: readonly string[];
    triggers: readonly string[];
  }>({ panels: [], triggers: [] });
  const register = useCallback(
    (kind: "panels" | "triggers", registeredValue: string) => {
      setMounted((current) => ({
        ...current,
        [kind]: [...current[kind], registeredValue],
      }));
      return () => {
        setMounted((current) => ({
          ...current,
          [kind]: current[kind].filter((item) => item !== registeredValue),
        }));
      };
    },
    [],
  );
  const context = useMemo(
    () => ({
      baseId: id ?? generatedId,
      ...mounted,
      onValueChange: setSelectedValue,
      register,
      value: selectedValue,
      variant,
    }),
    [
      generatedId,
      id,
      mounted,
      register,
      selectedValue,
      setSelectedValue,
      variant,
    ],
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

/**
 * Accessible horizontal list of native tab triggers. VoiceOver ignores
 * labels on the non-focusable list, so its `accessibilityLabel` becomes each
 * tab's hint. Outside `Tabs` it draws the `underline` look.
 */
function TabsList({
  accessibilityLabel,
  children,
  contentContainerStyle,
  ref,
  style,
  ...props
}: TabsListProps) {
  const theme = useTheme();
  const variant = use(TabsContext)?.variant ?? "underline";
  return (
    <ScrollView
      {...props}
      accessibilityRole="tablist"
      contentContainerStyle={[
        styles.list,
        listStyle(theme, variant),
        contentContainerStyle,
      ]}
      horizontal
      ref={ref}
      showsHorizontalScrollIndicator={false}
      style={style}
    >
      <TabsListLabelContext value={accessibilityLabel}>
        {children}
      </TabsListLabelContext>
    </ScrollView>
  );
}
TabsList.displayName = "TabsList";

/** Selectable native tab with selected semantics and stable identifiers. */
function TabsTrigger({
  accessibilityHint,
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
  const listLabel = use(TabsListLabelContext);
  const { register } = tabs;
  useEffect(() => register("triggers", value), [register, value]);
  const selected = isSingleSelected(
    tabs.value,
    value,
    (candidate) => candidate,
  );
  return (
    <InteractivePressable
      {...props}
      accessibilityHint={accessibilityHint ?? listLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tab"
      accessibilityState={{ disabled: disabled ?? undefined, selected }}
      disabled={disabled}
      filled={tabs.variant === "pill" && selected}
      id={`${tabs.baseId}-tab-${value}`}
      onPress={() => {
        tabs.onValueChange(value);
      }}
      ref={ref}
      selected={selected}
      style={(state) => [
        styles.trigger,
        triggerStyle(theme, tabs.variant, selected),
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text
          size="small"
          style={
            tabs.variant === "link" && selected ? styles.underlined : undefined
          }
          tone={selected ? "default" : "muted"}
          weight="medium"
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </InteractivePressable>
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
  const selected = isSingleSelected(
    tabs.value,
    value,
    (candidate) => candidate,
  );
  const { register } = tabs;
  useEffect(() => {
    if (selected) return register("panels", value);
    return;
  }, [register, selected, value]);
  if (!selected) {
    return null;
  }
  return (
    <View
      {...props}
      aria-labelledby={
        tabs.triggers.includes(value)
          ? `${tabs.baseId}-tab-${value}`
          : undefined
      }
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
