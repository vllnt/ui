"use client";

import type { ReactNode, Ref, RefObject } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import {
  decorativeProps,
  useFocusWhenShown,
} from "../../../primitives/accessibility";
import {
  type PlacementProps,
  useAnchoredPanel,
} from "../../../primitives/anchored-placement";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import {
  ModalLayer,
  type ModalLayerCloseReason,
} from "../../../primitives/modal-layer";
import {
  isSingleSelected,
  type SelectionKey,
} from "../../../primitives/selection";
import { typeStyle } from "../../../primitives/type-style";
import {
  controllableOptions,
  useControllableState,
} from "../../../primitives/use-controllable-state";
import { useReducedMotion } from "../../../primitives/use-reduced-motion";
import { useTheme } from "../../../theme/theme-provider";

/** Plain action row. `inset` lines its label up with checkbox and radio rows. */
export type DropdownMenuActionItem = {
  readonly destructive?: boolean;
  readonly disabled?: boolean;
  readonly id: SelectionKey;
  readonly inset?: boolean;
  readonly kind?: "item";
  readonly label: string;
};
/**
 * Two-state row, like web `DropdownMenuCheckboxItem`. It is controlled: the
 * menu closes on press and its rows unmount, so keep the state in the owner
 * and pass the new `checked` back.
 */
export type DropdownMenuCheckboxItem = {
  readonly checked?: boolean;
  readonly disabled?: boolean;
  readonly id: SelectionKey;
  readonly kind: "checkbox";
  readonly label: string;
  readonly onCheckedChange?: (checked: boolean) => void;
};
/** One choice of a {@link DropdownMenuRadioGroup}; `id` is its value. */
export type DropdownMenuRadioItem = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
};
/**
 * Exclusive group of radio rows, like web `DropdownMenuRadioGroup`. It is
 * controlled for the same reason as {@link DropdownMenuCheckboxItem}.
 */
export type DropdownMenuRadioGroup = {
  readonly id: SelectionKey;
  readonly items: readonly DropdownMenuRadioItem[];
  readonly kind: "radio-group";
  /** Heading shown above the group. */
  readonly label?: string;
  readonly onValueChange?: (value: string) => void;
  /** The chosen item's `id`. */
  readonly value?: string;
};
/** Row that opens a nested list in place, like web `DropdownMenuSub`. */
export type DropdownMenuSub = {
  readonly defaultOpen?: boolean;
  readonly disabled?: boolean;
  readonly id: SelectionKey;
  readonly inset?: boolean;
  readonly items: readonly DropdownMenuItem[];
  readonly kind: "sub";
  readonly label: string;
  readonly onOpenChange?: (open: boolean) => void;
  /** Controls whether the nested list is open. */
  readonly open?: boolean;
};
/** Stable native dropdown row. */
export type DropdownMenuItem =
  | DropdownMenuActionItem
  | DropdownMenuCheckboxItem
  | DropdownMenuRadioGroup
  | DropdownMenuSub;
/** Props for a native dropdown list. */
export type DropdownMenuProps = PlacementProps & {
  /**
   * Element the menu opens against. Without it (or when it cannot be
   * measured) the menu stays centred and the placement props do not apply.
   */
  readonly anchorRef?: RefObject<null | View>;
  readonly cancelLabel: string;
  readonly defaultOpen?: boolean;
  readonly defaultSelectedId?: SelectionKey;
  /**
   * Hint spoken on destructive items so their meaning does not rely on
   * colour. Defaults to "Destructive".
   */
  readonly destructiveLabel?: string;
  readonly items: readonly DropdownMenuItem[];
  readonly label: string;
  /** `false` draws the menu in place instead of in a host Modal. */
  readonly modal?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly onRequestClose?: (reason: ModalLayerCloseReason) => void;
  /** Called for action, checkbox and radio rows, never for a sub-menu row. */
  readonly onSelect?: (id: SelectionKey) => void;
  readonly open?: boolean;
  readonly ref?: Ref<View>;
  readonly selectedId?: SelectionKey;
};

type Choose = (id: SelectionKey, selectable: boolean) => void;

type RowsProps = {
  readonly choose: Choose;
  readonly destructiveLabel: string;
  readonly items: readonly DropdownMenuItem[];
  readonly selection: SelectionKey | undefined;
};

