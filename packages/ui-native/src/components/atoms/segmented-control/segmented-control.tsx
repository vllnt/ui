"use client";

import type { Ref } from "react";
import {
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import { useGroupDisabled } from "../../../primitives/control-group";
import {
  type ControlSize,
  controlSizeStyle,
} from "../../../primitives/control-size";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import type { RovingOrientation } from "../../../primitives/roving-focus";
import { typeStyle } from "../../../primitives/type-style";
import type { ControllableStateOptions } from "../../../primitives/use-controllable-state";
import { useControllableState } from "../../../primitives/use-controllable-state";
import {
  type RovingGroup,
  useRovingGroup,
  useRovingItem,
} from "../../../primitives/use-roving-group";
import { useTheme } from "../../../theme/theme-provider";

/** Native size scale of a segmented control; targets stay at least 44 points. */
export type SegmentedControlSize = ControlSize;

/** Axis a segmented control lays its segments along. */
export type SegmentedControlOrientation = RovingOrientation;

/** Caller-identified segment. */
export type SegmentedControlItem = {
  readonly disabled?: boolean;
  readonly id: string;
  readonly label: string;
  /** Size of this segment. Falls back to the control's `size`. */
  readonly size?: SegmentedControlSize;
};

/**
 * Props for a native single-selection segmented control. The web `dir` prop
 * is DOM-only: React Native applies the platform layout direction itself.
 */
export type SegmentedControlProps = Omit<ViewProps, "children"> & {
  readonly disabled?: boolean;
  readonly items: readonly SegmentedControlItem[];
  readonly label: string;
  /**
   * Whether the arrow keys wrap from the last segment to the first and back.
   * Defaults to `true`, as on web.
   */
  readonly loop?: boolean;
  /**
   * Axis of the segments: `"horizontal"` is a row, `"vertical"` a column, and
   * the arrow keys follow it. Defaults to `"horizontal"`, as on web.
   */
  readonly orientation?: SegmentedControlOrientation;
  readonly ref?: Ref<View>;
  /**
   * Whether the arrow keys, Home and End move focus between segments from a
   * hardware keyboard or D-pad. Defaults to `true`, as on web. Touch and
   * screen-reader navigation are unaffected, and every segment stays a tab
   * stop, so React Native keeps the platform focus order.
   */
  readonly rovingFocus?: boolean;
  readonly selection: ControllableStateOptions<string>;
  readonly size?: SegmentedControlSize;
};

const styles = StyleSheet.create({
  column: { flexDirection: "column", padding: 4 },
  item: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  itemStacked: { alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", padding: 4 },
});

type SegmentProps = {
  readonly disabled: boolean;
  readonly group: RovingGroup<string>;
  readonly item: SegmentedControlItem;
  readonly label: string;
  readonly onKeyDown: (id: string, key: string) => void;
  readonly onSelect: (id: string) => void;
  readonly orientation: SegmentedControlOrientation;
  readonly selected: boolean;
  readonly size: SegmentedControlSize;
};

function Segment({
  disabled,
  group,
  item,
  label,
  onKeyDown,
  onSelect,
  orientation,
  selected,
  size,
}: SegmentProps) {
  const theme = useTheme();
  const reference = useRovingItem({ disabled, group, itemKey: item.id });
  return (
    <InteractivePressable
      accessibilityHint={label}
      accessibilityLabel={item.label}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
      disabled={disabled}
      filled
      onKeyDown={(event) => {
        onKeyDown(item.id, event.nativeEvent.key);
      }}
      onPress={() => {
        onSelect(item.id);
      }}
      ref={reference}
      selected={selected}
      style={[
        orientation === "horizontal" ? styles.item : styles.itemStacked,
        {
          backgroundColor: selected
            ? theme.colors.background
            : theme.colors.muted,
          borderRadius: theme.radius.md,
          ...controlSizeStyle(theme, item.size ?? size),
        },
      ]}
    >
      <NativeText
        style={typeStyle(theme, "bodySmall", {
          color: selected ? "foreground" : "mutedForeground",
          fontWeight: theme.typography.fontWeight.caption,
          textAlign: "center",
        })}
      >
        {item.label}
      </NativeText>
    </InteractivePressable>
  );
}

/**
 * Native segmented control with radio semantics and 44-point targets. The
 * selected option draws a border frame inside its box besides its raised
 * surface, so selecting never changes its size. The
 * group `label` is each option's hint (VoiceOver ignores labels on
 * non-focusable containers), and option text wraps at large font sizes.
 * Arrow keys move focus, not selection, as on web; Space or Enter (a press)
 * selects.
 */
function SegmentedControl({
  disabled: ownDisabled = false,
  items,
  label,
  loop = true,
  orientation = "horizontal",
  ref,
  rovingFocus = true,
  selection,
  size = "default",
  style,
  ...props
}: SegmentedControlProps) {
  const disabled = useGroupDisabled(ownDisabled);
  const theme = useTheme();
  const group = useRovingGroup<string>();
  const [selectedId, setSelectedId] = useControllableState(selection);
  const order = items.map((item) => item.id);
  return (
    <View
      accessibilityRole="radiogroup"
      ref={ref}
      style={[
        orientation === "horizontal" ? styles.row : styles.column,
        { backgroundColor: theme.colors.muted, borderRadius: theme.radius.lg },
        style,
      ]}
      {...props}
    >
      {items.map((item) => (
        <Segment
          disabled={disabled || item.disabled === true}
          group={group}
          item={item}
          key={item.id}
          label={label}
          onKeyDown={(id, pressedKey) => {
            if (rovingFocus) {
              group.move(id, pressedKey, { loop, order, orientation });
            }
          }}
          onSelect={setSelectedId}
          orientation={orientation}
          selected={item.id === selectedId}
          size={size}
        />
      ))}
    </View>
  );
}
SegmentedControl.displayName = "SegmentedControl";

export { SegmentedControl };
