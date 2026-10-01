import type { ButtonSize, ButtonVariant } from "@vllnt/ui-core";
import type { Ref } from "react";
import {
  Pressable,
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text as NativeText,
  type TextStyle,
  type View,
} from "react-native";

import { useControlGroup } from "../../../primitives/control-group";
import { useFontScaledSize } from "../../../primitives/use-font-scaled-size";
import { useTheme } from "../../../theme/theme-provider";

import { resolveButtonStyles } from "./button-styles";

/** Props for the React Native Button renderer. */
export type ButtonProps = Omit<PressableProps, "children"> & {
  /** Native text content styled for the selected semantic variant. */
  readonly children: number | string;
  readonly ref?: Ref<View>;
  readonly size?: ButtonSize;
  readonly textStyle?: StyleProp<TextStyle>;
  readonly variant?: ButtonVariant;
};

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    textAlign: "center",
  },
});

type ButtonFrameProps = ButtonProps & {
  /** Square side of an icon button, already scaled with the font. */
  readonly iconSize?: number;
};

function ButtonFrame({
  accessibilityHint,
  accessibilityLabel,
  accessibilityState,
  children,
  disabled = false,
  iconSize,
  ref,
  size = "default",
  style,
  textStyle,
  variant = "default",
  ...props
}: ButtonFrameProps) {
  const theme = useTheme();
  const group = useControlGroup();
  const isDisabled = disabled === true || group.disabled === true;
  const resolved = resolveButtonStyles(theme, variant, size);
  const content = (
    <NativeText
      style={[
        styles.text,
        theme.typography.scale.bodySmall,
        { fontWeight: theme.typography.fontWeight.caption },
        resolved.text,
        textStyle,
      ]}
    >
      {children}
    </NativeText>
  );

  return (
    <Pressable
      {...props}
      accessibilityHint={accessibilityHint ?? group.label}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      ref={ref}
      style={(state) => [
        styles.base,
        { borderRadius: theme.radius.md, gap: theme.spacing[2] },
        resolved.container,
        iconSize === undefined
          ? undefined
          : { height: iconSize, width: iconSize },
        state.pressed ? styles.pressed : undefined,
        isDisabled ? styles.disabled : undefined,
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {content}
    </Pressable>
  );
}
ButtonFrame.displayName = "ButtonFrame";

function IconButtonFrame(props: ButtonProps) {
  const iconSize = useFontScaledSize(44);
  return <ButtonFrame {...props} iconSize={iconSize} />;
}
IconButtonFrame.displayName = "IconButtonFrame";

/**
 * Accessible native action with the same semantic variants as the web Button.
 * Inside a named group (ButtonGroup, FilterBar, Fieldset) it speaks the group
 * name as its hint and follows the group's disabled state. An icon
 * button (`size="icon"`) grows with the user's font scale.
 */
function Button(props: ButtonProps) {
  return props.size === "icon" ? (
    <IconButtonFrame {...props} />
  ) : (
    <ButtonFrame {...props} />
  );
}
Button.displayName = "Button";

export { Button };
