"use client";

import { type ReactNode, type Ref, useCallback, useId, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputContentSizeChangeEvent,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Explicit availability of the service receiving a prompt. */
export type PromptServiceState =
  | { readonly message: string; readonly status: "unavailable" }
  | { readonly status: "available" };

/** Native multiline return-key behavior. */
export type PromptSubmitBehavior = "newline" | "submit";

/** Props for the compact native prompt composer. */
export type PromptInputProps = Omit<ViewProps, "children"> & {
  readonly defaultValue?: string;
  readonly disabled?: boolean;
  readonly inputLabel: string;
  readonly inputProps?: Omit<
    TextInputProps,
    | "editable"
    | "multiline"
    | "onChangeText"
    | "onContentSizeChange"
    | "onSubmitEditing"
    | "submitBehavior"
    | "value"
  >;
  readonly isLoading?: boolean;
  readonly maxRows?: number;
  readonly minRows?: number;
  readonly onSubmit?: (value: string) => void;
  readonly onValueChange?: (value: string) => void;
  readonly ref?: Ref<View>;
  readonly serviceState?: PromptServiceState;
  readonly submitBehavior?: PromptSubmitBehavior;
  readonly submitLabel: string;
  readonly toolbar?: ReactNode;
  readonly value?: string;
};

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  input: { padding: 0, textAlignVertical: "top" },
  pressed: { opacity: 0.8 },
  root: { borderWidth: 1 },
  submit: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  toolbar: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
});

type PromptState = {
  readonly canSubmit: boolean;
  readonly contentHeight: number;
  readonly handleContentSizeChange: (
    event: TextInputContentSizeChangeEvent,
  ) => void;
  readonly handleSubmit: () => void;
  readonly handleValueChange: (value: string) => void;
  readonly maxHeight: number;
  readonly unavailable: boolean;
  readonly value: string;
};

function usePromptState(props: PromptInputProps): PromptState {
  const theme = useTheme();
  const minimum = Math.max(1, props.minRows ?? 1);
  const maximum = Math.max(minimum, props.maxRows ?? 8);
  const rowHeight = theme.typography.scale.bodySmall.lineHeight;
  const minHeight = minimum * rowHeight;
  const maxHeight = maximum * rowHeight;
  const [contentHeight, setContentHeight] = useState(minHeight);
  const [internalValue, setInternalValue] = useState(props.defaultValue ?? "");
  const controlled = props.value !== undefined;
  const value = controlled ? props.value : internalValue;
  const unavailable = props.serviceState?.status === "unavailable";
  const canSubmit =
    props.disabled !== true &&
    props.isLoading !== true &&
    !unavailable &&
    value.trim().length > 0;
  const handleValueChange = useCallback(
    (next: string) => {
      if (!controlled) setInternalValue(next);
      props.onValueChange?.(next);
    },
    [controlled, props],
  );
  const handleSubmit = useCallback(() => {
    if (!canSubmit) return;
    props.onSubmit?.(value);
    if (!controlled) setInternalValue("");
  }, [canSubmit, controlled, props, value]);
  const handleContentSizeChange = useCallback(
    (event: TextInputContentSizeChangeEvent) => {
      const next = event.nativeEvent.contentSize.height;
      setContentHeight(Math.min(maxHeight, Math.max(minHeight, next)));
    },
    [maxHeight, minHeight],
  );
  return {
    canSubmit,
    contentHeight,
    handleContentSizeChange,
    handleSubmit,
    handleValueChange,
    maxHeight,
    unavailable,
    value,
  };
}

function PromptField({
  disabled,
  inputLabel,
  inputProps,
  state,
  submitBehavior,
}: {
  readonly disabled: boolean;
  readonly inputLabel: string;
  readonly inputProps?: PromptInputProps["inputProps"];
  readonly state: PromptState;
  readonly submitBehavior: PromptSubmitBehavior;
}) {
  const theme = useTheme();
  const inputId = useId();
  return (
    <TextInput
      {...inputProps}
      accessibilityLabel={inputLabel}
      editable={!disabled && !state.unavailable}
      multiline
      nativeID={inputProps?.nativeID ?? inputId}
      onChangeText={state.handleValueChange}
      onContentSizeChange={state.handleContentSizeChange}
      onSubmitEditing={
        submitBehavior === "submit" ? state.handleSubmit : undefined
      }
      placeholderTextColor={theme.colors.mutedForeground}
      returnKeyType={submitBehavior === "submit" ? "send" : "default"}
      scrollEnabled={state.contentHeight >= state.maxHeight}
      style={[
        styles.input,
        theme.typography.scale.bodySmall,
        { color: theme.colors.foreground, height: state.contentHeight },
        inputProps?.style,
      ]}
      submitBehavior={submitBehavior}
      value={state.value}
    />
  );
}
PromptField.displayName = "PromptField";

