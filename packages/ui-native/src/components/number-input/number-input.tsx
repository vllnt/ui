import { type Ref, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  type TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Input } from "../input/input";

/** Props for a native numeric input with increment and decrement actions. */
export type NumberInputProps = Omit<
  TextInputProps,
  "defaultValue" | "onChange" | "onChangeText" | "value"
> & {
  readonly decrementLabel?: string;
  readonly defaultValue?: number;
  readonly disabled?: boolean;
  readonly incrementLabel?: string;
  readonly max?: number;
  readonly min?: number;
  readonly onValueChange?: (value?: number) => void;
  readonly ref?: Ref<TextInput>;
  readonly rootProps?: ViewProps;
  readonly step?: number;
  readonly value?: number;
};

type NumberStateOptions = Pick<
  NumberInputProps,
  | "defaultValue"
  | "disabled"
  | "max"
  | "min"
  | "onValueChange"
  | "step"
  | "value"
>;

const styles = StyleSheet.create({
  input: { borderRadius: 0, borderWidth: 0, flex: 1, textAlign: "center" },
  root: {
    alignItems: "stretch",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 40,
    overflow: "hidden",
    width: "100%",
  },
  step: { alignItems: "center", justifyContent: "center", minWidth: 44 },
});

function clamp(value: number, min?: number, max?: number): number {
  return Math.min(Math.max(value, min ?? value), max ?? value);
}

function useNumberState(options: NumberStateOptions) {
  const {
    defaultValue,
    disabled,
    max,
    min,
    onValueChange,
    step = 1,
    value,
  } = options;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const current = value ?? internalValue;
  const update = (next?: number) => {
    const bounded = next === undefined ? undefined : clamp(next, min, max);
    if (value === undefined) setInternalValue(bounded);
    onValueChange?.(bounded);
  };
  const decrement = () => {
    update((current ?? min ?? 0) - step);
  };
  const increment = () => {
    update((current ?? min ?? 0) + step);
  };
  return {
    current,
    decrementDisabled:
      disabled === true ||
      (current !== undefined && min !== undefined && current <= min),
    handleDecrement: decrement,
    handleIncrement: increment,
    incrementDisabled:
      disabled === true ||
      (current !== undefined && max !== undefined && current >= max),
    update,
  };
}

function NumberStep({
  disabled,
  label,
  onPress,
  symbol,
}: {
  readonly disabled: boolean;
  readonly label: string;
  readonly onPress: () => void;
  readonly symbol: string;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={styles.step}
    >
      <NativeText style={{ color: theme.colors.foreground }}>
        {symbol}
      </NativeText>
    </Pressable>
  );
}
NumberStep.displayName = "NumberStep";

type NumberControlsProps = {
  readonly accessibilityLabel?: string;
  readonly decrementLabel: string;
  readonly disabled: boolean;
  readonly incrementLabel: string;
  readonly inputProps: TextInputProps;
  readonly inputRef?: Ref<TextInput>;
  readonly state: ReturnType<typeof useNumberState>;
};

function NumberControls({
  accessibilityLabel,
  decrementLabel,
  disabled,
  incrementLabel,
  inputProps,
  inputRef,
  state,
}: NumberControlsProps) {
  return (
    <>
      <NumberStep
        disabled={state.decrementDisabled}
        label={decrementLabel}
        onPress={state.handleDecrement}
        symbol="−"
      />
      <Input
        {...inputProps}
        accessibilityLabel={accessibilityLabel}
        disabled={disabled}
        inputMode="decimal"
        onChangeText={(text) => {
          if (text.length === 0) state.update();
          else {
            const parsed = Number(text);
            if (!Number.isNaN(parsed)) state.update(parsed);
          }
        }}
        ref={inputRef}
        style={styles.input}
        value={state.current?.toString() ?? ""}
      />
      <NumberStep
        disabled={state.incrementDisabled}
        label={incrementLabel}
        onPress={state.handleIncrement}
        symbol="+"
      />
    </>
  );
}
NumberControls.displayName = "NumberControls";

/** Controlled or uncontrolled native number editor with bounded step actions. */
function NumberInput({
  accessibilityLabel,
  decrementLabel = "Decrement",
  defaultValue,
  disabled = false,
  incrementLabel = "Increment",
  max,
  min,
  onValueChange,
  ref,
  rootProps,
  step = 1,
  value,
  ...props
}: NumberInputProps) {
  const theme = useTheme();
  const state = useNumberState({
    defaultValue,
    disabled,
    max,
    min,
    onValueChange,
    step,
    value,
  });

  return (
    <View
      {...rootProps}
      accessibilityActions={[
        { label: decrementLabel, name: "decrement" },
        { label: incrementLabel, name: "increment" },
      ]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="spinbutton"
      accessibilityState={{ disabled }}
      accessibilityValue={{ max, min, now: state.current }}
      onAccessibilityAction={(event) => {
        if (disabled) return;
        if (event.nativeEvent.actionName === "decrement") {
          state.handleDecrement();
        }
        if (event.nativeEvent.actionName === "increment") {
          state.handleIncrement();
        }
      }}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.input,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : 1,
        },
        rootProps?.style,
      ]}
    >
      <NumberControls
        accessibilityLabel={accessibilityLabel}
        decrementLabel={decrementLabel}
        disabled={disabled}
        incrementLabel={incrementLabel}
        inputProps={props}
        inputRef={ref}
        state={state}
      />
    </View>
  );
}
NumberInput.displayName = "NumberInput";

export { NumberInput };
