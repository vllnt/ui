import type { Ref } from "react";
import {
  Linking,
  Pressable,
  type PressableProps,
  StyleSheet,
  type View,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Props for an actionable native AI source citation. */
export type AISourceCitationProps = Omit<
  PressableProps,
  "children" | "onPress"
> & {
  readonly href: string;
  readonly onOpen?: (href: string) => void;
  readonly ref?: Ref<View>;
  readonly snippet?: string;
  readonly source: string;
  readonly title: string;
};

const styles = StyleSheet.create({
  root: { borderWidth: 1, width: "100%" },
});

/** Native citation link using React Native's Linking API by default. */
function AISourceCitation({
  accessibilityLabel,
  accessibilityState,
  disabled = false,
  href,
  onOpen,
  ref,
  snippet,
  source,
  style,
  title,
  ...props
}: AISourceCitationProps) {
  const theme = useTheme();
  const isDisabled = disabled === true;

  return (
    <Pressable
      {...props}
      accessibilityLabel={accessibilityLabel ?? `${title}, ${source}`}
      accessibilityRole="link"
      accessibilityState={{ ...accessibilityState, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={() => {
        if (onOpen) {
          onOpen(href);
          return;
        }
        void Linking.openURL(href);
      }}
      ref={ref}
      style={(state) => [
        styles.root,
        {
          backgroundColor: state.pressed
            ? theme.colors.muted
            : theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.lg,
          gap: theme.spacing[2],
          opacity: isDisabled ? 0.5 : state.pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[3],
          paddingVertical: theme.spacing[2],
        },
        typeof style === "function" ? style(state) : style,
      ]}
    >
      <Text numberOfLines={1} weight="medium">
        {title}
      </Text>
      <Text size="caption" tone="muted">
        {source}
      </Text>
      {snippet ? (
        <Text numberOfLines={3} tone="muted">
          {snippet}
        </Text>
      ) : null}
    </Pressable>
  );
}
AISourceCitation.displayName = "AISourceCitation";

export { AISourceCitation };
