"use client";

import { type Ref, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  type TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Input } from "../input/input";

/** Props for a controlled or uncontrolled native search field. */
export type SearchFieldProps = Omit<
  TextInputProps,
  "defaultValue" | "onChange" | "onChangeText" | "value"
> & {
  readonly clearLabel?: string;
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly onValueChange?: (value: string) => void;
  readonly ref?: Ref<TextInput>;
  readonly value?: string;
};

const styles = StyleSheet.create({
  clear: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    minWidth: 44,
    position: "absolute",
    right: 0,
    top: 0,
  },
  input: { paddingRight: 44 },
  root: { justifyContent: "center", width: "100%" },
});

/** Native search input with a clear action when it contains text. */
function SearchField({
  accessibilityLabel,
  clearLabel = "Clear search",
  defaultValue = "",
  disabled = false,
  onValueChange,
  placeholder = "Search…",
  ref,
  style,
  value,
  ...props
}: SearchFieldProps) {
  const theme = useTheme();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const update = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };

  return (
    <View style={styles.root}>
      <Input
        {...props}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        disabled={disabled}
        inputMode="search"
        onChangeText={update}
        placeholder={placeholder}
        ref={ref}
        returnKeyType={props.returnKeyType ?? "search"}
        style={[styles.input, style]}
        value={currentValue}
      />
      {currentValue.length > 0 ? (
        <Pressable
          accessibilityLabel={clearLabel}
          accessibilityRole="button"
          accessibilityState={{ disabled }}
          disabled={disabled}
          onPress={() => {
            update("");
          }}
          style={styles.clear}
        >
          <NativeText style={{ color: theme.colors.mutedForeground }}>
            ×
          </NativeText>
        </Pressable>
      ) : null}
    </View>
  );
}
SearchField.displayName = "SearchField";

export { SearchField };
