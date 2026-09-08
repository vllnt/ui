"use client";

import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import type { ClipboardService } from "../../primitives/platform-services";
import { useTheme } from "../../theme/theme-provider";

/** Caller-localized labels for optional code copying. */
export type CodeBlockCopyLabels = {
  readonly copied: string;
  readonly copy: string;
  readonly unavailable: string;
};

/** Context passed to an optional host syntax renderer. */
export type CodeBlockRenderContext = {
  readonly code: string;
  readonly language?: string;
};

/** Props for a dependency-free native code surface. */
export type CodeBlockProps = Omit<ViewProps, "children"> & {
  readonly clipboard?: ClipboardService;
  readonly code: string;
  readonly copyLabels?: CodeBlockCopyLabels;
  readonly language?: string;
  readonly onCopyError?: (error: unknown) => void;
  readonly onCopySuccess?: () => void;
  readonly ref?: Ref<View>;
  readonly renderCode?: (context: CodeBlockRenderContext) => ReactNode;
  readonly showLanguage?: boolean;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  root: { borderWidth: 1, overflow: "hidden", width: "100%" },
});

type HeaderProps = {
  readonly available: boolean;
  readonly label?: string;
  readonly language?: string;
  readonly onCopy: () => void;
  readonly showLanguage: boolean;
};

function CodeBlockHeader({
  available,
  label,
  language,
  onCopy,
  showLanguage,
}: HeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.muted,
          paddingHorizontal: theme.spacing[3],
        },
      ]}
    >
      {showLanguage && language ? (
        <NativeText
          style={[
            theme.typography.scale.caption,
            { color: theme.colors.mutedForeground, fontFamily: "monospace" },
          ]}
        >
          {language}
        </NativeText>
      ) : (
        <View />
      )}
      {label ? (
        <Pressable
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ disabled: !available }}
          disabled={!available}
          onPress={onCopy}
          style={({ pressed }) => [
            styles.action,
            {
              backgroundColor: pressed
                ? theme.colors.accent
                : theme.colors.muted,
              borderRadius: theme.radius.md,
              opacity: available ? 1 : 0.5,
              paddingHorizontal: theme.spacing[3],
            },
          ]}
        >
          <NativeText
            accessibilityLiveRegion="polite"
            style={{ color: theme.colors.foreground }}
          >
            {label}
          </NativeText>
        </Pressable>
      ) : null}
    </View>
  );
}
CodeBlockHeader.displayName = "CodeBlockHeader";

function CodeContent({
  code,
  language,
  renderCode,
}: {
  readonly code: string;
  readonly language?: string;
  readonly renderCode?: (context: CodeBlockRenderContext) => ReactNode;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      contentContainerStyle={{ padding: theme.spacing[4] }}
      horizontal
    >
      {renderCode ? (
        renderCode({ code, language })
      ) : (
        <NativeText
          selectable
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.foreground, fontFamily: "monospace" },
          ]}
        >
          {code}
        </NativeText>
      )}
    </ScrollView>
  );
}
CodeContent.displayName = "CodeContent";

/**
 * Renders selectable plain code. Hosts inject syntax rendering and clipboard
 * support explicitly.
 */
function CodeBlock({
  clipboard,
  code,
  copyLabels,
  language,
  onCopyError,
  onCopySuccess,
  ref,
  renderCode,
  showLanguage = false,
  style,
  ...props
}: CodeBlockProps) {
  const theme = useTheme();
  const [copiedCode, setCopiedCode] = useState<string>();
  const operation = useRef(0);
  useEffect(
    () => () => {
      operation.current += 1;
    },
    [clipboard, code],
  );
  const copyAvailable = clipboard !== undefined;
  const copied = copiedCode === code;
  const copyLabel = copied
    ? copyLabels?.copied
    : copyAvailable
      ? copyLabels?.copy
      : copyLabels?.unavailable;
  const copy = async () => {
    if (!clipboard) return;
    const currentOperation = ++operation.current;
    try {
      await clipboard.setText(code);
      if (currentOperation !== operation.current) return;
      setCopiedCode(code);
      onCopySuccess?.();
    } catch (error: unknown) {
      if (currentOperation !== operation.current) return;
      setCopiedCode(undefined);
      onCopyError?.(error);
    }
  };

  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
        style,
      ]}
    >
      {showLanguage || copyLabels ? (
        <CodeBlockHeader
          available={copyAvailable}
          label={copyLabel}
          language={language}
          onCopy={() => void copy()}
          showLanguage={showLanguage}
        />
      ) : null}
      <CodeContent code={code} language={language} renderCode={renderCode} />
    </View>
  );
}
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
