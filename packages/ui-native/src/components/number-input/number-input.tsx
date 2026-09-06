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

function getBounds(min?: number, max?: number) {
  const safeMin = min !== undefined && Number.isFinite(min) ? min : undefined;
  const proposedMax =
    max !== undefined && Number.isFinite(max) ? max : undefined;
  const safeMax =
    safeMin !== undefined && proposedMax !== undefined
      ? Math.max(safeMin, proposedMax)
      : proposedMax;
  return { max: safeMax, min: safeMin };
}

function clamp(value: number, min?: number, max?: number): number {
  return Math.min(Math.max(value, min ?? value), max ?? value);
}

function normalizeValue(
  value: number | undefined,
  min?: number,
  max?: number,
): number | undefined {
  return value !== undefined && Number.isFinite(value)
    ? clamp(value, min, max)
    : undefined;
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
  const bounds = getBounds(min, max);
  const safeStep = Number.isFinite(step) && step > 0 ? step : 1;
  const [internalValue, setInternalValue] = useState(() =>
    normalizeValue(defaultValue, bounds.min, bounds.max),
  );
  const current = normalizeValue(
    value ?? internalValue,
    bounds.min,
    bounds.max,
  );
  const update = (next?: number) => {
    const bounded = normalizeValue(next, bounds.min, bounds.max);
    if (value === undefined) setInternalValue(bounded);
    onValueChange?.(bounded);
  };
  const decrement = () => {
    update((current ?? bounds.min ?? 0) - safeStep);
  };
  const increment = () => {
    update((current ?? bounds.min ?? 0) + safeStep);
  };
  return {
    current,
    decrementDisabled:
      disabled === true ||
      (current !== undefined &&
        bounds.min !== undefined &&
        current <= bounds.min),
    handleDecrement: decrement,
    handleIncrement: increment,
    incrementDisabled:
      disabled === true ||
      (current !== undefined &&
        bounds.max !== undefined &&
        current >= bounds.max),
    max: bounds.max,
    min: bounds.min,
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
            if (Number.isFinite(parsed)) state.update(parsed);
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

function performAccessibilityAction(
  actionName: string,
  disabled: boolean,
  state: ReturnType<typeof useNumberState>,
) {
  if (disabled) return;
  if (actionName === "decrement") state.handleDecrement();
  if (actionName === "increment") state.handleIncrement();
}

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
      accessibilityValue={{
        max: state.max,
        min: state.min,
        now: state.current,
      }}
      onAccessibilityAction={(event) => {
        performAccessibilityAction(
          event.nativeEvent.actionName,
          disabled,
          state,
        );
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
