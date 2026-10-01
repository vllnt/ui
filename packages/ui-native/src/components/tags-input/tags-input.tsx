"use client";

import { type Ref, useRef, useState } from "react";

import {
  Pressable,
  StyleSheet,
  Text as NativeText,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

import { focusAccessibility } from "../../primitives/accessibility";
import { useGroupDisabled } from "../../primitives/control-group";
import { useMergedReferences } from "../../primitives/merge-references";
import { typeStyle } from "../../primitives/type-style";
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
  disabled: ownDisabled = false,
  editable = true,
  labels,
  onSubmitEditing,
  placeholder,
  readOnly = false,
  ref,
  style,
  tags: state,
  ...props
}: TagsInputProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const [tags, setTags] = useControllableState(state);
  const [draft, setDraft] = useState("");
  const inputRef = useRef<null | TextInput>(null);
  const mergedRef = useMergedReferences(inputRef, ref);
  const locked = disabled || !editable || readOnly;
  const addDisabled = locked || draft.trim().length === 0;
  const commit = () => {
    if (locked) return;
    const next = normalize([...tags, draft]);
    if (
      next.length !== tags.length ||
      next.some((tag, index) => tag !== tags[index])
    )
      setTags(next);
    setDraft("");
  };
  return (
    <View
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
          <NativeText style={typeStyle(theme, "bodySmall", "foreground")}>
            {tag}
          </NativeText>
          <Pressable
            accessibilityLabel={labels.remove(tag)}
            accessibilityRole="button"
            accessibilityState={{ disabled: locked }}
            disabled={locked}
            onPress={() => {
              if (locked) return;
              setTags(tags.filter((item) => item !== tag));
              focusAccessibility(inputRef);
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
        accessibilityState={{ disabled: locked, ...props.accessibilityState }}
        editable={!locked}
        onChangeText={(text) => {
          if (!locked) setDraft(text);
        }}
        onSubmitEditing={(event) => {
          commit();
          onSubmitEditing?.(event);
        }}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.mutedForeground}
        readOnly={readOnly}
        ref={mergedRef}
        returnKeyType="done"
        style={[styles.input, ...typeStyle(theme, "bodySmall", "foreground")]}
        value={draft}
      />
      <Pressable
        accessibilityLabel={labels.add}
        accessibilityRole="button"
        accessibilityState={{ disabled: addDisabled }}
        disabled={addDisabled}
        onPress={commit}
        style={[styles.add, { opacity: addDisabled ? 0.5 : 1 }]}
      >
        <NativeText style={{ color: theme.colors.foreground }}>+</NativeText>
      </Pressable>
    </View>
  );
}
TagsInput.displayName = "TagsInput";

export { TagsInput };
