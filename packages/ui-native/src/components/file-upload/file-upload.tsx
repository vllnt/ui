"use client";

import { type Ref, useLayoutEffect, useRef, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import type {
  FilePickerService,
  PickedFile,
} from "../../primitives/platform-services";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Localized copy required by FileUpload. */
export type FileUploadLabels = {
  readonly choose: string;
  readonly empty: string;
  readonly failed: string;
  readonly remove: (fileName: string) => string;
  readonly unavailable: string;
};
/** Props for a native file upload selection model. */
export type FileUploadProps = Omit<ViewProps, "children"> & {
  readonly allowMultiple?: boolean;
  readonly disabled?: boolean;
  readonly filePicker?: FilePickerService;
  readonly files: ControllableStateOptions<readonly PickedFile[]>;
  readonly labels: FileUploadLabels;
  readonly mimeTypes?: readonly string[];
  readonly ref?: Ref<View>;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
  },
  file: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 44,
  },
  remove: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
});
function uniqueFiles(files: readonly PickedFile[]): readonly PickedFile[] {
  return files.filter(
    (file, index) =>
      files.findIndex((candidate) => candidate.uri === file.uri) === index,
  );
}

/** Native file chooser requiring an injected host picker, with no false fallback. */
function FileUpload({
  allowMultiple = true,
  disabled = false,
  filePicker,
  files: fileState,
  labels,
  mimeTypes,
  ref,
  style,
  ...props
}: FileUploadProps) {
  const theme = useTheme();
  const [files, setFiles] = useControllableState(fileState);
  const filesRef = useRef(files);
  useLayoutEffect(() => {
    filesRef.current = files;
  }, [files]);
  const updateFiles = (next: readonly PickedFile[]) => {
    filesRef.current = next;
    setFiles(next);
  };
  const [failure, setFailure] = useState<string>();
  const unavailable = filePicker === undefined;
  const choose = async () => {
    if (!filePicker) return;
    setFailure(undefined);
    try {
      const picked = await filePicker.pickFiles(
        mimeTypes === undefined
          ? { allowMultiple }
          : { allowMultiple, mimeTypes },
      );
      updateFiles(
        uniqueFiles(
          allowMultiple ? [...filesRef.current, ...picked] : picked.slice(0, 1),
        ),
      );
    } catch {
      setFailure(labels.failed);
    }
  };
  return (
    <View ref={ref} style={[{ gap: theme.spacing[2] }, style]} {...props}>
      <Pressable
        accessibilityLabel={unavailable ? labels.unavailable : labels.choose}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || unavailable }}
        disabled={disabled || unavailable}
        onPress={() => {
          void choose();
        }}
        style={[
          styles.action,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.input,
            borderRadius: theme.radius.lg,
            opacity: disabled || unavailable ? 0.5 : 1,
            padding: theme.spacing[4],
          },
        ]}
      >
        <NativeText
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.foreground },
          ]}
        >
          {unavailable ? labels.unavailable : labels.choose}
        </NativeText>
      </Pressable>
      {files.length === 0 ? (
        <NativeText
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.mutedForeground },
          ]}
        >
          {labels.empty}
        </NativeText>
      ) : (
        files.map((file) => (
          <View
            key={file.uri}
            style={[
              styles.file,
              {
                backgroundColor: theme.colors.muted,
                borderRadius: theme.radius.md,
                paddingLeft: theme.spacing[3],
              },
            ]}
          >
            <NativeText
              numberOfLines={1}
              style={[
                theme.typography.scale.bodySmall,
                { color: theme.colors.foreground, flex: 1 },
              ]}
            >
              {file.name}
            </NativeText>
            <Pressable
              accessibilityLabel={labels.remove(file.name)}
              accessibilityRole="button"
              disabled={disabled}
              onPress={() => {
                updateFiles(
                  filesRef.current.filter((item) => item.uri !== file.uri),
                );
              }}
              style={styles.remove}
            >
              <NativeText style={{ color: theme.colors.foreground }}>
                ×
              </NativeText>
            </Pressable>
          </View>
        ))
      )}
      {failure ? (
        <NativeText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          style={[
            theme.typography.scale.bodySmall,
            { color: theme.colors.destructive },
          ]}
        >
          {failure}
        </NativeText>
      ) : null}
    </View>
  );
}
FileUpload.displayName = "FileUpload";

export { FileUpload };
