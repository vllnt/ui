import type { Ref } from "react";
import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
} from "react-native";

import {
  decorativeProps,
  useAnnounceOnChange,
} from "../../primitives/accessibility";
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

/**
 * Native streaming text. It reports `busy` while tokens arrive and announces
 * the final text once when streaming ends, instead of re-reading a live region
 * on every token.
 */
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
  useAnnounceOnChange(isStreaming ? undefined : text);

  return (
    <NativeText
      {...props}
      accessibilityLabel={accessibilityLabel ?? text}
      accessibilityState={{ ...props.accessibilityState, busy: isStreaming }}
      ref={ref}
      style={[...typeStyle(theme, "bodySmall", "foreground"), style]}
    >
      {text}
      {isStreaming && showCursor ? (
        <NativeText
          {...decorativeProps}
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
