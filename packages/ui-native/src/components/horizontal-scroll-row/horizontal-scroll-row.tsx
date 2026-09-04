import type { ReactNode, Ref } from "react";
import {
  ScrollView,
  type ScrollViewProps,
  StyleSheet,
  View,
} from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Heading } from "../heading/heading";
import { Text } from "../text/text";

/** Props for an accessible native horizontal content row. */
export type HorizontalScrollRowProps = Omit<
  ScrollViewProps,
  "children" | "horizontal" | "ref"
> & {
  readonly children: ReactNode;
  readonly description?: string;
  readonly headingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
  readonly ref?: Ref<ScrollView>;
  readonly title: string;
};

const styles = StyleSheet.create({
  root: { width: "100%" },
  row: { flexDirection: "row" },
});

/** Labeled, accessible native horizontal ScrollView. */
function HorizontalScrollRow({
  accessibilityLabel,
  children,
  contentContainerStyle,
  description,
  headingLevel = 3,
  ref,
  style,
  title,
  ...props
}: HorizontalScrollRowProps) {
  const theme = useTheme();
  return (
    <View style={[styles.root, { gap: theme.spacing[4] }]}>
      <View style={{ gap: theme.spacing[1] }}>
        <Heading level={headingLevel} size={6}>
          {title}
        </Heading>
        {description ? (
          <Text size="small" tone="muted">
            {description}
          </Text>
        ) : null}
      </View>
      <ScrollView
        {...props}
        accessibilityLabel={accessibilityLabel ?? title}
        accessibilityRole="list"
        accessible
        contentContainerStyle={[
          styles.row,
          { gap: theme.spacing[4] },
          contentContainerStyle,
        ]}
        horizontal
        ref={ref}
        showsHorizontalScrollIndicator={
          props.showsHorizontalScrollIndicator ?? false
        }
        style={style}
      >
        {children}
      </ScrollView>
    </View>
  );
}
HorizontalScrollRow.displayName = "HorizontalScrollRow";

export { HorizontalScrollRow };
