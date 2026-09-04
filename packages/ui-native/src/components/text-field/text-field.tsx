import type { ReactNode, Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  type TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Input } from "../input/input";
import { Label } from "../label/label";

/** Props for a labelled native text input with helper and error text. */
export type TextFieldProps = TextInputProps & {
  readonly description?: string;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly label?: ReactNode;
  readonly ref?: Ref<TextInput>;
  readonly rootProps?: ViewProps;
};

const styles = StyleSheet.create({ root: { width: "100%" } });

/** Native text input bundled with its visible label, description, and error. */
function TextField({
  accessibilityHint,
  accessibilityLabel,
  description,
  error,
  label,
  ref,
  rootProps,
  ...props
}: TextFieldProps) {
  const theme = useTheme();
  const hint =
    [accessibilityHint, description, error]
      .filter((value) => value !== undefined && value.length > 0)
      .join(" ") || undefined;

  return (
    <View
      {...rootProps}
      style={[styles.root, { gap: theme.spacing[1] }, rootProps?.style]}
    >
      {label ? <Label invalid={error !== undefined}>{label}</Label> : null}
      <Input
        {...props}
        accessibilityHint={hint}
        accessibilityLabel={
          accessibilityLabel ?? (typeof label === "string" ? label : undefined)
        }
        aria-invalid={error !== undefined}
        ref={ref}
      />
      {description ? (
        <NativeText
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {description}
        </NativeText>
      ) : null}
      {error ? (
        <NativeText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            theme.typography.scale.bodySmall,
            {
              color: theme.colors.destructive,
              fontWeight: theme.typography.fontWeight.caption,
            },
          ]}
        >
          {error}
        </NativeText>
      ) : null}
    </View>
  );
}
TextField.displayName = "TextField";

export { TextField };
