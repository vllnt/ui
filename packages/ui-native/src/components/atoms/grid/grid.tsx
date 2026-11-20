import { Children, type ReactNode, type Ref } from "react";

import {
  type DimensionValue,
  useWindowDimensions,
  View,
  type ViewProps,
} from "react-native";

import { responsiveValue } from "../../../primitives/breakpoints";
import { useTheme } from "../../../theme/theme-provider";

/** Supported native grid column counts. */
export type GridColumns = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
/** Design-system spacing values available between native grid cells. */
export type GridGap = 0 | 1 | 2 | 3 | 4 | 6 | 8 | 12 | 16;
/** Props for the wrapping native grid. */
export type GridProps = Omit<ViewProps, "children"> & {
  readonly children?: ReactNode;
  /** Base column count, used below the first breakpoint that has a value. Defaults to `1`. */
  readonly cols?: GridColumns;
  readonly gap?: GridGap;
  /** Column count from the `lg` breakpoint (1024 points wide) up. */
  readonly lgCols?: GridColumns;
  /** Column count from the `md` breakpoint (768 points wide) up. */
  readonly mdCols?: GridColumns;
  readonly ref?: Ref<View>;
  /** Column count from the `sm` breakpoint (640 points wide) up. */
  readonly smCols?: GridColumns;
};

/**
 * Fixed-column native layout that wraps each direct child into an equal-width
 * cell. `smCols`, `mdCols` and `lgCols` change the column count by window
 * width at the web breakpoints, and each one carries up to wider windows until
 * a larger breakpoint sets its own.
 */
function Grid({
  children,
  cols = 1,
  gap = 4,
  lgCols,
  mdCols,
  ref,
  smCols,
  style,
  ...props
}: GridProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const spacing = gap === 0 ? 0 : theme.spacing[gap];
  const columns = responsiveValue(width, cols, {
    lg: lgCols,
    md: mdCols,
    sm: smCols,
  });
  const cellWidth: DimensionValue = `${100 / columns}%`;

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
