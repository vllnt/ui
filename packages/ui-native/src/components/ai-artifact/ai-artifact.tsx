import { createContext, type ReactNode, type Ref, use, useMemo } from "react";

import {
  Pressable,
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge } from "../badge/badge";
import { Button, type ButtonProps } from "../button/button";
import { Heading } from "../heading/heading";
import { Text } from "../text/text";

/** Content category represented by a native AI artifact. */
export type AIArtifactType =
  | "code"
  | "custom"
  | "diagram"
  | "document"
  | "html"
  | "image"
  | "table";

/** Localizable labels for native artifact actions. */
export type AIArtifactLabels = {
  readonly copy?: string;
  readonly download?: string;
  readonly edit?: string;
};

/** Props for the native AI artifact container. */
export type AIArtifactProps = Omit<ViewProps, "children"> & {
  readonly children?: ReactNode;
  readonly filename?: string;
  readonly labels?: AIArtifactLabels;
  readonly language?: string;
  readonly onCopy?: (value: string) => void;
  readonly onDownload?: (value: string, filename: string) => void;
  readonly onEdit?: () => void;
  readonly ref?: Ref<View>;
  readonly subtitle?: ReactNode;
  readonly title?: ReactNode;
  readonly type?: AIArtifactType;
  readonly value?: string;
};

type AIArtifactContextValue = {
  readonly filename: string;
  readonly labels: Required<AIArtifactLabels>;
  readonly onCopy?: (value: string) => void;
  readonly onDownload?: (value: string, filename: string) => void;
  readonly onEdit?: () => void;
  readonly value: string;
};

const defaultLabels: Required<AIArtifactLabels> = {
  copy: "Copy",
  download: "Download",
  edit: "Edit",
};

const AIArtifactContext = createContext<AIArtifactContextValue | undefined>(
  undefined,
);

const styles = StyleSheet.create({
  actionRow: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
  content: { borderWidth: 1, minHeight: 96 },
  header: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
  root: { borderWidth: 1, width: "100%" },
  versions: { alignItems: "center", flexDirection: "row", flexWrap: "wrap" },
});

const invalidFilenameCharacters = /[^\da-z]+/g;
const filenameDashes = /^-+|-+$/g;

function extensionFor(type: AIArtifactType, language: string): string {
  if (language) return language;
  if (type === "diagram") return "mmd";
  if (type === "document") return "md";
  if (type === "html") return "html";
  if (type === "image") return "png";
  if (type === "table") return "csv";
  return "txt";
}

function buildFilename({
  filename,
  language,
  title,
  type,
}: {
  readonly filename?: string;
  readonly language: string;
  readonly title: ReactNode;
  readonly type: AIArtifactType;
}): string {
  if (filename) return filename;
  const source = typeof title === "string" && title ? title : "artifact";
  const base = source
    .toLowerCase()
    .replaceAll(invalidFilenameCharacters, "-")
    .replaceAll(filenameDashes, "");
  return `${base || "artifact"}.${extensionFor(type, language)}`;
}

function renderTitle(node: ReactNode): ReactNode {
  if (typeof node !== "string" && typeof node !== "number") return node;
  return (
    <Heading level={3} size={6}>
      {node}
    </Heading>
  );
}

function renderSubtitle(node: ReactNode): ReactNode {
  if (typeof node !== "string" && typeof node !== "number") return node;
  return <Text tone="muted">{node}</Text>;
}

function AIArtifactHeader({
  language,
  subtitle,
  title,
  type,
}: Pick<AIArtifactProps, "language" | "subtitle" | "title" | "type">) {
  const theme = useTheme();
  if (!title && !subtitle && !language) return null;
  return (
    <View style={{ gap: theme.spacing[1] }}>
      <View style={[styles.header, { gap: theme.spacing[2] }]}>
        {title ? renderTitle(title) : null}
        <Badge variant="secondary">{language || type}</Badge>
      </View>
      {subtitle ? renderSubtitle(subtitle) : null}
    </View>
  );
}
AIArtifactHeader.displayName = "AIArtifactHeader";

/** Reads the nearest native artifact action context. */
function useAIArtifact(): AIArtifactContextValue {
  const context = use(AIArtifactContext);
  if (!context) {
    throw new Error("AI artifact controls must be rendered inside AIArtifact.");
  }
  return context;
}

function useArtifactContext({
  filename,
  labels,
  language,
  onCopy,
  onDownload,
  onEdit,
  title,
  type,
  value,
}: Pick<
  AIArtifactProps,
  | "filename"
  | "labels"
  | "language"
  | "onCopy"
  | "onDownload"
  | "onEdit"
  | "title"
  | "type"
  | "value"
>): AIArtifactContextValue {
  const resolvedLabels = useMemo<Required<AIArtifactLabels>>(
    () => ({
      copy: labels?.copy ?? defaultLabels.copy,
      download: labels?.download ?? defaultLabels.download,
      edit: labels?.edit ?? defaultLabels.edit,
    }),
    [labels],
  );
  const resolvedFilename = buildFilename({
    filename,
    language: language ?? "",
    title,
    type: type ?? "code",
  });
  return useMemo(
    () => ({
      filename: resolvedFilename,
      labels: resolvedLabels,
      onCopy,
      onDownload,
      onEdit,
      value: value ?? "",
    }),
    [onCopy, onDownload, onEdit, resolvedFilename, resolvedLabels, value],
  );
}

