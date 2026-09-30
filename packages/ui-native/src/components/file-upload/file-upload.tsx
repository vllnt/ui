"use client";

import { type Ref, useLayoutEffect, useRef, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  announce,
  focusAccessibility,
  useAnnounceOnChange,
} from "../../primitives/accessibility";
import type {
  FilePickerService,
  PickedFile,
} from "../../primitives/platform-services";
import { typeStyle } from "../../primitives/type-style";
import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Localized copy required by FileUpload. */
export type FileUploadLabels = {
  /**
   * Announcement after files are added; receives the added file names.
   * Defaults to the comma-separated names.
   */
  readonly added?: (fileNames: readonly string[]) => string;
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

/**
 * Native file chooser requiring an injected host picker, with no false
 * fallback. Added files and failures are announced; removing a file returns
 * screen-reader focus to the choose action.
 */
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
    if (fileState.mode === "uncontrolled") filesRef.current = next;
    setFiles(next);
  };
  const [failure, setFailure] = useState<string>();
  useAnnounceOnChange(failure, { liveRegion: true });
  const chooseRef = useRef<View>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef(false);
  const mounted = useRef(true);
  const generation = useRef(0);
  useLayoutEffect(
    () => () => {
      generation.current += 1;
    },
    [disabled, filePicker],
  );
  useLayoutEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const unavailable = filePicker === undefined;
  const choose = async () => {
    if (!filePicker || disabled || pending.current) return;
    pending.current = true;
    const request = generation.current;
    setBusy(true);
    setFailure(undefined);
    try {
      const picked = await filePicker.pickFiles(
        mimeTypes === undefined
          ? { allowMultiple }
          : { allowMultiple, mimeTypes },
      );
      if (
        !mounted.current ||
        request !== generation.current ||
        picked.length === 0
      )
        return;
      const added = allowMultiple ? picked : picked.slice(0, 1);
      updateFiles(
        uniqueFiles(allowMultiple ? [...filesRef.current, ...added] : added),
      );
      const names = added.map((file) => file.name);
      announce(labels.added ? labels.added(names) : names.join(", "));
    } catch {
      if (mounted.current && request === generation.current)
        setFailure(labels.failed);
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return (
    <View ref={ref} style={[{ gap: theme.spacing[2] }, style]} {...props}>
      <Pressable
        accessibilityLabel={unavailable ? labels.unavailable : labels.choose}
        accessibilityRole="button"
        accessibilityState={{ busy, disabled: disabled || unavailable || busy }}
        disabled={disabled || unavailable || busy}
        onPress={() => {
          void choose();
        }}
        ref={chooseRef}
        style={[
          styles.action,
          {
            backgroundColor: theme.colors.background,
            borderColor: theme.colors.input,
            borderRadius: theme.radius.lg,
            opacity: disabled || unavailable || busy ? 0.5 : 1,
            padding: theme.spacing[4],
          },
        ]}
      >
        <NativeText style={typeStyle(theme, "bodySmall", "foreground")}>
          {unavailable ? labels.unavailable : labels.choose}
        </NativeText>
      </Pressable>
      {files.length === 0 ? (
        <NativeText style={typeStyle(theme, "bodySmall", "mutedForeground")}>
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
              style={typeStyle(theme, "bodySmall", {
                color: "foreground",
                flex: 1,
              })}
            >
              {file.name}
            </NativeText>
            <Pressable
              accessibilityLabel={labels.remove(file.name)}
              accessibilityRole="button"
              accessibilityState={{ disabled }}
              disabled={disabled}
              onPress={() => {
                updateFiles(
                  filesRef.current.filter((item) => item.uri !== file.uri),
                );
                focusAccessibility(chooseRef);
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
          style={typeStyle(theme, "bodySmall", "destructive")}
        >
          {failure}
        </NativeText>
      ) : null}
    </View>
  );
}
FileUpload.displayName = "FileUpload";

export { FileUpload };
