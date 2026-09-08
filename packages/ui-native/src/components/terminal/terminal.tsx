"use client";

import { type Ref, useLayoutEffect, useMemo, useRef, useState } from "react";

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

/** A native terminal line. */
export type TerminalLine = {
  readonly content: string;
  readonly type: "command" | "comment" | "output";
};

/** Caller-localized labels for optional terminal copying. */
export type TerminalCopyLabels = {
  readonly copied: string;
  readonly copy: string;
  readonly unavailable: string;
};

/** Props for a native terminal transcript. */
export type TerminalProps = Omit<ViewProps, "children"> & {
  readonly clipboard?: ClipboardService;
  readonly copyable?: boolean;
  readonly copyLabels?: TerminalCopyLabels;
  readonly lines: readonly TerminalLine[];
  readonly onCopyError?: (error: unknown) => void;
  readonly onCopySuccess?: () => void;
  readonly prompt?: string;
  readonly ref?: Ref<View>;
  readonly title: string;
};

/** Props for parsing a simple native terminal transcript. */
export type SimpleTerminalProps = Omit<TerminalProps, "lines"> & {
  readonly children: string;
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
  line: { alignItems: "flex-start", flexDirection: "row" },
  root: { borderWidth: 1, overflow: "hidden", width: "100%" },
});

function getCommands(lines: readonly TerminalLine[]): string {
  return lines
    .filter((line) => line.type === "command")
    .map((line) => line.content)
    .join("\n");
}

type TerminalHeaderProps = {
  readonly available: boolean;
  readonly copying: boolean;
  readonly copyLabel?: string;
  readonly onCopy: () => void;
  readonly showCopy: boolean;
  readonly title: string;
};

function TerminalHeader({
  available,
  copying,
  copyLabel,
  onCopy,
  showCopy,
  title,
}: TerminalHeaderProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.colors.muted,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          paddingHorizontal: theme.spacing[4],
        },
      ]}
    >
      <NativeText
        style={[
          theme.typography.scale.bodySmall,
          {
            color: theme.colors.foreground,
            fontWeight: theme.typography.fontWeight.caption,
          },
        ]}
      >
        {title}
      </NativeText>
      {showCopy && copyLabel ? (
        <Pressable
          accessibilityLabel={copyLabel}
          accessibilityRole="button"
          accessibilityState={{
            busy: copying,
            disabled: !available || copying,
          }}
          disabled={!available || copying}
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
            {copyLabel}
          </NativeText>
        </Pressable>
      ) : null}
    </View>
  );
}
TerminalHeader.displayName = "TerminalHeader";

function TerminalLineView({
  line,
  prompt,
}: {
  readonly line: TerminalLine;
  readonly prompt: string;
}) {
  const theme = useTheme();
  const content =
    line.type === "comment"
      ? `${prompt === "$" ? "#" : prompt} ${line.content}`
      : line.content;
  return (
    <View style={styles.line}>
      {line.type === "command" ? (
        <NativeText
          accessibilityElementsHidden
          style={{
            color: theme.colors.primary,
            fontFamily: "monospace",
            marginRight: theme.spacing[2],
          }}
        >
          {prompt}
        </NativeText>
      ) : null}
      <NativeText
        selectable
        style={[
          theme.typography.scale.bodySmall,
          {
            color:
              line.type === "command"
                ? theme.colors.foreground
                : theme.colors.mutedForeground,
            fontFamily: "monospace",
            fontStyle: line.type === "comment" ? "italic" : "normal",
          },
        ]}
      >
        {content}
      </NativeText>
    </View>
  );
}
TerminalLineView.displayName = "TerminalLineView";

function TerminalLines({
  lines,
  prompt,
}: {
  readonly lines: readonly TerminalLine[];
  readonly prompt: string;
}) {
  const theme = useTheme();
  return (
    <ScrollView
      contentContainerStyle={{
        gap: theme.spacing[1],
        padding: theme.spacing[4],
      }}
      horizontal
    >
      <View style={{ gap: theme.spacing[1] }}>
        {lines.map((line, index) => (
          <TerminalLineView
            key={`${line.type}-${line.content}-${index.toString()}`}
            line={line}
            prompt={prompt}
          />
        ))}
      </View>
    </ScrollView>
  );
}
TerminalLines.displayName = "TerminalLines";

function useTerminalCopy(
  {
    clipboard,
    copyable,
    onCopyError,
    onCopySuccess,
  }: Pick<
    TerminalProps,
    "clipboard" | "copyable" | "onCopyError" | "onCopySuccess"
  >,
  commands: string,
) {
  const [copiedCommands, setCopiedCommands] = useState<string>();
  const [copying, setCopying] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(false);
  const session = useRef(0);

  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      session.current += 1;
    };
  }, [clipboard, commands, copyable]);

  const copy = async () => {
    if (
      !clipboard ||
      !copyable ||
      !commands ||
      pending.current ||
      !mounted.current
    )
      return;
    pending.current = true;
    setCopying(true);
    const currentSession = session.current;
    try {
      await clipboard.setText(commands);
      if (session.current !== currentSession) return;
      setCopiedCommands(commands);
      onCopySuccess?.();
    } catch (error: unknown) {
      if (session.current === currentSession) onCopyError?.(error);
    } finally {
      pending.current = false;
      if (mounted.current) setCopying(false);
    }
  };
  return { copied: copiedCommands === commands, copy, copying };
}

function Terminal({
  clipboard,
  copyable = true,
  copyLabels,
  lines,
  onCopyError,
  onCopySuccess,
  prompt = "$",
  ref,
  style,
  title,
  ...props
}: TerminalProps) {
  const theme = useTheme();
  const commands = useMemo(() => getCommands(lines), [lines]);
  const { copied, copy, copying } = useTerminalCopy(
    { clipboard, copyable, onCopyError, onCopySuccess },
    commands,
  );
  const copyAvailable = clipboard !== undefined;
  const copyLabel = copied
    ? copyLabels?.copied
    : copyAvailable
      ? copyLabels?.copy
      : copyLabels?.unavailable;
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}
    >
      <TerminalHeader
        available={copyAvailable}
        copying={copying}
        copyLabel={copyLabel}
        onCopy={() => void copy()}
        showCopy={
          copyable ? commands.length > 0 && copyLabels !== undefined : false
        }
        title={title}
      />
      <TerminalLines lines={lines} prompt={prompt} />
    </View>
  );
}
Terminal.displayName = "Terminal";

function parseTranscript(children: string): readonly TerminalLine[] {
  return children
    .trim()
    .split("\n")
    .map((line) => {
      if (line.startsWith("$ "))
        return { content: line.slice(2), type: "command" };
      if (line.startsWith("# "))
        return { content: line.slice(2), type: "comment" };
      return { content: line, type: "output" };
    });
}

/** Parses `$ ` commands and `# ` comments into a native terminal transcript. */
function SimpleTerminal({ children, ...props }: SimpleTerminalProps) {
  return <Terminal {...props} lines={parseTranscript(children)} />;
}
SimpleTerminal.displayName = "SimpleTerminal";

export { SimpleTerminal, Terminal };
