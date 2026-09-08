"use client";

import { createContext, type ReactNode, type Ref, use, useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

const FormContext = createContext<(() => void) | null>(null);

/** Props for a native form grouping boundary. */
export type FormProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly label: string;
  readonly onSubmit: () => void;
  readonly ref?: Ref<View>;
};
/** Props for the explicit native form submit action. */
export type FormSubmitProps = Omit<ViewProps, "children"> & {
  readonly children: string;
  readonly disabled?: boolean;
  readonly ref?: Ref<View>;
};
/** Props for an announced native form validation message. */
export type FormMessageProps = Omit<ViewProps, "children"> & {
  readonly children?: string;
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  root: { width: "100%" },
});

/** Native form semantic group; submission occurs only through FormSubmit. */
function Form({ children, label, onSubmit, ref, style, ...props }: FormProps) {
  const theme = useTheme();
  const submit = useMemo(() => onSubmit, [onSubmit]);
  return (
    <FormContext value={submit}>
      <View
        accessibilityLabel={label}
        ref={ref}
        style={[styles.root, { gap: theme.spacing[4] }, style]}
        {...props}
      >
        {children}
      </View>
    </FormContext>
  );
}
Form.displayName = "Form";

/** Explicit 44-point action that invokes the nearest Form submission callback. */
function FormSubmit({
  children,
  disabled = false,
  ref,
  style,
  ...props
}: FormSubmitProps) {
  const theme = useTheme();
  const submit = use(FormContext);
  if (!submit) throw new Error("FormSubmit must be used within Form");
  return (
    <Pressable
      {...props}
      accessibilityLabel={children}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={submit}
      ref={ref}
      style={[
        styles.action,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.md,
          opacity: disabled ? 0.5 : 1,
          paddingHorizontal: theme.spacing[4],
        },
        style,
      ]}
    >
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          { color: theme.colors.primaryForeground },
        ]}
      >
        {children}
      </NativeText>
    </Pressable>
  );
}
FormSubmit.displayName = "FormSubmit";

/** Validation message announced only when non-empty. */
function FormMessage({ children, ref, ...props }: FormMessageProps) {
  const theme = useTheme();
  if (!children) return null;
  return (
    <View
      {...props}
      accessibilityLabel={children}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      accessible
      ref={ref}
    >
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          { color: theme.colors.destructive },
        ]}
      >
        {children}
      </NativeText>
    </View>
  );
}
FormMessage.displayName = "FormMessage";

export { Form, FormMessage, FormSubmit };
