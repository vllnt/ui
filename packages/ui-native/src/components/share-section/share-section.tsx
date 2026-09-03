"use client";

import { type Ref, useState } from "react";

import type { ShareContent, ShareOptions } from "react-native";
import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  defaultShareService,
  type ShareResult,
  type ShareService,
} from "../../primitives/platform-services";
import { useTheme } from "../../theme/theme-provider";

/** Caller-localized labels for native sharing. */
export type ShareSectionLabels = {
  readonly share: string;
  readonly unavailable: string;
};

/** Props for a native share-sheet section. */
export type ShareSectionProps = Omit<ViewProps, "children"> & {
  readonly content: ShareContent;
  readonly labels: ShareSectionLabels;
  readonly onShareError?: (error: unknown) => void;
  readonly onShareResult?: (result: ShareResult) => void;
  readonly options?: ShareOptions;
  readonly ref?: Ref<View>;
  readonly shareService?: null | ShareService;
  readonly title: string;
};

const styles = StyleSheet.create({
  action: { alignItems: "center", justifyContent: "center", minHeight: 44 },
  root: { borderTopWidth: 1, width: "100%" },
});

function ShareAction({
  available,
  label,
  onPress,
  sharing,
}: {
  readonly available: boolean;
  readonly label: string;
  readonly onPress: () => void;
  readonly sharing: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ busy: sharing, disabled: !available || sharing }}
      disabled={!available || sharing}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          alignSelf: "flex-start",
          backgroundColor: pressed
            ? theme.colors.accent
            : theme.colors.secondary,
          borderRadius: theme.radius.md,
          opacity: available ? 1 : 0.5,
          paddingHorizontal: theme.spacing[4],
        },
      ]}
    >
      <NativeText style={{ color: theme.colors.secondaryForeground }}>
        {label}
      </NativeText>
    </Pressable>
  );
}
ShareAction.displayName = "ShareAction";

/** Uses the native share sheet rather than fabricating browser social intents. */
function ShareSection({
  content,
  labels,
  onShareError,
  onShareResult,
  options,
  ref,
  shareService,
  style,
  title,
  ...props
}: ShareSectionProps) {
  const theme = useTheme();
  const [sharing, setSharing] = useState(false);
  const service =
    shareService === undefined ? defaultShareService : shareService;
  const available = service !== null;
  const actionLabel = available ? labels.share : labels.unavailable;
  const share = async () => {
    if (!service || sharing) return;
    setSharing(true);
    try {
      const result = await service.share(content, options);
      onShareResult?.(result);
    } catch (error: unknown) {
      onShareError?.(error);
    } finally {
      setSharing(false);
    }
  };
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          borderTopColor: theme.colors.border,
          gap: theme.spacing[3],
          paddingTop: theme.spacing[6],
        },
        style,
      ]}
    >
      <NativeText
        accessibilityRole="header"
        style={[
          theme.typography.scale.bodyLarge,
          {
            color: theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.heading,
          },
        ]}
      >
        {title}
      </NativeText>
      <ShareAction
        available={available}
        label={actionLabel}
        onPress={() => void share()}
        sharing={sharing}
      />
    </View>
  );
}
ShareSection.displayName = "ShareSection";

export { ShareSection };
