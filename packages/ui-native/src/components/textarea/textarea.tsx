import type { Ref } from "react";
import { StyleSheet, type TextInput, type TextInputProps } from "react-native";

import { Input } from "../input/input";

/** Props for the native multiline text input. */
export type TextareaProps = Omit<TextInputProps, "multiline"> & {
  readonly ref?: Ref<TextInput>;
};

const styles = StyleSheet.create({
  input: { minHeight: 80, textAlignVertical: "top" },
});

/** Accessible multiline React Native text input. */
function Textarea({ ref, style, ...props }: TextareaProps) {
  return <Input {...props} multiline ref={ref} style={[styles.input, style]} />;
}
Textarea.displayName = "Textarea";

export { Textarea };
