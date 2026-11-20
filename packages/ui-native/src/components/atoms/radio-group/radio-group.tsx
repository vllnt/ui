"use client";

import { createContext, type ReactNode, type Ref, use, useMemo } from "react";

import {
  type PressableProps,
  StyleSheet,
  Text as NativeText,
  View,
  type ViewProps,
} from "react-native";

import {
  decorativeProps,
  requiredHint,
} from "../../../primitives/accessibility";
import { useGroupDisabled } from "../../../primitives/control-group";
import { interactionTokens } from "../../../primitives/interaction-state";
import {
  InteractivePressable,
  type KeyDownEvent,
} from "../../../primitives/interactive-pressable";
import {
  isSingleSelected,
  type SelectionKey,
  selectSingle,
} from "../../../primitives/selection";
import { typeStyle } from "../../../primitives/type-style";
import { useControllableState } from "../../../primitives/use-controllable-state";
import {
  type RovingGroup,
  useRovingGroup,
  useRovingItem,
} from "../../../primitives/use-roving-group";
import { useTheme } from "../../../theme/theme-provider";

/** Layout axis for a native radio group. */
export type RadioGroupOrientation = "horizontal" | "vertical";

/**
 * Props for a controlled or uncontrolled native radio group. The web `name`
 * and `dir` props are DOM-only (a form field name and a text direction the
 * platform already applies), so native does not take them.
 */
export type RadioGroupProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly defaultValue?: SelectionKey;
  readonly disabled?: boolean;
  /**
   * Whether the arrow keys wrap from the last radio to the first and back.
   * Defaults to `true`, as on web.
   */
  readonly loop?: boolean;
  readonly onValueChange?: (value: SelectionKey | undefined) => void;
  readonly orientation?: RadioGroupOrientation;
  readonly ref?: Ref<View>;
  /**
   * Marks a choice as required. Every radio announces it in its hint; web
   * draws no visible marker for it, so neither does native.
   */
  readonly required?: boolean;
  /** Spoken word for `required`. Defaults to "Required". */
  readonly requiredLabel?: string;
  readonly value?: SelectionKey;
};

/** Props for a radio item identified by a caller-owned stable value. */
export type RadioGroupItemProps = Omit<PressableProps, "children"> & {
  readonly children?: ReactNode;
  /** Runs when a key goes down while this radio has focus. */
  readonly onKeyDown?: (event: KeyDownEvent) => void;
  readonly ref?: Ref<View>;
  /** Marks this radio as required, on top of the group's own `required`. */
  readonly required?: boolean;
  readonly value: SelectionKey;
};

type RadioGroupContextValue = {
  readonly disabled: boolean;
  readonly group: RovingGroup<SelectionKey>;
  readonly groupLabel?: string;
  readonly loop: boolean;
  readonly required: boolean;
  readonly requiredLabel?: string;
  readonly select: (value: SelectionKey) => void;
  readonly value?: SelectionKey;
};

const RadioGroupContext = createContext<RadioGroupContextValue | undefined>(
  undefined,
);

const styles = StyleSheet.create({
  horizontal: { alignItems: "center", flexDirection: "row" },
  indicator: {
    alignItems: "center",
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  item: { alignItems: "center", flexDirection: "row" },
  mark: { height: 10, width: 10 },
  vertical: { alignItems: "stretch", flexDirection: "column" },
});

function identity(key: SelectionKey): SelectionKey {
  return key;
}

/**
 * Native radio group using caller-owned item values for stable selection.
 * VoiceOver ignores labels and state on non-focusable containers, so the
 * group's `accessibilityLabel` becomes each radio's hint and `disabled`
 * reaches every radio.
 */
function RadioGroup(groupProps: RadioGroupProps) {
  const {
    accessibilityLabel,
    accessibilityState: _accessibilityState,
    children,
    defaultValue,
    disabled: ownDisabled = false,
    loop = true,
    onValueChange,
    orientation = "vertical",
    ref,
    required = false,
    requiredLabel,
    style,
    value,
    ...props
  } = groupProps;
  const disabled = useGroupDisabled(ownDisabled);
  const group = useRovingGroup<SelectionKey>();
  const [selectedValue, setSelectedValue] = useControllableState(
    "value" in groupProps
      ? { mode: "controlled", onChange: onValueChange, value }
      : {
          defaultValue,
          mode: "uncontrolled",
          onChange: onValueChange,
        },
  );
  const context = useMemo<RadioGroupContextValue>(
    () => ({
      disabled: disabled ?? undefined,
      group,
      groupLabel: accessibilityLabel,
      loop,
      required,
      requiredLabel,
      select(nextValue) {
        setSelectedValue(selectSingle(selectedValue, nextValue, identity));
      },
      value: selectedValue,
    }),
    [
      accessibilityLabel,
      disabled,
      group,
      loop,
      required,
      requiredLabel,
      selectedValue,
      setSelectedValue,
    ],
  );
  const theme = useTheme();

  return (
    <View
      {...props}
      accessibilityRole="radiogroup"
      ref={ref}
      style={[
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        {
          gap: theme.spacing[2],
          opacity: disabled ? interactionTokens(theme).disabledOpacity : 1,
        },
        style,
      ]}
    >
      <RadioGroupContext value={context}>{children}</RadioGroupContext>
    </View>
  );
}
RadioGroup.displayName = "RadioGroup";

/**
 * Accessible native radio keyed by its required stable value prop. The dot in
 * the ring is the selection cue that does not rely on colour.
 */
function RadioGroupItem({
  accessibilityHint,
  accessibilityState,
  children,
  disabled = false,
  onKeyDown,
  onPress,
  ref,
  required = false,
  style,
  value,
  ...props
}: RadioGroupItemProps) {
  const context = use(RadioGroupContext);
  if (context === undefined) {
    throw new Error("RadioGroupItem must be rendered inside RadioGroup.");
  }
  const theme = useTheme();
  const checked = isSingleSelected(context.value, value, identity);
  const isDisabled = Boolean(context.disabled || disabled);
  const itemRef = useRovingItem({
    disabled: isDisabled,
    group: context.group,
    itemKey: value,
    reference: ref,
  });

  return (
    <InteractivePressable
      {...props}
      accessibilityHint={requiredHint(
        accessibilityHint ?? context.groupLabel,
        context.required || required,
        context.requiredLabel,
      )}
      accessibilityRole="radio"
      accessibilityState={{
        ...accessibilityState,
        checked,
        disabled: isDisabled,
      }}
      disabled={isDisabled}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        const target = context.group.move(value, event.nativeEvent.key, {
          loop: context.loop,
        });
        if (target !== undefined) context.select(target);
      }}
      onPress={(event) => {
        onPress?.(event);
        if (!event?.defaultPrevented) context.select(value);
      }}
      ref={itemRef}
      style={(state) => [
        styles.item,
        { borderRadius: theme.radius.md, gap: theme.spacing[2] },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <View
        {...decorativeProps}
        style={[
          styles.indicator,
          {
            borderColor: theme.colors.primary,
            borderRadius: theme.radius.full,
            borderWidth: 1,
          },
        ]}
      >
        {checked ? (
          <View
            style={[
              styles.mark,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radius.full,
              },
            ]}
          />
        ) : null}
      </View>
      {typeof children === "number" || typeof children === "string" ? (
        <NativeText style={typeStyle(theme, "bodySmall", "foreground")}>
          {children}
        </NativeText>
      ) : (
        children
      )}
    </InteractivePressable>
  );
}
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };
