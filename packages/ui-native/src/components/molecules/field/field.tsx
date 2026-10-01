"use client";

import {
  createContext,
  type ReactNode,
  type Ref,
  use,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";

import {
  StyleSheet,
  Text as NativeText,
  type Text as NativeTextInstance,
  type TextInput,
  type TextInputProps,
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
import { Input } from "../../atoms/input/input";
import { Label } from "../../atoms/label/label";

type FieldTextPart = "description" | "error" | "label";
type FieldTexts = Readonly<Partial<Record<FieldTextPart, string>>>;
type FieldContextValue = {
  readonly invalid: boolean;
  readonly labelId?: string;
  readonly setLabelId: (id?: string) => void;
  readonly setText: (part: FieldTextPart, text?: string) => void;
  readonly texts: FieldTexts;
};
const FieldContext = createContext<FieldContextValue | null>(null);

function useField(): FieldContextValue {
  const context = use(FieldContext);
  if (!context)
    throw new Error("Field subcomponents must be used within Field");
  return context;
}

/**
 * Shares a part's plain text with the field so the control can speak it:
 * VoiceOver ignores `accessibilityLabelledBy`, an Android prop.
 */
function useFieldText(part: FieldTextPart, text?: string) {
  const { setText } = useField();
  useEffect(() => {
    setText(part, text);
    return () => {
      setText(part, undefined);
    };
  }, [part, setText, text]);
}

/** Props for a native field composition root. */
export type FieldProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly invalid?: boolean;
  readonly orientation?: "horizontal" | "vertical";
  readonly ref?: Ref<View>;
};
/** Props for the visible native field label. */
export type FieldLabelProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};
/** Props for the native text control in a field composition. */
export type FieldControlProps = TextInputProps & {
  readonly ref?: Ref<TextInput>;
};
/** Props for native field helper text. */
export type FieldDescriptionProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};
/** Props for a native field error announcement. */
export type FieldErrorProps = TextProps & {
  readonly ref?: Ref<NativeTextInstance>;
};

const styles = StyleSheet.create({
  horizontal: { alignItems: "center", flexDirection: "row" },
  vertical: { flexDirection: "column" },
});

/** Groups one native text control with its label and supporting messages. */
function Field({
  children,
  invalid = false,
  orientation = "vertical",
  ref,
  style,
  ...props
}: FieldProps) {
  const theme = useTheme();
  const [labelId, setLabelId] = useState<string>();
  const [texts, setTexts] = useState<FieldTexts>({});
  const setText = useCallback((part: FieldTextPart, text?: string) => {
    setTexts((current) =>
      current[part] === text ? current : { ...current, [part]: text },
    );
  }, []);
  const value = useMemo(
    () => ({ invalid, labelId, setLabelId, setText, texts }),
    [invalid, labelId, setText, texts],
  );
  return (
    <FieldContext value={value}>
      <View
        {...props}
        ref={ref}
        style={[
          orientation === "horizontal" ? styles.horizontal : styles.vertical,
          {
            gap:
              orientation === "horizontal"
                ? theme.spacing[3]
                : theme.spacing[1],
          },
          style,
        ]}
      >
        {children}
      </View>
    </FieldContext>
  );
}
Field.displayName = "Field";

/** Visible label that reflects its field's invalid state and names its control. */
function FieldLabel({ nativeID, ref, ...props }: FieldLabelProps) {
  const { invalid, setLabelId } = useField();
  useFieldText("label", plainText(props.children));
  const generatedId = useId();
  const resolvedId = nativeID ?? generatedId;
  useEffect(() => {
    setLabelId(resolvedId);
    return () => {
      setLabelId(undefined);
    };
  }, [resolvedId, setLabelId]);
  return <Label {...props} invalid={invalid} nativeID={resolvedId} ref={ref} />;
}
FieldLabel.displayName = "FieldLabel";

/**
 * Native text input named by its field label, with the description and the
 * current error spoken as its hint on both platforms.
 */
function FieldControl({
  accessibilityHint,
  accessibilityLabel,
  accessibilityLabelledBy,
  ref,
  ...props
}: FieldControlProps) {
  const { invalid, labelId, texts } = useField();
  return (
    <Input
      {...props}
      accessibilityHint={joinAccessibilityText([
        invalid ? texts.error : undefined,
        texts.description,
        accessibilityHint,
      ])}
      accessibilityLabel={accessibilityLabel ?? texts.label}
      accessibilityLabelledBy={accessibilityLabelledBy ?? labelId}
      ref={ref}
    />
  );
}
FieldControl.displayName = "FieldControl";

/** Supporting text for a native field. */
function FieldDescription({ ref, style, ...props }: FieldDescriptionProps) {
  const theme = useTheme();
  useFieldText("description", plainText(props.children));
  return (
    <NativeText
      {...props}
      ref={ref}
      style={[...typeStyle(theme, "bodySmall", "mutedForeground"), style]}
    />
  );
}
FieldDescription.displayName = "FieldDescription";

/**
 * Error text for an invalid field, spoken by TalkBack through its live region
 * and announced on iOS when it appears.
 */
function FieldError({ children, ref, style, ...props }: FieldErrorProps) {
  const theme = useTheme();
  const { invalid } = useField();
  const message = invalid ? plainText(children) : undefined;
  useFieldText("error", message);
  useAnnounceOnChange(message, { initial: true, liveRegion: true });
  if (!invalid || children === undefined || children === null) return null;
  return (
    <NativeText
      {...props}
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      ref={ref}
      style={[
        ...typeStyle(theme, "bodySmall", {
          color: "destructive",
          fontWeight: theme.typography.fontWeight.caption,
        }),
        style,
      ]}
    >
      {children}
    </NativeText>
  );
}
FieldError.displayName = "FieldError";

export { Field, FieldControl, FieldDescription, FieldError, FieldLabel };
