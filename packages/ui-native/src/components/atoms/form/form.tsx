"use client";

import { createContext, type ReactNode, type Ref, use, useMemo } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useAnnounceOnChange } from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import { typeStyle } from "../../../primitives/type-style";
import { useTheme } from "../../../theme/theme-provider";

type FormContextValue = {
  readonly label: string;
  readonly submit: () => void;
};
const FormContext = createContext<FormContextValue | null>(null);

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

/**
 * Native form grouping boundary; submission occurs only through FormSubmit.
 * React Native has no form role and VoiceOver ignores labels on non-focusable
 * containers, so the form `label` is the submit action's hint.
 */
function Form({ children, label, onSubmit, ref, style, ...props }: FormProps) {
  const theme = useTheme();
  const context = useMemo(
    () => ({ label, submit: onSubmit }),
    [label, onSubmit],
  );
  return (
    <FormContext value={context}>
      <View
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
  disabled: ownDisabled = false,
  ref,
  style,
  ...props
}: FormSubmitProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const form = use(FormContext);
  if (!form) throw new Error("FormSubmit must be used within Form");
  return (
    <Pressable
      accessibilityHint={form.label}
      {...props}
      accessibilityLabel={children}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={form.submit}
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
      <NativeText style={typeStyle(theme, "bodySmall", "primaryForeground")}>
        {children}
      </NativeText>
    </Pressable>
  );
}
FormSubmit.displayName = "FormSubmit";

/**
 * Validation message: TalkBack speaks it through its live region and iOS
 * receives an announcement whenever a non-empty message appears.
 */
function FormMessage({ children, ref, ...props }: FormMessageProps) {
  const theme = useTheme();
  useAnnounceOnChange(children || undefined, {
    initial: true,
    liveRegion: true,
  });
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
      <NativeText style={typeStyle(theme, "bodySmall", "destructive")}>
        {children}
      </NativeText>
    </View>
  );
}
FormMessage.displayName = "FormMessage";

export { Form, FormMessage, FormSubmit };
