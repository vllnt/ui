"use client";

import { createContext, type ReactNode, type Ref, use, useMemo } from "react";

import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  isMultipleSelected,
  type SelectionKey,
  selectSingle,
  toggleMultipleSelected,
} from "../../primitives/selection";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Layout axis for a native toggle group. */
export type ToggleGroupOrientation = "horizontal" | "vertical";

type ToggleGroupBaseProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly orientation?: ToggleGroupOrientation;
  readonly ref?: Ref<View>;
};

type ToggleGroupSingleProps = ToggleGroupBaseProps & {
  readonly defaultValue?: SelectionKey;
  readonly onValueChange?: (value?: SelectionKey) => void;
  readonly type: "single";
  readonly value?: SelectionKey;
};

type ToggleGroupMultipleProps = ToggleGroupBaseProps & {
  readonly defaultValue?: readonly SelectionKey[];
  readonly onValueChange?: (value: readonly SelectionKey[]) => void;
  readonly type: "multiple";
  readonly value?: readonly SelectionKey[];
};

/** Props for a controlled or uncontrolled native single/multiple toggle group. */
export type ToggleGroupProps =
  | ToggleGroupMultipleProps
  | ToggleGroupSingleProps;

/** Props for an item identified by a caller-owned stable value. */
export type ToggleGroupItemProps = Omit<PressableProps, "children"> & {
  readonly children: ReactNode;
  readonly ref?: Ref<View>;
  readonly value: SelectionKey;
};

type ToggleGroupContextValue = {
  readonly disabled: boolean;
  readonly selectedKeys: ReadonlySet<SelectionKey>;
  readonly toggle: (key: SelectionKey) => void;
};

const ToggleGroupContext = createContext<ToggleGroupContextValue | undefined>(
  undefined,
);

const styles = StyleSheet.create({
  horizontal: { alignItems: "center", flexDirection: "row" },
  item: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  vertical: { alignItems: "stretch", flexDirection: "column" },
});

function identity(key: SelectionKey): SelectionKey {
  return key;
}

function firstKey(keys: ReadonlySet<SelectionKey>): SelectionKey | undefined {
  for (const key of keys) return key;
  return undefined;
}

function selectedKeysFromProps(
  props: ToggleGroupProps,
  source: "defaultValue" | "value",
): ReadonlySet<SelectionKey> {
  if (props.type === "single") {
    const value = props[source];
    return value === undefined ? new Set() : new Set([value]);
  }
  return new Set(props[source] ?? []);
}

function notifyValueChange(
  props: ToggleGroupProps,
  keys: ReadonlySet<SelectionKey>,
): void {
  if (props.type === "single") props.onValueChange?.(firstKey(keys));
  else props.onValueChange?.([...keys]);
}

/** Native toggle group using caller-owned item values for stable selection. */
function ToggleGroup(props: ToggleGroupProps) {
  const {
    children,
    defaultValue: _defaultValue,
    disabled = false,
    onValueChange: _onValueChange,
    orientation = "horizontal",
    ref,
    style,
    type: _type,
    value: _value,
    ...viewProps
  } = props;
  const [selectedKeys, setSelectedKeys] = useControllableState(
    "value" in props
      ? {
          mode: "controlled",
          onChange: (keys) => {
            notifyValueChange(props, keys);
          },
          value: selectedKeysFromProps(props, "value"),
        }
      : {
          defaultValue: selectedKeysFromProps(props, "defaultValue"),
          mode: "uncontrolled",
          onChange: (keys) => {
            notifyValueChange(props, keys);
          },
        },
  );
  const context = useMemo<ToggleGroupContextValue>(
    () => ({
      disabled: disabled ?? undefined,
      selectedKeys,
      toggle(key) {
        if (props.type === "single") {
          const current = firstKey(selectedKeys);
          const selected = isMultipleSelected(selectedKeys, key, identity);
          setSelectedKeys(
            selected
              ? new Set()
              : new Set([selectSingle(current, key, identity)]),
          );
        } else {
          setSelectedKeys(toggleMultipleSelected(selectedKeys, key, identity));
        }
      },
    }),
    [disabled, props.type, selectedKeys, setSelectedKeys],
  );
  const theme = useTheme();

  return (
    <View
      {...viewProps}
      accessibilityRole="none"
      accessibilityState={{
        ...viewProps.accessibilityState,
        disabled: disabled ?? undefined,
      }}
      ref={ref}
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        { gap: theme.spacing[1], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <ToggleGroupContext value={context}>{children}</ToggleGroupContext>
    </View>
  );
}
ToggleGroup.displayName = "ToggleGroup";

/** Native toggle-group item keyed by its required stable value prop. */
function ToggleGroupItem({
  accessibilityState,
  children,
  disabled = false,
  onPress,
  ref,
  style,
  value,
  ...props
}: ToggleGroupItemProps) {
  const context = use(ToggleGroupContext);
  if (context === undefined) {
    throw new Error("ToggleGroupItem must be rendered inside ToggleGroup.");
  }
  const theme = useTheme();
  const selected = isMultipleSelected(context.selectedKeys, value, identity);
  const isDisabled = Boolean(context.disabled || disabled);
  const content =
    typeof children === "number" || typeof children === "string" ? (
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          {
            color: selected
              ? theme.colors.accentForeground
              : theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {children}
      </NativeText>
    ) : (
      children
    );

  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{
        ...accessibilityState,
        disabled: isDisabled,
        selected,
      }}
      disabled={isDisabled}
      onPress={(event) => {
        onPress?.(event);
        if (!event?.defaultPrevented) context.toggle(value);
      }}
      ref={ref}
      style={(state) => [
        styles.item,
        {
          backgroundColor: selected ? theme.colors.accent : "transparent",
          borderRadius: theme.radius.md,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[3],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {content}
    </Pressable>
  );
}
ToggleGroupItem.displayName = "ToggleGroupItem";

export { ToggleGroup, ToggleGroupItem };
