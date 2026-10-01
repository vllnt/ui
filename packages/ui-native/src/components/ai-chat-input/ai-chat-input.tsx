"use client";

import { type ReactNode, type Ref, useCallback, useId, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import {
  joinAccessibilityText,
  useAnnounceOnChange,
} from "../../primitives/accessibility";
import { typeStyle } from "../../primitives/type-style";
import { useTheme } from "../../theme/theme-provider";

/** Explicit availability of the service receiving a chat message. */
export type AIChatServiceState =
  | { readonly message: string; readonly status: "unavailable" }
  | { readonly status: "available" };

/** Props for the native chat composer. */
export type AIChatInputProps = Omit<ViewProps, "children"> & {
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly helperText?: string;
  readonly inputLabel: string;
  readonly inputProps?: Omit<
    TextInputProps,
    | "editable"
    | "multiline"
    | "onChangeText"
    | "onSubmitEditing"
    | "submitBehavior"
    | "value"
  >;
  readonly isSubmitting?: boolean;
  readonly onSubmit?: (value: string) => void;
  readonly onValueChange?: (value: string) => void;
  readonly ref?: Ref<View>;
  readonly serviceState?: AIChatServiceState;
  readonly status?: string;
  readonly submitLabel: string;
  readonly toolbar?: ReactNode;
  readonly value?: string;
};

const styles = StyleSheet.create({
  footer: { alignItems: "flex-end", borderTopWidth: 1, flexDirection: "row" },
  input: { minHeight: 120, padding: 0, textAlignVertical: "top" },
  messages: { flex: 1 },
  pressed: { opacity: 0.8 },
  root: { borderWidth: 1 },
  submit: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  toolbar: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
});

type ComposerState = {
  readonly canSubmit: boolean;
  readonly currentValue: string;
  readonly handleSubmit: () => void;
  readonly handleValueChange: (value: string) => void;
  readonly hint?: string;
  readonly unavailable: boolean;
};

function useComposerState(props: AIChatInputProps): ComposerState {
  const [internalValue, setInternalValue] = useState(props.defaultValue ?? "");
  const controlled = props.value !== undefined;
  const currentValue = controlled ? props.value : internalValue;
  const unavailable = props.serviceState?.status === "unavailable";
  const canSubmit =
    props.onSubmit !== undefined &&
    props.disabled !== true &&
    props.isSubmitting !== true &&
    !unavailable &&
    currentValue.trim().length > 0;
  const handleValueChange = useCallback(
    (nextValue: string) => {
      if (!controlled) setInternalValue(nextValue);
      props.onValueChange?.(nextValue);
    },
    [controlled, props],
  );
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    props.onSubmit?.(currentValue);
    if (!controlled) setInternalValue("");
  }, [canSubmit, controlled, currentValue, props]);
  return {
    canSubmit,
    currentValue,
    handleSubmit,
    handleValueChange,
    hint: joinAccessibilityText([
      props.serviceState?.status === "unavailable"
        ? props.serviceState.message
        : undefined,
      props.helperText,
    ]),
    unavailable,
  };
}

function ComposerMessages({
  currentValue,
  helperText,
  inputProps,
  serviceState,
  status,
}: Pick<
  AIChatInputProps,
  "helperText" | "inputProps" | "serviceState" | "status"
> & { readonly currentValue: string }) {
  const theme = useTheme();
  const unavailable = serviceState?.status === "unavailable";
  useAnnounceOnChange(status, { liveRegion: true });
  useAnnounceOnChange(unavailable ? serviceState.message : undefined, {
    liveRegion: true,
  });
  return (
    <View style={[styles.messages, { gap: theme.spacing[1] }]}>
      {[helperText, status].map((message) =>
        message ? (
          <Text
            accessibilityLiveRegion={message === status ? "polite" : "none"}
            key={message}
            style={typeStyle(theme, "caption", "mutedForeground")}
          >
            {message}
          </Text>
        ) : null,
      )}
      {unavailable ? (
        <Text
          accessibilityLiveRegion="polite"
          style={typeStyle(theme, "caption", "destructive")}
        >
          {serviceState.message}
        </Text>
      ) : null}
      {typeof inputProps?.maxLength === "number" ? (
        <Text style={typeStyle(theme, "caption", "mutedForeground")}>
          {currentValue.length}/{inputProps.maxLength}
        </Text>
      ) : null}
    </View>
  );
}
ComposerMessages.displayName = "ComposerMessages";

