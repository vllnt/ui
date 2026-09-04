import { type Ref, useRef } from "react";

import type { TextInput, TextInputProps } from "react-native";

import { Input } from "../input/input";

/** Props for a controlled native inline editor. */
export type InlineInputProps = Omit<
  TextInputProps,
  "defaultValue" | "onChange" | "onChangeText" | "value"
> & {
  readonly disabled?: boolean;
  readonly onCancel?: () => void;
  readonly onChangeText: (value: string) => void;
  readonly onCommit: (value: string) => void;
  readonly ref?: Ref<TextInput>;
  readonly value: string;
};

/** Compact native editor that commits on submit or after a changed value loses focus. */
function InlineInput({
  onBlur,
  onCancel,
  onChangeText,
  onCommit,
  onSubmitEditing,
  ref,
  value,
  ...props
}: InlineInputProps) {
  const initialValue = useRef(value);
  const committed = useRef(false);

  return (
    <Input
      {...props}
      onBlur={(event) => {
        if (!committed.current) {
          if (value === initialValue.current) onCancel?.();
          else onCommit(value);
        }
        committed.current = false;
        onBlur?.(event);
      }}
      onChangeText={onChangeText}
      onSubmitEditing={(event) => {
        committed.current = true;
        onCommit(value);
        onSubmitEditing?.(event);
      }}
      ref={ref}
      returnKeyType={props.returnKeyType ?? "done"}
      value={value}
    />
  );
}
InlineInput.displayName = "InlineInput";

export { InlineInput };
