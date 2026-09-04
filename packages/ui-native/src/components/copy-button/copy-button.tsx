"use client";

import { type Ref, useCallback, useEffect, useRef, useState } from "react";

import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  type View,
} from "react-native";

import type { ClipboardService } from "../../primitives/platform-services";
import { useTheme } from "../../theme/theme-provider";

const DEFAULT_TIMEOUT = 2000;

/** Observable state of a native clipboard operation. */
export type CopyStatus = "copied" | "error" | "idle" | "unavailable";

/** Options for the native clipboard state hook. */
export type UseCopyToClipboardOptions = {
  readonly clipboard?: ClipboardService;
  readonly timeout?: number;
};

/** Result from the native clipboard state hook. */
export type UseCopyToClipboardResult = {
  readonly copy: (value: string) => Promise<boolean>;
  readonly reset: () => void;
  readonly status: CopyStatus;
};

/** Props for a native copy action with explicit unavailable service state. */
export type CopyButtonProps = Omit<PressableProps, "children"> & {
  readonly clipboard?: ClipboardService;
  readonly copiedLabel?: string;
  readonly errorLabel?: string;
  readonly label?: string;
  readonly onStatusChange?: (status: CopyStatus) => void;
  readonly ref?: Ref<View>;
  readonly timeout?: number;
  readonly unavailableLabel?: string;
  readonly value: string;
};

const styles = StyleSheet.create({
  root: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});

/** Copies text only when a host clipboard adapter is available. */
function useCopyToClipboard({
  clipboard,
  timeout = DEFAULT_TIMEOUT,
}: UseCopyToClipboardOptions = {}): UseCopyToClipboardResult {
  const [operationStatus, setOperationStatus] =
    useState<Exclude<CopyStatus, "unavailable">>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const status: CopyStatus =
    clipboard === undefined ? "unavailable" : operationStatus;

  useEffect(
    () => () => {
      if (timer.current !== undefined) clearTimeout(timer.current);
    },
    [],
  );

  const reset = useCallback(() => {
    if (timer.current !== undefined) clearTimeout(timer.current);
    timer.current = undefined;
    setOperationStatus("idle");
  }, []);

  const copy = useCallback(
    async (value: string): Promise<boolean> => {
      if (clipboard === undefined) return false;
      try {
        await clipboard.setText(value);
        if (timer.current !== undefined) clearTimeout(timer.current);
        setOperationStatus("copied");
        timer.current = setTimeout(() => {
          setOperationStatus("idle");
          timer.current = undefined;
        }, timeout);
        return true;
      } catch {
        setOperationStatus("error");
        return false;
      }
    },
    [clipboard, timeout],
  );

  return { copy, reset, status };
}

/** Native copy button requiring an injected clipboard adapter to operate. */
function CopyButton({
  accessibilityState,
  clipboard,
  copiedLabel = "Copied",
  disabled = false,
  errorLabel = "Copy failed",
  label = "Copy",
  onPress,
  onStatusChange,
  ref,
  style,
  timeout = DEFAULT_TIMEOUT,
  unavailableLabel = "Clipboard unavailable",
  value,
  ...props
}: CopyButtonProps) {
  const theme = useTheme();
  const { copy, status } = useCopyToClipboard({ clipboard, timeout });
  const previousStatus = useRef(status);
  const unavailable = status === "unavailable";
  const isDisabled = disabled || unavailable;
  const currentLabel =
    status === "copied"
      ? copiedLabel
      : status === "error"
        ? errorLabel
        : unavailable
          ? unavailableLabel
          : label;

  useEffect(() => {
    if (previousStatus.current !== status) {
      previousStatus.current = status;
      onStatusChange?.(status);
    }
  }, [onStatusChange, status]);

  return (
    <Pressable
      {...props}
      accessibilityLabel={currentLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={(event) => {
        onPress?.(event);
        if (!event?.defaultPrevented) void copy(value);
      }}
      ref={ref}
      style={(state) => [
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.input,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          opacity: isDisabled ? 0.5 : state.pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[2],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <NativeText
        accessibilityLiveRegion="polite"
        style={[
          theme.typography.scale.bodySmall,
          {
            color: theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {currentLabel}
      </NativeText>
    </Pressable>
  );
}
CopyButton.displayName = "CopyButton";

export { CopyButton, useCopyToClipboard };
