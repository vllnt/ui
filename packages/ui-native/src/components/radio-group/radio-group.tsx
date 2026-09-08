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
  isSingleSelected,
  type SelectionKey,
  selectSingle,
} from "../../primitives/selection";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Layout axis for a native radio group. */
export type RadioGroupOrientation = "horizontal" | "vertical";

/** Props for a controlled or uncontrolled native radio group. */
export type RadioGroupProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly defaultValue?: SelectionKey;
  readonly disabled?: boolean;
  readonly onValueChange?: (value: SelectionKey | undefined) => void;
  readonly orientation?: RadioGroupOrientation;
  readonly ref?: Ref<View>;
  readonly value?: SelectionKey;
};

/** Props for a radio item identified by a caller-owned stable value. */
export type RadioGroupItemProps = Omit<PressableProps, "children"> & {
  readonly children?: ReactNode;
  readonly ref?: Ref<View>;
  readonly value: SelectionKey;
};

type RadioGroupContextValue = {
  readonly disabled: boolean;
  readonly select: (value: SelectionKey) => void;
  readonly value?: SelectionKey;
};

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(
  undefined,
);

const styles = StyleSheet.create({
  horizontal: { alignItems: "center", flexDirection: "row" },
  indicator: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  item: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 44,
    minWidth: 44,
  },
  mark: { height: 10, width: 10 },
  vertical: { alignItems: "stretch", flexDirection: "column" },
});

function identity(key: SelectionKey): SelectionKey {
  return key;
}

/** Native radio group using caller-owned item values for stable selection. */
function RadioGroup(groupProps: RadioGroupProps) {
  const {
    accessibilityState,
    children,
    defaultValue,
    disabled = false,
    onValueChange,
    orientation = "vertical",
    ref,
    style,
    value,
    ...props
  } = groupProps;
  const [selectedValue, setSelectedValue] = useControllableState(
    "value" in groupProps
      ? { mode: "controlled", onChange: onValueChange, value }
      : {
          defaultValue,
          mode: "uncontrolled",
          onChange: onValueChange,
        },
  );
  const context = useMemo<RadioGroupContextValue>(
    () => ({
      disabled: disabled ?? undefined,
      select(nextValue) {
        setSelectedValue(selectSingle(selectedValue, nextValue, identity));
      },
      value: selectedValue,
    }),
    [disabled, selectedValue, setSelectedValue],
  );
  const theme = useTheme();

  return (
    <View
      {...props}
      accessibilityRole="radiogroup"
      accessibilityState={{
        ...accessibilityState,
        disabled: disabled ?? undefined,
      }}
      ref={ref}
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        { gap: theme.spacing[2], opacity: disabled ? 0.5 : 1 },
        style,
      ]}
    >
      <RadioGroupContext value={context}>{children}</RadioGroupContext>
    </View>
  );
}
RadioGroup.displayName = "RadioGroup";

/** Accessible native radio keyed by its required stable value prop. */
function RadioGroupItem({
  accessibilityState,
  children,
  disabled = false,
  onPress,
  ref,
  style,
  value,
  ...props
}: RadioGroupItemProps) {
  const context = use(RadioGroupContext);
  if (context === undefined) {
    throw new Error("RadioGroupItem must be rendered inside RadioGroup.");
  }
  const theme = useTheme();
  const checked = isSingleSelected(context.value, value, identity);
  const isDisabled = Boolean(context.disabled || disabled);

  return (
    <Pressable
      {...props}
      accessibilityRole="radio"
      accessibilityState={{
        ...accessibilityState,
        checked,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onPress={(event) => {
        onPress?.(event);
        if (!event?.defaultPrevented) context.select(value);
      }}
      ref={ref}
      style={(state) => [
        styles.item,
        {
          gap: theme.spacing[2],
          opacity: isDisabled ? 0.5 : state.pressed ? 0.8 : 1,
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <View
        accessibilityElementsHidden
        importantForAccessibility="no"
        style={[
          styles.indicator,
          {
            borderColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            borderWidth: 1,
          },
        ]}
      >
        {checked ? (
          <View
            style={[
              styles.mark,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
              },
            ]}
          />
        ) : null}
      </View>
      {typeof children === "number" || typeof children === "string" ? (
        <NativeText
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.foreground },
          ]}
        >
          {children}
        </NativeText>
      ) : (
        children
      )}
    </Pressable>
  );
}
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
