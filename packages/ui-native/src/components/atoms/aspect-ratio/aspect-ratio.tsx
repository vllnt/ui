import type { ReactNode, Ref } from "react";
import { View, type ViewProps } from "react-native";

/** Props for a native aspect-ratio container. */
export type AspectRatioProps = Omit<ViewProps, "children"> & {
  readonly children: ReactNode;
  readonly ratio?: number;
  readonly ref?: Ref<View>;
};

/** Native layout container backed by React Native's aspectRatio style. */
function AspectRatio({
  children,
  ratio = 1,
  ref,
  style,
  ...props
}: AspectRatioProps) {
  return (
    <View {...props} ref={ref} style={[{ aspectRatio: ratio }, style]}>
      {children}
    </View>
  );
}
AspectRatio.displayName = "AspectRatio";

export { AspectRatio };
