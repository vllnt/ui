"use client";

import {
  createContext,
  type Ref,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextProps,
  View,
  type ViewProps,
} from "react-native";

import {
  joinAccessibilityText,
  plainText,
  useAnnounceOnChange,
} from "../../../primitives/accessibility";
import { typeStyle } from "../../../primitives/type-style";
import { useTheme } from "../../../theme/theme-provider";

/** Native alert tone. */
export type AlertVariant = "default" | "destructive";

/**
 * Props for a native alert region. `accessibilityLabel` replaces the spoken
 * announcement (by default the title and description text).
 */
export type AlertProps = ViewProps & {
  readonly ref?: Ref<View>;
  readonly variant?: AlertVariant;
};
/** Props for the heading inside a native alert. */
export type AlertTitleProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};
/** Props for supporting alert text. */
export type AlertDescriptionProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};

type AlertTextPart = "description" | "title";
type AlertTexts = Readonly<Partial<Record<AlertTextPart, string>>>;
const AlertTextContext = createContext<
  ((part: AlertTextPart, text?: string) => void) | null
>(null);

/** Shares a part's plain text with its Alert so the alert can announce it. */
function useAlertText(part: AlertTextPart, text?: string) {
  const setText = use(AlertTextContext);
  useEffect(() => {
    setText?.(part, text);
    return () => {
      setText?.(part, undefined);
    };
  }, [part, setText, text]);
}

/**
 * Time-sensitive native announcement surface. TalkBack speaks it through its
 * live region and iOS receives an announcement when it appears or its text
 * changes. The alert stays a plain group so actions inside it remain
 * individually reachable by screen readers.
 */
function Alert({
  accessibilityLabel,
  accessibilityLiveRegion,
  ref,
  style,
  variant = "default",
  ...props
}: AlertProps) {
  const theme = useTheme();
  const [texts, setTexts] = useState<AlertTexts>({});
  const setText = useCallback((part: AlertTextPart, text?: string) => {
    setTexts((current) =>
      current[part] === text ? current : { ...current, [part]: text },
    );
  }, []);
  const liveRegion =
    accessibilityLiveRegion ??
    (variant === "destructive" ? "assertive" : "polite");
  useAnnounceOnChange(
    liveRegion === "none"
      ? undefined
      : (accessibilityLabel ??
          joinAccessibilityText([texts.title, texts.description])),
    { initial: true, liveRegion: true },
  );

  return (
    <AlertTextContext value={setText}>
      <View
        {...props}
        accessibilityLabel={accessibilityLabel}
        accessibilityLiveRegion={liveRegion}
        ref={ref}
        style={[
          {
            backgroundColor:
              variant === "destructive"
                ? theme.colors.muted
                : theme.colors.background,
            borderColor:
              variant === "destructive"
                ? theme.colors.destructive
                : theme.colors.border,
            borderRadius: theme.radius.md,
            borderWidth: 1,
            gap: theme.spacing[1],
            padding: theme.spacing[4],
          },
          style,
        ]}
      />
    </AlertTextContext>
  );
}
Alert.displayName = "Alert";

/** Heading for a native alert. */
function AlertTitle({ ref, style, ...props }: AlertTitleProps) {
  const theme = useTheme();
  useAlertText("title", plainText(props.children));
  return (
    <NativeText
      {...props}
      accessibilityRole="header"
      ref={ref}
      style={[
        ...typeStyle(theme, "body", {
          color: "foreground",
          fontWeight: theme.typography.fontWeight.caption,
        }),
        style,
      ]}
    />
  );
}
AlertTitle.displayName = "AlertTitle";

/** Supporting content for a native alert. */
function AlertDescription({ ref, style, ...props }: AlertDescriptionProps) {
  const theme = useTheme();
  useAlertText("description", plainText(props.children));
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[...typeStyle(theme, "bodySmall", "mutedForeground"), style]}
    />
  );
}
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertDescription, AlertTitle };