const getItemId = (item: { readonly id: SelectionKey }) => item.id;
const INSET = 32;
const styles = StyleSheet.create({
  anchored: {
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 560,
    minWidth: 192,
  },
  cancel: { alignItems: "center", justifyContent: "center" },
  content: { flex: 1, justifyContent: "center" },
  heading: { paddingHorizontal: 12, paddingTop: 4 },
  item: { justifyContent: "center" },
  mark: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  surface: {
    alignSelf: "center",
    borderWidth: 1,
    maxHeight: "80%",
    maxWidth: 560,
    width: "92%",
  },
});

type RowProps<TItem> = {
  readonly choose: Choose;
  readonly item: TItem;
};

function useRowStyle(selected: boolean, inset = false) {
  const theme = useTheme();
  return [
    styles.item,
    {
      backgroundColor: selected ? theme.colors.accent : theme.colors.popover,
      borderRadius: theme.radius.sm,
      paddingHorizontal: theme.spacing[3],
      paddingLeft: inset ? INSET : theme.spacing[3],
    },
  ];
}

function RowLabel({
  destructive = false,
  emphasised,
  label,
}: {
  readonly destructive?: boolean;
  readonly emphasised: boolean;
  readonly label: string;
}) {
  const theme = useTheme();
  return (
    <Text
      style={typeStyle(theme, "bodySmall", {
        color: destructive ? "destructive" : "popoverForeground",
        fontWeight: emphasised
          ? theme.typography.fontWeight.caption
          : theme.typography.fontWeight.body,
      })}
    >
      {label}
    </Text>
  );
}

function CheckMark({ shown }: { readonly shown: boolean }) {
  const theme = useTheme();
  return (
    <Text
      {...decorativeProps}
      style={{ color: theme.colors.foreground, opacity: shown ? 1 : 0 }}
    >
      ✓
    </Text>
  );
}

function ActionRow({
  choose,
  destructiveLabel,
  item,
  selection,
}: RowProps<DropdownMenuActionItem> & {
  readonly destructiveLabel: string;
  readonly selection: SelectionKey | undefined;
}) {
  const selected = isSingleSelected(selection, item, getItemId);
  const rowStyle = useRowStyle(selected, item.inset);
  return (
    <InteractivePressable
      accessibilityHint={item.destructive ? destructiveLabel : undefined}
      accessibilityLabel={item.label}
      accessibilityRole="menuitem"
      accessibilityState={{ disabled: item.disabled === true, selected }}
      disabled={item.disabled === true}
      onPress={() => {
        choose(item.id, true);
      }}
      selected={selected}
      style={rowStyle}
    >
      <RowLabel
        destructive={item.destructive}
        emphasised={selected}
        label={item.label}
      />
    </InteractivePressable>
  );
}

function CheckboxRow({ choose, item }: RowProps<DropdownMenuCheckboxItem>) {
  const checked = item.checked ?? false;
  const rowStyle = useRowStyle(checked);
  return (
    <InteractivePressable
      accessibilityLabel={item.label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled: item.disabled === true }}
      disabled={item.disabled === true}
      onPress={() => {
        item.onCheckedChange?.(!checked);
        choose(item.id, false);
      }}
      selected={checked}
      style={[rowStyle, styles.mark]}
    >
      <RowLabel emphasised={checked} label={item.label} />
      <CheckMark shown={checked} />
    </InteractivePressable>
  );
}

function RadioRow({
  checked,
  item,
  onChoose,
}: {
  readonly checked: boolean;
  readonly item: DropdownMenuRadioItem;
  readonly onChoose: () => void;
}) {
  const rowStyle = useRowStyle(checked);
  return (
    <InteractivePressable
      accessibilityLabel={item.label}
      accessibilityRole="radio"
      accessibilityState={{ checked, disabled: item.disabled === true }}
      disabled={item.disabled === true}
      onPress={onChoose}
      selected={checked}
      style={[rowStyle, styles.mark]}
    >
      <RowLabel emphasised={checked} label={item.label} />
      <CheckMark shown={checked} />
    </InteractivePressable>
  );
}

function RadioGroupRows({ choose, item }: RowProps<DropdownMenuRadioGroup>) {
  const theme = useTheme();
  return (
    <View>
      {item.label ? (
        <Text
          accessibilityRole="header"
          style={[
            styles.heading,
            ...typeStyle(theme, "bodySmall", "mutedForeground"),
          ]}
        >
          {item.label}
        </Text>
      ) : null}
      {item.items.map((radio) => (
        <RadioRow
          checked={radio.id === item.value}
          item={radio}
          key={radio.id}
          onChoose={() => {
            item.onValueChange?.(radio.id);
            choose(radio.id, false);
          }}
        />
      ))}
    </View>
  );
}

