import { Children, type ReactNode, type Ref } from "react";

import { type DimensionValue, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";

/** Supported native grid column counts. */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
/** Design-system spacing values available between native grid cells. */
export type GridGap = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
/** Props for the wrapping native grid. */
export type GridProps = Omit<ViewProps, "children"> & {
  readonly children?: ReactNode;
  readonly cols?: GridColumns;
  readonly gap?: GridGap;
  readonly ref?: Ref<View>;
};

/** Fixed-column native layout that wraps each direct child into an equal-width cell. */
function Grid({
  children,
  cols = 1,
  gap = 4,
  ref,
  style,
  ...props
}: GridProps) {
  const theme = useTheme();
  const spacing = gap === 0 ? 0 : theme.spacing[gap];
  const cellWidth: DimensionValue = `${100 / cols}%`;

  return (
    <View
      {...props}
      ref={ref}
      style={[
        { flexDirection: "row", flexWrap: "wrap", margin: -spacing / 2 },
        style,
      ]}
    >
      {Children.map(children, (child) => (
        <View style={{ padding: spacing / 2, width: cellWidth }}>{child}</View>
      ))}
    </View>
  );
}
Grid.displayName = "Grid";

export { Grid };
