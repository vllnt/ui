"use client";

import { type Ref, useEffect, useLayoutEffect, useRef } from "react";

import {
  AccessibilityInfo,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import type { SelectionKey } from "../../primitives/selection";
import { useTheme } from "../../theme/theme-provider";

/** Controlled native toast queue entry. */
export type ToastItem = {
  readonly actionDisabled?: boolean;
  readonly actionLabel?: string;
  readonly description?: string;
  /** Positive milliseconds; changing this value restarts expiry. Omit or use zero to persist. */
  readonly duration?: number;
  readonly id: SelectionKey;
  readonly onAction?: () => void;
  readonly title: string;
  readonly variant?: "default" | "destructive";
};
/**
 * Props for a controlled, instance-local toast queue. Dismissal requests accumulate
 * until the owner removes each ID; remove an ID before reusing it for a new toast.
 */
export type ToastProps = Omit<ViewProps, "children"> & {
  readonly closeLabel: string;
  readonly onToastsChange: (toasts: readonly ToastItem[]) => void;
  readonly ref?: Ref<View>;
  readonly toasts: readonly ToastItem[];
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  body: { flex: 1 },
  disabled: { opacity: 0.5 },
  root: { width: "100%" },
  toast: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 44,
  },
});

/** Accessible controlled toast queue with per-instance deterministic timers. */
function Toast({
  closeLabel,
  onToastsChange,
  ref,
  style,
  toasts,
  ...props
}: ToastProps) {
  const theme = useTheme();
  const queueRef = useRef(toasts);
  const onChangeRef = useRef(onToastsChange);
  const announcedIds = useRef(new Set<SelectionKey>());
  const dismissedIds = useRef(new Set<SelectionKey>());
  const timers = useRef(
    new Map<
      SelectionKey,
      {
        readonly deadline: number;
        readonly duration: number;
        readonly timer: ReturnType<typeof setTimeout>;
      }
    >(),
  );

  useLayoutEffect(() => {
    const currentIds = new Set(toasts.map((toast) => toast.id));
    for (const id of dismissedIds.current) {
      if (!currentIds.has(id)) dismissedIds.current.delete(id);
    }
    queueRef.current = toasts.filter(
      (toast) => !dismissedIds.current.has(toast.id),
    );
    onChangeRef.current = onToastsChange;
  }, [onToastsChange, toasts]);

  const dismiss = (id: SelectionKey) => {
    if (dismissedIds.current.has(id)) return;
    dismissedIds.current.add(id);
    const entry = timers.current.get(id);
    if (entry) clearTimeout(entry.timer);
    timers.current.delete(id);
    queueRef.current = queueRef.current.filter(
      (toast) => !Object.is(toast.id, id),
    );
    onChangeRef.current(queueRef.current);
  };

  useEffect(() => {
    const timerMap = timers.current;
    const currentIds = new Set(toasts.map((toast) => toast.id));
    for (const id of announcedIds.current) {
      if (!currentIds.has(id)) announcedIds.current.delete(id);
    }
    for (const [id, entry] of timerMap) {
      const toast = toasts.find((item) => Object.is(item.id, id));
      if (toast?.duration !== entry.duration || dismissedIds.current.has(id)) {
        clearTimeout(entry.timer);
        timerMap.delete(id);
      }
    }
    for (const toast of toasts) {
      if (!announcedIds.current.has(toast.id)) {
        AccessibilityInfo.announceForAccessibility(
          toast.description
            ? `${toast.title}. ${toast.description}`
            : toast.title,
        );
        announcedIds.current.add(toast.id);
      }
      if (
        !dismissedIds.current.has(toast.id) &&
        toast.duration !== undefined &&
        toast.duration > 0
      ) {
        const deadline =
          timerMap.get(toast.id)?.deadline ?? Date.now() + toast.duration;
        const timer = setTimeout(
          () => {
            dismiss(toast.id);
          },
          Math.max(0, deadline - Date.now()),
        );
        timerMap.set(toast.id, { deadline, duration: toast.duration, timer });
      }
    }
    return () => {
      for (const entry of timerMap.values()) clearTimeout(entry.timer);
    };
  }, [toasts]);

  return (
    <View
      {...props}
      ref={ref}
      style={[styles.root, { gap: theme.spacing[2] }, style]}
    >
      {toasts.map((toast) => {
        const destructive = toast.variant === "destructive";
        return (
          <View
            accessibilityLabel={toast.title}
            accessibilityLiveRegion={destructive ? "assertive" : "polite"}
            accessibilityRole={destructive ? "alert" : undefined}
            key={toast.id}
            style={[
              styles.toast,
              {
                backgroundColor: destructive
                  ? theme.colors.destructive
                  : theme.colors.popover,
                borderColor: destructive
                  ? theme.colors.destructive
                  : theme.colors.border,
                borderRadius: theme.radius.md,
                gap: theme.spacing[2],
                padding: theme.spacing[3],
              },
            ]}
          >
            <View style={[styles.body, { gap: theme.spacing[1] }]}>
              <Text
                style={[
                  theme.typography.scale.bodySmall,
                  {
                    color: destructive
                      ? theme.colors.destructiveForeground
                      : theme.colors.popoverForeground,
                    fontWeight: theme.typography.fontWeight.caption,
                  },
                ]}
              >
                {toast.title}
              </Text>
              {toast.description ? (
                <Text
                  style={[
                    theme.typography.scale.bodySmall,
                    {
                      color: destructive
                        ? theme.colors.destructiveForeground
                        : theme.colors.mutedForeground,
                    },
                  ]}
                >
                  {toast.description}
                </Text>
              ) : null}
            </View>
            {toast.actionLabel && toast.onAction ? (
              <Pressable
                accessibilityLabel={toast.actionLabel}
                accessibilityRole="button"
                accessibilityState={{ disabled: toast.actionDisabled === true }}
                disabled={toast.actionDisabled === true}
                onPress={toast.onAction}
                style={[
                  styles.action,
                  toast.actionDisabled ? styles.disabled : undefined,
                ]}
              >
                <Text
                  style={{
                    color: destructive
                      ? theme.colors.destructiveForeground
                      : theme.colors.popoverForeground,
                  }}
                >
                  {toast.actionLabel}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel={closeLabel}
              accessibilityRole="button"
              onPress={() => {
                dismiss(toast.id);
              }}
              style={styles.action}
            >
              <Text
                style={{
                  color: destructive
                    ? theme.colors.destructiveForeground
                    : theme.colors.popoverForeground,
                }}
              >
                ×
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
Toast.displayName = "Toast";

export { Toast };
