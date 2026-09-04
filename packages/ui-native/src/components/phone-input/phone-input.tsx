import type { Ref } from "react";
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

/** Country metadata displayed by a native phone input. */
export type PhoneCountry = {
  readonly code: string;
  readonly dialCode: string;
  readonly label: string;
};
/** Props for a native telephone input with an optional externally managed country action. */
export type PhoneInputProps = TextInputProps & {
  readonly country?: PhoneCountry;
  readonly countryAccessibilityLabel?: string;
  readonly disabled?: boolean;
  readonly onPressCountry?: () => void;
  readonly ref?: Ref<TextInput>;
};

const styles = StyleSheet.create({
  country: {
    alignItems: "center",
    alignSelf: "stretch",
    borderRightWidth: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
  input: { borderRadius: 0, borderWidth: 0, flex: 1 },
  root: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 40,
    overflow: "hidden",
    width: "100%",
  },
});

/** Native phone input that delegates country selection to an application-owned picker. */
function PhoneInput({
  country,
  countryAccessibilityLabel = "Choose country dialing code",
  disabled = false,
  onPressCountry,
  ref,
  style,
  ...props
}: PhoneInputProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.input,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {country ? (
        <Pressable
          accessibilityLabel={countryAccessibilityLabel}
          accessibilityRole={onPressCountry ? "button" : "text"}
          accessibilityState={{
            disabled: disabled || onPressCountry === undefined,
          }}
          disabled={disabled || onPressCountry === undefined}
          onPress={onPressCountry}
          style={[
            styles.country,
            {
              borderColor: theme.colors.input,
              paddingHorizontal: theme.spacing[3],
            },
          ]}
        >
          <NativeText
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.foreground },
            ]}
          >
            {country.dialCode}
          </NativeText>
        </Pressable>
      ) : null}
      <Input
        {...props}
        disabled={disabled}
        inputMode="tel"
        ref={ref}
        style={[styles.input, style]}
      />
    </View>
  );
}
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
