import type { Ref } from "react";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import { typeStyle } from "../../primitives/type-style";
import { useTheme } from "../../theme/theme-provider";

/** Props for native text updated by an AI stream. */
export type AIStreamingTextProps = Omit<TextProps, "children"> & {
  readonly cursor?: string;
  readonly isStreaming?: boolean;
  readonly ref?: Ref<NativeTextInstance>;
  readonly showCursor?: boolean;
  readonly text: string;
};

/** Native streaming text with polite accessibility announcements. */
function AIStreamingText({
  accessibilityLabel,
  cursor = "▍",
  isStreaming = false,
  ref,
  showCursor = true,
  style,
  text,
  ...props
}: AIStreamingTextProps) {
  const theme = useTheme();

  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityLiveRegion={isStreaming ? "polite" : "none"}
      ref={ref}
      style={[...typeStyle(theme, "bodySmall", "foreground"), style]}
    >
      {text}
      {isStreaming && showCursor ? (
        <NativeText
          accessibilityElementsHidden
          style={{ color: theme.colors.mutedForeground }}
        >
          {cursor}
        </NativeText>
      ) : null}
    </NativeText>
  );
}
AIStreamingText.displayName = "AIStreamingText";

export { AIStreamingText };
