import { createContext, type ReactNode, type Ref, use, useMemo } from "react";

import {
  StyleSheet,
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextInput,
  type TextInputProps,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Input } from "../input/input";
import { Label } from "../label/label";

type FieldContextValue = { readonly invalid: boolean };
const FieldContext = createContext<FieldContextValue | null>(null);

function useField(): FieldContextValue {
  const context = use(FieldContext);
  if (!context)
    throw new Error("Field subcomponents must be used within Field");
  return context;
}

/** Props for a native field composition root. */
export type FieldProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly invalid?: boolean;
  readonly orientation?: "horizontal" | "vertical";
  readonly ref?: Ref<View>;
};
/** Props for the visible native field label. */
export type FieldLabelProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};
/** Props for the native text control in a field composition. */
export type FieldControlProps = TextInputProps & {
  readonly ref?: Ref<TextInput>;
};
/** Props for native field helper text. */
export type FieldDescriptionProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};
/** Props for a native field error announcement. */
export type FieldErrorProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};

const styles = StyleSheet.create({
  horizontal: { alignItems: "center", flexDirection: "row" },
  vertical: { flexDirection: "column" },
});

/** Groups one native text control with its label and supporting messages. */
function Field({
  children,
  invalid = false,
  orientation = "vertical",
  ref,
  style,
  ...props
}: FieldProps) {
  const theme = useTheme();
  const value = useMemo(() => ({ invalid }), [invalid]);
  return (
    <FieldContext value={value}>
      <View
        {...props}
        ref={ref}
        style={[
          orientation === "horizontal" ? styles.horizontal : styles.vertical,
          {
            gap:
              orientation === "horizontal"
                ? theme.spacing[3]
                : theme.spacing[1],
          },
          style,
        ]}
      >
        {children}
      </View>
    </FieldContext>
  );
}
Field.displayName = "Field";

/** Visible label that reflects its field's invalid state. */
function FieldLabel({ ref, ...props }: FieldLabelProps) {
  const { invalid } = useField();
  return <Label {...props} invalid={invalid} ref={ref} />;
}
FieldLabel.displayName = "FieldLabel";

/** Native text input that reflects its field's invalid state. */
function FieldControl({ ref, ...props }: FieldControlProps) {
  const { invalid } = useField();
  return <Input {...props} aria-invalid={invalid} ref={ref} />;
}
FieldControl.displayName = "FieldControl";

/** Supporting text for a native field. */
function FieldDescription({ ref, style, ...props }: FieldDescriptionProps) {
  const theme = useTheme();
  useField();
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        { color: theme.colors.mutedForeground },
        style,
      ]}
    />
  );
}
FieldDescription.displayName = "FieldDescription";

/** Error text announced when rendered inside an invalid field. */
function FieldError({ children, ref, style, ...props }: FieldErrorProps) {
  const theme = useTheme();
  const { invalid } = useField();
  if (!invalid || children === undefined || children === null) return null;
  return (
    <NativeText
      {...props}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      ref={ref}
      style={[
        theme.typography.scale.bodySmall,
        {
          color: theme.colors.destructive,
          fontWeight: theme.typography.fontWeight.caption,
        },
        style,
      ]}
    >
      {children}
    </NativeText>
  );
}
FieldError.displayName = "FieldError";

export { Field, FieldControl, FieldDescription, FieldError, FieldLabel };
