import type { ReactNode, Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import {
  defaultLinkingService,
  type LinkingService,
} from "../../primitives/platform-services";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** One native breadcrumb segment. */
export type BreadcrumbItem = {
  readonly disabled?: boolean;
  readonly href?: string;
  readonly id: string;
  readonly label: string;
  readonly leading?: ReactNode;
};

/** Props for an accessible native breadcrumb trail. */
export type BreadcrumbProps = Omit<ViewProps, "children" | "ref"> & {
  readonly items: readonly BreadcrumbItem[];
  readonly label?: string;
  readonly linking?: LinkingService;
  readonly onNavigate?: (item: BreadcrumbItem) => void;
  readonly onOpenError?: (error: unknown, item: BreadcrumbItem) => void;
  readonly ref?: Ref<View>;
  readonly separator?: string;
};

const styles = StyleSheet.create({
  item: { alignItems: "center", flexDirection: "row", minHeight: 44 },
  row: { alignItems: "center", flexDirection: "row" },
});

/** Horizontally scrollable native breadcrumb links with current-page state. */
function Breadcrumb({
  items,
  label = "Breadcrumb",
  linking = defaultLinkingService,
  onNavigate,
  onOpenError,
  ref,
  separator = "›",
  style,
  ...props
}: BreadcrumbProps) {
  const theme = useTheme();
  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? label}
      accessibilityRole="none"
      ref={ref}
      style={style}
    >
      <ScrollView
        contentContainerStyle={[styles.row, { gap: theme.spacing[2] }]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {items.map((item, index) => {
          const current = index === items.length - 1;
          const interactive =
            !current && (item.href !== undefined || onNavigate !== undefined);
          return (
            <View key={item.id} style={styles.row}>
              {index > 0 ? (
                <Text
                  accessibilityElementsHidden
                  importantForAccessibility="no"
                  tone="muted"
                >
                  {separator}
                </Text>
              ) : null}
              {interactive ? (
                <Pressable
                  accessibilityLabel={item.label}
                  accessibilityRole={item.href ? "link" : "button"}
                  accessibilityState={{ disabled: item.disabled }}
                  disabled={item.disabled}
                  onPress={() => {
                    onNavigate?.(item);
                    if (item.href) {
                      void linking
                        .openUrl(item.href)
                        .then(undefined, (error: unknown) => {
                          onOpenError?.(error, item);
                        });
                    }
                  }}
                  style={({ pressed }) => [
                    styles.item,
                    {
                      gap: theme.spacing[1],
                      opacity: item.disabled ? 0.5 : pressed ? 0.8 : 1,
                      paddingHorizontal: theme.spacing[2],
                    },
                  ]}
                >
                  {item.leading}
                  <Text size="small" tone="muted">
                    {item.label}
                  </Text>
                </Pressable>
              ) : (
                <View
                  accessibilityLabel={item.label}
                  accessibilityRole="text"
                  accessibilityState={{ selected: current }}
                  style={[
                    styles.item,
                    {
                      gap: theme.spacing[1],
                      paddingHorizontal: theme.spacing[2],
                    },
                  ]}
                >
                  {item.leading}
                  <Text size="small" weight={current ? "medium" : "normal"}>
                    {item.label}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
Breadcrumb.displayName = "Breadcrumb";

export { Breadcrumb };
