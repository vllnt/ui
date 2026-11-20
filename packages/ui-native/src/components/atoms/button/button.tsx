import type { ButtonSize, ButtonVariant } from "@vllnt/ui-core";
import type { Ref } from "react";
import {
  type PressableProps,
  type StyleProp,
  StyleSheet,
  Text as NativeText,
  type TextStyle,
  type View,
} from "react-native";

import { useControlGroup } from "../../../primitives/control-group";
import { interactionTokens } from "../../../primitives/interaction-state";
import { InteractivePressable } from "../../../primitives/interactive-pressable";
import { useFontScaledSize } from "../../../primitives/use-font-scaled-size";
import { useTheme } from "../../../theme/theme-provider";

import {
  buttonStateTextStyle,
  isFilledButtonVariant,
  resolveButtonStyles,
} from "./button-styles";

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

  return (
    <InteractivePressable
      {...props}
      accessibilityHint={accessibilityHint ?? group.label}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      filled={isFilledButtonVariant(variant)}
      ref={ref}
      style={(state) => [
        styles.base,
        { borderRadius: theme.radius.md, gap: theme.spacing[2] },
        resolved.container,
        iconSize === undefined
          ? undefined
          : { height: iconSize, width: iconSize },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      {(state) => (
        <NativeText
          style={[
            styles.text,
            theme.typography.scale.bodySmall,
            { fontWeight: theme.typography.fontWeight.label },
            resolved.text,
            buttonStateTextStyle(variant, state),
            textStyle,
          ]}
        >
          {children}
        </NativeText>
      )}
    </InteractivePressable>
  );
}
ButtonFrame.displayName = "ButtonFrame";

function IconButtonFrame(props: ButtonProps) {
  const theme = useTheme();
  const iconSize = useFontScaledSize(interactionTokens(theme).targetMin);
  return <ButtonFrame {...props} iconSize={iconSize} />;
}
IconButtonFrame.displayName = "IconButtonFrame";

/**
 * Accessible native action with the same semantic variants as the web Button.
 * Inside a named group (ButtonGroup, FilterBar, Fieldset) it speaks the group
 * name as its hint and follows the group's disabled state. An icon
 * button (`size="icon"`) grows with the user's font scale. Hover, focus,
 * press and disabled states come from the affordance contract; a ghost button
 * underlines its label so those states also read without colour.
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
