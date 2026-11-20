"use client";

import { type ReactNode, type Ref, useEffect, useRef, useState } from "react";

import {
  ScrollView,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useAnnounceOnChange } from "../../../primitives/accessibility";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import type { ClipboardService } from "../../../primitives/platform-services";
import { typeStyle } from "../../../primitives/type-style";
import { useTheme } from "../../../theme/theme-provider";
import { monospaceFontFamily } from "../../../primitives/font-family";

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
          style={typeStyle(theme, "caption", {
            color: "mutedForeground",
            fontFamily: monospaceFontFamily,
          })}
        >
          {language}
        </NativeText>
      ) : (
        <View />
      )}
      {label ? (
        <InteractivePressable
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ disabled: !available }}
          disabled={!available}
          filled
          onPress={onCopy}
          style={[
            styles.action,
            {
              backgroundColor: theme.colors.muted,
              borderRadius: theme.radius.md,
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
        </InteractivePressable>
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
          style={typeStyle(theme, "bodySmall", {
            color: "foreground",
            fontFamily: monospaceFontFamily,
          })}
        >
          {code}
        </NativeText>
      )}
    </ScrollView>
  );
}
CodeContent.displayName = "CodeContent";

function resolveCopyLabel(
  copied: boolean,
  available: boolean,
  labels: CodeBlockProps["copyLabels"],
) {
  if (copied) return labels?.copied;
  return available ? labels?.copy : labels?.unavailable;
}

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
  const copyLabel = resolveCopyLabel(copied, copyAvailable, copyLabels);
  useAnnounceOnChange(copied ? copyLabel : undefined, { liveRegion: true });
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