function SubRows({
  item,
  ...rows
}: Omit<RowsProps, "items"> & { readonly item: DropdownMenuSub }) {
  const theme = useTheme();
  const [open, setOpen] = useControllableState(
    controllableOptions(
      item.open,
      item.defaultOpen ?? false,
      item.onOpenChange,
    ),
  );
  const rowStyle = useRowStyle(false, item.inset);
  return (
    <View>
      <InteractivePressable
        accessibilityLabel={item.label}
        accessibilityRole="menuitem"
        accessibilityState={{
          disabled: item.disabled === true,
          expanded: open,
        }}
        disabled={item.disabled === true}
        onPress={() => {
          setOpen(!open);
        }}
        style={[rowStyle, styles.mark]}
      >
        <RowLabel emphasised={open} label={item.label} />
        <Text {...decorativeProps} style={{ color: theme.colors.foreground }}>
          {open ? "⌄" : "›"}
        </Text>
      </InteractivePressable>
      {open ? (
        <View
          accessibilityRole="menu"
          style={{ paddingLeft: theme.spacing[3] }}
        >
          <MenuRows {...rows} items={item.items} />
        </View>
      ) : null}
    </View>
  );
}

function MenuRows({ items, ...rows }: RowsProps): ReactNode {
  return items.map((item) => {
    switch (item.kind) {
      case "checkbox":
        return <CheckboxRow choose={rows.choose} item={item} key={item.id} />;

      case "radio-group":
        return (
          <RadioGroupRows choose={rows.choose} item={item} key={item.id} />
        );

      case "sub":
        return <SubRows {...rows} item={item} key={item.id} />;

      case "item":
      case undefined:
        return <ActionRow {...rows} item={item} key={item.id} />;
    }
  });
}

/**
 * Modal list interpretation of a dropdown for native platforms. The menu
 * `label` renders as the sheet's header and screen readers hear it when the
 * menu opens. Rows can be actions, checkboxes, radio groups or sub-menus that
 * open in place; with `anchorRef` the list is placed against that element.
 */
function DropdownMenu({
  align,
  alignOffset,
  anchorRef,
  cancelLabel,
  defaultOpen = false,
  defaultSelectedId,
  destructiveLabel = "Destructive",
  items,
  label,
  modal = true,
  onOpenChange,
  onRequestClose,
  onSelect,
  open,
  ref,
  selectedId,
  side,
  sideOffset,
}: DropdownMenuProps) {
  const theme = useTheme();
  const reduceMotion = useReducedMotion();
  const [visible, setVisible] = useControllableState(
    controllableOptions(open, defaultOpen, onOpenChange),
  );
  const [selection, setSelection] = useControllableState(
    controllableOptions(selectedId, defaultSelectedId),
  );
  const headingRef = useFocusWhenShown<Text>(visible);
  const placement = useAnchoredPanel({
    active: visible,
    align,
    alignOffset,
    anchorRef,
    side,
    sideOffset,
  });
  const close = (reason: ModalLayerCloseReason) => {
    onRequestClose?.(reason);
    setVisible(false);
  };
  const choose: Choose = (id, selectable) => {
    if (selectable) setSelection(id);
    onSelect?.(id);
    setVisible(false);
  };

  return (
    <ModalLayer
      animationType={reduceMotion ? "none" : "fade"}
      contentProps={{ style: styles.content }}
      keyboardAvoidingViewProps={{ style: styles.content }}
      modal={modal}
      onClose={close}
      ref={ref}
      visible={visible}
    >
      <View
        accessibilityRole="menu"
        onLayout={placement.onLayout}
        style={[
          placement.style ? styles.anchored : styles.surface,
          {
            backgroundColor: theme.colors.popover,
            borderColor: theme.colors.border,
            borderRadius: theme.radius.md,
            gap: theme.spacing[2],
            padding: theme.spacing[2],
          },
          placement.style,
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
        <ScrollView>
          <MenuRows
            choose={choose}
            destructiveLabel={destructiveLabel}
            items={items}
            selection={selection}
          />
        </ScrollView>
        <InteractivePressable
          accessibilityLabel={cancelLabel}
          accessibilityRole="button"
          filled
          onPress={() => {
            close("requestClose");
          }}
          style={[
            styles.cancel,
            {
              backgroundColor: theme.colors.secondary,
              borderRadius: theme.radius.md,
            },
          ]}
        >
          <Text style={{ color: theme.colors.secondaryForeground }}>
            {cancelLabel}
          </Text>
        </InteractivePressable>
      </View>
    </ModalLayer>
  );
}
DropdownMenu.displayName = "DropdownMenu";

export { DropdownMenu };