function PromptAction({
  canSubmit,
  isLoading,
  label,
  onPress,
}: {
  readonly canSubmit: boolean;
  readonly isLoading: boolean;
  readonly label: string;
  readonly onPress: () => void;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: isLoading, disabled: !canSubmit }}
      disabled={!canSubmit}
      onPress={onPress}
      style={({ pressed }) => [
        styles.submit,
        {
          backgroundColor: theme.colors.primary,
          borderRadius: theme.radius.md,
          opacity: canSubmit ? 1 : 0.5,
          paddingHorizontal: theme.spacing[3],
        },
        pressed ? styles.pressed : undefined,
      ]}
    >
      <Text
        style={[
          theme.typography.scale.caption,
          { color: theme.colors.primaryForeground },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
PromptAction.displayName = "PromptAction";

function PromptShell({
  children,
  reference,
  style,
  viewProps,
}: {
  readonly children: ReactNode;
  readonly reference?: Ref<View>;
  readonly style?: PromptInputProps["style"];
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
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          gap: theme.spacing[2],
          padding: theme.spacing[2],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
PromptShell.displayName = "PromptShell";

function PromptFooter({
  isLoading,
  state,
  submitLabel,
  toolbar,
  unavailableMessage,
}: {
  readonly isLoading: boolean;
  readonly state: PromptState;
  readonly submitLabel: string;
  readonly toolbar?: ReactNode;
  readonly unavailableMessage?: string;
}) {
  const theme = useTheme();
  return (
    <>
      {unavailableMessage ? (
        <Text
          accessibilityLiveRegion="polite"
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.destructive },
          ]}
        >
          {unavailableMessage}
        </Text>
      ) : null}
      <View style={[styles.actions, { gap: theme.spacing[2] }]}>
        <View style={[styles.toolbar, { gap: theme.spacing[1] }]}>
          {toolbar}
        </View>
        <PromptAction
          canSubmit={state.canSubmit}
          isLoading={isLoading}
          label={submitLabel}
          onPress={state.handleSubmit}
        />
      </View>
    </>
  );
}
PromptFooter.displayName = "PromptFooter";

/** Auto-growing native prompt composer with explicit return-key behavior. */
function PromptInput({
  defaultValue,
  disabled = false,
  inputLabel,
  inputProps,
  isLoading = false,
  maxRows,
  minRows,
  onSubmit,
  onValueChange,
  ref,
  serviceState,
  style,
  submitBehavior = "submit",
  submitLabel,
  toolbar,
  value,
  ...viewProps
}: PromptInputProps) {
  const stateProps = {
    defaultValue,
    disabled,
    inputLabel,
    inputProps,
    isLoading,
    maxRows,
    minRows,
    onSubmit,
    onValueChange,
    serviceState,
    submitBehavior,
    submitLabel,
    toolbar,
    value,
  };
  const state = usePromptState({
    ...stateProps,
    inputLabel,
    inputProps,
    isLoading,
    serviceState,
    submitBehavior,
    submitLabel,
    toolbar,
  });
  const unavailableMessage =
    serviceState?.status === "unavailable" ? serviceState.message : undefined;
  return (
    <PromptShell reference={ref} style={style} viewProps={viewProps}>
      <PromptField
        disabled={disabled}
        inputLabel={inputLabel}
        inputProps={inputProps}
        state={state}
        submitBehavior={submitBehavior}
      />
      <PromptFooter
        isLoading={isLoading}
        state={state}
        submitLabel={submitLabel}
        toolbar={toolbar}
        unavailableMessage={unavailableMessage}
      />
    </PromptShell>
  );
}
PromptInput.displayName = "PromptInput";

export { PromptInput };
