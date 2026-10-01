"use client";

import type { Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  useAnnounceOnChange,
  useFocusWhenShown,
} from "../../../primitives/accessibility";
import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../../primitives/modal-layer";
import {
  isSingleSelected,
  type SelectionKey,
  selectSingle,
} from "../../../primitives/selection";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

/** Stable command action. */
export type CommandItem = {
  readonly destructive?: boolean;
  readonly disabled?: boolean;
  readonly id: SelectionKey;
  readonly keywords?: readonly string[];
  readonly label: string;
};
/** Props for a searchable native modal command list. */
export type CommandProps = {
  readonly cancelLabel: string;
  readonly defaultOpen?: boolean;
  readonly defaultQuery?: string;
  readonly defaultSelectedId?: SelectionKey;
  /**
   * Hint spoken on destructive items so their meaning does not rely on
   * colour. Defaults to "Destructive".
   */
  readonly destructiveLabel?: string;
  readonly emptyLabel: string;
  readonly items: readonly CommandItem[];
  readonly label: string;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onQueryChange?: (query: string) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  readonly onSelect?: (id: SelectionKey) => void;
  readonly open?: boolean;
  readonly placeholder: string;
  readonly query?: string;
  readonly ref?: Ref<View>;
  /** Result count announced after the query changes, e.g. "3 commands". */
  readonly resultsLabel?: (count: number) => string;
  readonly selectedId?: SelectionKey;
};

const getItemId = (item: CommandItem) => item.id;
const styles = StyleSheet.create({
  action: { justifyContent: "center", minHeight: 44 },
  content: { flex: 1, justifyContent: "center" },
  heading: { paddingHorizontal: 4 },
  input: { borderWidth: 1, minHeight: 44 },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "84%",
    maxWidth: 640,
    width: "94%",
  },
});

/**
 * Searchable command surface represented as a native modal list. The `label`
 * renders as the header and screen readers hear it on open; filtered result
 * counts (via `resultsLabel`) and the empty state reach VoiceOver and
 * TalkBack.
 */
function Command({
  cancelLabel,
  defaultOpen = false,
  defaultQuery = "",
  defaultSelectedId,
  destructiveLabel = "Destructive",
  emptyLabel,
  items,
  label,
  onOpenChange,
  onQueryChange,
  onRequestClose,
  onSelect,
  open,
  placeholder,
  query,
  ref,
  resultsLabel,
  selectedId,
}: CommandProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useControllableState(
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const [currentQuery, setCurrentQuery] = useControllableState(
    controllableOptions(query, defaultQuery, onQueryChange),
  );
  const [selection, setSelection] = useControllableState(
    controllableOptions(selectedId, defaultSelectedId),
  );
  const normalizedQuery = currentQuery.trim().toLocaleLowerCase();
  const filteredItems = items.filter(
    (item) =>
      normalizedQuery.length === 0 ||
      [item.label, ...(item.keywords ?? [])].some((value) =>
        value.toLocaleLowerCase().includes(normalizedQuery),
      ),
  );
  const noResults = filteredItems.length === 0;
  const headingRef = useFocusWhenShown<Text>(visible);
  useAnnounceOnChange(
    visible && normalizedQuery.length > 0
      ? noResults
        ? emptyLabel
        : resultsLabel?.(filteredItems.length)
      : undefined,
    { liveRegion: noResults },
  );
  const close = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    setVisible(false);
  };

  return (
    <ModalLayer
      animationType={reduceMotion ? "none" : "fade"}
      contentProps={{ style: styles.content }}
      keyboardAvoidingViewProps={{ style: styles.content }}
      onClose={close}
      ref={ref}
      visible={visible}
    >
      <View
        accessibilityRole="menu"
        style={[
          styles.surface,
          {
            backgroundColor: theme.colors.popover,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            gap: theme.spacing[2],
            padding: theme.spacing[3],
          },
        ]}
      >
        <Text
          accessibilityRole="header"
          ref={headingRef}
          style={[
            styles.heading,
            ...typeStyle(theme, "bodySmall", {
              color: "popoverForeground",
              fontWeight: theme.typography.fontWeight.heading,
            }),
          ]}
        >
          {label}
        </Text>
        <TextInput
          accessibilityLabel={placeholder}
          onChangeText={setCurrentQuery}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.mutedForeground}
          style={[
            styles.input,
            theme.typography.scale.body,
            {
              borderColor: theme.colors.input,
              borderRadius: theme.radius.md,
              color: theme.colors.popoverForeground,
              paddingHorizontal: theme.spacing[3],
            },
          ]}
          value={currentQuery}
        />
        <ScrollView keyboardShouldPersistTaps="handled">
          {noResults ? (
            <Text
              accessibilityLiveRegion="polite"
              style={typeStyle(theme, "bodySmall", {
                color: "mutedForeground",
                padding: theme.spacing[4],
                textAlign: "center",
              })}
            >
              {emptyLabel}
            </Text>
          ) : (
            filteredItems.map((item) => {
              const selected = isSingleSelected(selection, item, getItemId);
              return (
                <Pressable
                  accessibilityHint={
                    item.destructive ? destructiveLabel : undefined
                  }
                  accessibilityLabel={item.label}
                  accessibilityRole="menuitem"
                  accessibilityState={{
                    disabled: item.disabled === true,
                    selected,
                  }}
                  disabled={item.disabled === true}
                  key={item.id}
                  onPress={() => {
                    setSelection(selectSingle(selection, item, getItemId));
                    onSelect?.(item.id);
                    setVisible(false);
                  }}
                  style={({ pressed }) => [
                    styles.action,
                    {
                      backgroundColor:
                        selected || pressed
                          ? theme.colors.accent
                          : theme.colors.popover,
                      borderRadius: theme.radius.sm,
                      opacity: item.disabled ? 0.5 : 1,
                      paddingHorizontal: theme.spacing[3],
                    },
                  ]}
                >
                  <Text
                    style={typeStyle(
                      theme,
                      "bodySmall",
                      item.destructive ? "destructive" : "popoverForeground",
                    )}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })
          )}
        </ScrollView>
        <Pressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          onPress={() => {
            close("requestClose");
          }}
          style={[
            styles.action,
            {
              backgroundColor: theme.colors.secondary,
              borderRadius: theme.radius.md,
              paddingHorizontal: theme.spacing[3],
            },
          ]}
        >
          <Text style={{ color: theme.colors.secondaryForeground }}>
            {cancelLabel}
          </Text>
        </Pressable>
      </View>
    </ModalLayer>
  );
}
Command.displayName = "Command";

export { Command };