/** Native container for consumer-rendered AI output. */
function AIArtifact({
  accessibilityLabel,
  children,
  filename,
  labels,
  language = "",
  onCopy,
  onDownload,
  onEdit,
  ref,
  style,
  subtitle,
  title,
  type = "code",
  value = "",
  ...props
}: AIArtifactProps) {
  const theme = useTheme();
  const context = useArtifactContext({
    filename,
    labels,
    language,
    onCopy,
    onDownload,
    onEdit,
    title,
    type,
    value,
  });

  return (
    <AIArtifactContext value={context}>
      <View
        {...props}
        accessibilityLabel={
          accessibilityLabel ?? (typeof title === "string" ? title : undefined)
        }
        ref={ref}
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.lg,
            gap: theme.spacing[3],
            padding: theme.spacing[4],
          },
          style,
        ]}
      >
        <AIArtifactHeader
          language={language}
          subtitle={subtitle}
          title={title}
          type={type}
        />
        {children}
      </View>
    </AIArtifactContext>
  );
}
AIArtifact.displayName = "AIArtifact";

/** Horizontal native action row for an AIArtifact. */
function AIArtifactToolbar({
  ref,
  style,
  ...props
}: ViewProps & { ref?: Ref<View> }) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.actionRow,
        {
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 1,
          gap: theme.spacing[2],
          paddingBottom: theme.spacing[2],
        },
        style,
      ]}
    />
  );
}
AIArtifactToolbar.displayName = "AIArtifactToolbar";

type ArtifactActionButtonProps = Omit<ButtonProps, "children">;

/** Calls the consumer-provided native copy adapter with the artifact value. */
function AIArtifactCopyButton({
  onPress,
  ref,
  ...props
}: ArtifactActionButtonProps) {
  const { labels, onCopy, value } = useAIArtifact();
  if (!onCopy && !onPress) return null;
  return (
    <Button
      {...props}
      onPress={(event) => {
        onPress?.(event);
        onCopy?.(value);
      }}
      ref={ref}
      size="sm"
      variant="ghost"
    >
      {labels.copy}
    </Button>
  );
}
AIArtifactCopyButton.displayName = "AIArtifactCopyButton";

/** Calls the consumer-provided native download adapter. */
function AIArtifactDownloadButton({
  onPress,
  ref,
  ...props
}: ArtifactActionButtonProps) {
  const { filename, labels, onDownload, value } = useAIArtifact();
  if (!onDownload && !onPress) return null;
  return (
    <Button
      {...props}
      onPress={(event) => {
        onPress?.(event);
        onDownload?.(value, filename);
      }}
      ref={ref}
      size="sm"
      variant="ghost"
    >
      {labels.download}
    </Button>
  );
}
AIArtifactDownloadButton.displayName = "AIArtifactDownloadButton";

/** Calls the artifact edit handler and hides without a supplied handler. */
function AIArtifactEditButton({
  onPress,
  ref,
  ...props
}: ArtifactActionButtonProps) {
  const { labels, onEdit } = useAIArtifact();
  if (!onEdit && !onPress) return null;
  return (
    <Button
      {...props}
      onPress={(event) => {
        onPress?.(event);
        onEdit?.();
      }}
      ref={ref}
      size="sm"
      variant="ghost"
    >
      {labels.edit}
    </Button>
  );
}
AIArtifactEditButton.displayName = "AIArtifactEditButton";

/** Bordered native slot for consumer-rendered artifact content. */
function AIArtifactContent({
  ref,
  style,
  ...props
}: ViewProps & { ref?: Ref<View> }) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.content,
        {
          backgroundColor: theme.colors.muted,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing[3],
        },
        style,
      ]}
    />
  );
}
AIArtifactContent.displayName = "AIArtifactContent";

/** Native row containing externally controlled artifact versions. */
function AIArtifactVersions({
  ref,
  style,
  ...props
}: ViewProps & { ref?: Ref<View> }) {
  const theme = useTheme();
  return (
    <View
      {...props}
      ref={ref}
      style={[
        styles.versions,
        {
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          gap: theme.spacing[2],
          paddingTop: theme.spacing[2],
        },
        style,
      ]}
    />
  );
}
AIArtifactVersions.displayName = "AIArtifactVersions";

/** Props for an externally controlled artifact version chip. */
export type AIArtifactVersionProps = Omit<PressableProps, "children"> & {
  readonly active?: boolean;
  readonly label: ReactNode;
  readonly ref?: Ref<View>;
};

/** Accessible native artifact version selector. */
function AIArtifactVersion({
  accessibilityState,
  active = false,
  label,
  ref,
  style,
  ...props
}: AIArtifactVersionProps) {
  const theme = useTheme();
  return (
    <Pressable
      {...props}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, selected: active }}
      ref={ref}
      style={(state) => [
        {
          backgroundColor: active
            ? theme.colors.primary
            : state.pressed
              ? theme.colors.accent
              : theme.colors.background,
          borderColor: active ? theme.colors.primary : theme.colors.border,
          borderRadius: theme.radius.full,
          borderWidth: 1,
          minHeight: 44,
          minWidth: 44,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[2],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {typeof label === "string" || typeof label === "number" ? (
        <NativeText
          style={[
            theme.typography.scale.caption,
            {
              color: active
                ? theme.colors.primaryForeground
                : theme.colors.foreground,
              fontWeight: theme.typography.fontWeight.caption,
              textAlign: "center",
            },
          ]}
        >
          {label}
        </NativeText>
      ) : (
        label
      )}
    </Pressable>
  );
}
AIArtifactVersion.displayName = "AIArtifactVersion";

export {
  AIArtifact,
  AIArtifactContent,
  AIArtifactCopyButton,
  AIArtifactDownloadButton,
  AIArtifactEditButton,
  AIArtifactToolbar,
  AIArtifactVersion,
  AIArtifactVersions,
  useAIArtifact,
};
