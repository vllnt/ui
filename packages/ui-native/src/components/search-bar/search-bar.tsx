import { type Ref, useState } from "react";

import {
  StyleSheet,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Button } from "../button/button";
import { Input } from "../input/input";

/** Props for an explicit native search action. */
export type SearchBarProps = Omit<ViewProps, "children"> & {
  readonly buttonLabel?: string;
  readonly defaultValue?: string;
  readonly inputProps?: Omit<
    TextInputProps,
    "defaultValue" | "onChangeText" | "value"
  >;
  readonly onSearch: (query: string) => void;
  readonly onValueChange?: (value: string) => void;
  readonly ref?: Ref<View>;
  readonly value?: string;
};

const styles = StyleSheet.create({
  input: { flex: 1 },
  root: { alignItems: "center", flexDirection: "row", width: "100%" },
});

/** Native search field and action that submit a trimmed query. */
function SearchBar({
  buttonLabel = "Search",
  defaultValue = "",
  inputProps,
  onSearch,
  onValueChange,
  ref,
  style,
  value,
  ...props
}: SearchBarProps) {
  const theme = useTheme();
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const update = (next: string) => {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  };
  const submit = () => {
    onSearch(currentValue.trim());
  };

  return (
    <View
      {...props}
      accessibilityRole="search"
      ref={ref}
      style={[styles.root, { gap: theme.spacing[2] }, style]}
    >
      <Input
        {...inputProps}
        accessibilityLabel={
          inputProps?.accessibilityLabel ??
          inputProps?.placeholder ??
          buttonLabel
        }
        inputMode="search"
        onChangeText={update}
        onSubmitEditing={(event) => {
          submit();
          inputProps?.onSubmitEditing?.(event);
        }}
        returnKeyType={inputProps?.returnKeyType ?? "search"}
        style={[styles.input, inputProps?.style]}
        value={currentValue}
      />
      <Button onPress={submit} variant="outline">
        {buttonLabel}
      </Button>
    </View>
  );
}
SearchBar.displayName = "SearchBar";

export { SearchBar };