function SubmitAction({
  canSubmit,
  isSubmitting,
  label,
  onPress,
}: {
  readonly canSubmit: boolean;
  readonly isSubmitting: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: isSubmitting, disabled: !canSubmit }}
      disabled={!canSubmit}
      onPress={onPress}
      style={({ pressed }) => [
        styles.submit,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.full,
          opacity: canSubmit ? 1 : 0.5,
          paddingHorizontal: theme.spacing[4],
        },
        pressed ? styles.pressed : undefined,
      ]}
    >
      <Text
        style={typeStyle(theme, "bodySmall", {
          color: "primaryForeground",
          fontWeight: theme.typography.fontWeight.caption,
        })}
      >
        {label}
      </Text>
    </Pressable>
  );
}
SubmitAction.displayName = "SubmitAction";

type ComposerBodyProps = {
  readonly disabled: boolean;
  readonly inputLabel: string;
  readonly inputProps?: AIChatInputProps["inputProps"];
  readonly state: ComposerState;
};

function ComposerBody({
  disabled,
  inputLabel,
  inputProps,
  state,
}: ComposerBodyProps) {
  const theme = useTheme();
  const inputId = useId();
  const editable = !disabled && !state.unavailable;
  return (
    <TextInput
      {...inputProps}
      accessibilityHint={inputProps?.accessibilityHint ?? state.hint}
      accessibilityLabel={inputLabel}
      accessibilityState={{
        ...inputProps?.accessibilityState,
        disabled: !editable,
      }}
      editable={editable}
      multiline
      nativeID={inputProps?.nativeID ?? inputId}
      onChangeText={state.handleValueChange}
      onSubmitEditing={state.handleSubmit}
      placeholderTextColor={theme.colors.mutedForeground}
      returnKeyType="send"
      style={[
        styles.input,
        ...typeStyle(theme, "body", "foreground"),
        inputProps?.style,
      ]}
      submitBehavior="submit"
      value={state.currentValue}
    />
  );
}
ComposerBody.displayName = "ComposerBody";

function ComposerShell({
  children,
  reference,
  style,
  viewProps,
}: {
  readonly children: ReactNode;
  readonly reference?: Ref<View>;
  readonly style?: AIChatInputProps["style"];
  readonly viewProps: ViewProps;
}) {
  const theme = useTheme();
  return (
    <View
      {...viewProps}
      ref={reference}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.input,
          borderRadius: theme.radius.lg,
          gap: theme.spacing[3],
          padding: theme.spacing[3],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
ComposerShell.displayName = "ComposerShell";

/**
 * Accessible native multiline chat composer with submit-key handling. A
 * disabled or unavailable composer reports `disabled` with the service message
 * as the input's hint, and it announces status or availability changes.
 */
function AIChatInput({
  defaultValue,
  disabled = false,
  helperText,
  inputLabel,
  inputProps,
  isSubmitting = false,
  onSubmit,
  onValueChange,
  ref,
  serviceState,
  status,
  style,
  submitLabel,
  toolbar,
  value,
  ...viewProps
}: AIChatInputProps) {
  const theme = useTheme();
  const stateProps = {
    defaultValue,
    disabled,
    helperText,
    inputLabel,
    inputProps,
    isSubmitting,
    onSubmit,
    onValueChange,
    serviceState,
    status,
    submitLabel,
    toolbar,
    value,
  };
  const state = useComposerState(stateProps);
  return (
    <ComposerShell reference={ref} style={style} viewProps={viewProps}>
      <ComposerBody
        disabled={disabled}
        inputLabel={inputLabel}
        inputProps={inputProps}
        state={state}
      />
      {toolbar ? (
        <View style={[styles.toolbar, { gap: theme.spacing[2] }]}>
          {toolbar}
        </View>
      ) : null}
      <View
        style={[
          styles.footer,
          {
            borderColor: theme.colors.border,
            gap: theme.spacing[3],
            paddingTop: theme.spacing[3],
          },
        ]}
      >
        <ComposerMessages currentValue={state.currentValue} {...stateProps} />
        <SubmitAction
          canSubmit={state.canSubmit}
          isSubmitting={isSubmitting}
          label={submitLabel}
          onPress={state.handleSubmit}
        />
      </View>
    </ComposerShell>
  );
}
AIChatInput.displayName = "AIChatInput";

export { AIChatInput };
