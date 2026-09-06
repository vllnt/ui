"use client";

import { type Ref, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import type { ControllableStateOptions } from "../../primitives/use-controllable-state";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Localized labels required by TagsInput actions. */
export type TagsInputLabels = {
  readonly add: string;
  readonly input: string;
  readonly remove: (tag: string) => string;
};
/** Props for a native free-text tag editor. */
export type TagsInputProps = Omit<
  TextInputProps,
  "defaultValue" | "onChangeText" | "value"
> & {
  readonly disabled?: boolean;
  readonly labels: TagsInputLabels;
  readonly ref?: Ref<TextInput>;
  readonly tags: ControllableStateOptions<readonly string[]>;
};

const styles = StyleSheet.create({
  add: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  input: { flex: 1, minHeight: 44, minWidth: 120 },
  root: {
    alignItems: "center",
    borderWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: { alignItems: "center", flexDirection: "row", minHeight: 44 },
});

function normalize(tags: readonly string[]): readonly string[] {
  return tags.reduce<readonly string[]>((result, tag) => {
    const next = tag.trim();
    return next && !result.includes(next) ? [...result, next] : result;
  }, []);
}

/** Native tag editor that commits text via keyboard action or an explicit button. */
function TagsInput({
  disabled = false,
  labels,
  onSubmitEditing,
  placeholder,
  ref,
  style,
  tags: state,
  ...props
}: TagsInputProps) {
  const theme = useTheme();
  const [tags, setTags] = useControllableState(state);
  const [draft, setDraft] = useState("");
  const commit = () => {
    const next = normalize([...tags, draft]);
    if (next.length !== tags.length) setTags(next);
    setDraft("");
  };
  return (
    <View
      accessibilityLabel={labels.input}
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.input,
          borderRadius: theme.radius.md,
          gap: theme.spacing[1],
          opacity: disabled ? 0.5 : 1,
          paddingHorizontal: theme.spacing[2],
        },
        style,
      ]}
    >
      {tags.map((tag) => (
        <View
          key={tag}
          style={[
            styles.tag,
            {
              backgroundColor: theme.colors.muted,
              borderRadius: theme.radius.md,
              paddingLeft: theme.spacing[2],
            },
          ]}
        >
          <NativeText
            style={[
              theme.typography.scale.bodySmall,
              { color: theme.colors.foreground },
            ]}
          >
            {tag}
          </NativeText>
          <Pressable
            accessibilityLabel={labels.remove(tag)}
            accessibilityRole="button"
            disabled={disabled}
            onPress={() => {
              setTags(tags.filter((item) => item !== tag));
            }}
            style={styles.add}
          >
            <NativeText style={{ color: theme.colors.foreground }}>
              ×
            </NativeText>
          </Pressable>
        </View>
      ))}
      <TextInput
        {...props}
        accessibilityLabel={labels.input}
        editable={!disabled}
        onChangeText={setDraft}
        onSubmitEditing={(event) => {
          commit();
          onSubmitEditing?.(event);
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        ref={ref}
        returnKeyType="done"
        style={[
          styles.input,
          theme.typography.scale.bodySmall,
          { color: theme.colors.foreground },
        ]}
        value={draft}
      />
      <Pressable
        accessibilityLabel={labels.add}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || draft.trim().length === 0 }}
        disabled={disabled || draft.trim().length === 0}
        onPress={commit}
        style={styles.add}
      >
        <NativeText style={{ color: theme.colors.foreground }}>+</NativeText>
      </Pressable>
    </View>
  );
}
TagsInput.displayName = "TagsInput";

export { TagsInput };
