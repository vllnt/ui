import type { Ref } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type ViewProps,
} from "react-native";

import type { LinkingService } from "../../primitives/platform-services";
import { useTheme } from "../../theme/theme-provider";
import { Text } from "../text/text";

/** Localizable labels for native pagination. */
export type PaginationLabels = {
  readonly navigation?: string;
  readonly next?: string;
  readonly page?: (page: number) => string;
  readonly previous?: string;
};

/** Props for native paginated navigation. */
export type PaginationProps = Omit<ViewProps, "children" | "ref"> & {
  readonly currentPage: number;
  readonly getHref?: (page: number) => string;
  readonly labels?: PaginationLabels;
  readonly linking?: LinkingService;
  readonly maxVisiblePages?: number;
  readonly onPageChange?: (page: number) => void;
  readonly ref?: Ref<View>;
  readonly totalPages: number;
};

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "center" },
});

/** Native pagination exposing current, disabled, button, and link semantics. */
function Pagination({
  currentPage,
  getHref,
  labels,
  linking,
  maxVisiblePages = 5,
  onPageChange,
  ref,
  style,
  totalPages,
  ...props
}: PaginationProps) {
  const theme = useTheme();
  if (totalPages <= 1) return null;
  const visibleCount = Math.max(1, Math.floor(maxVisiblePages));
  let start = Math.max(1, currentPage - Math.floor(visibleCount / 2));
  const end = Math.min(totalPages, start + visibleCount - 1);
  start = Math.max(1, end - visibleCount + 1);
  const pages = Array.from(
    { length: end - start + 1 },
    (_, index) => start + index,
  );
  const resolved = {
    navigation: labels?.navigation ?? "Pagination",
    next: labels?.next ?? "Next page",
    page: labels?.page ?? ((page: number) => `Page ${page}`),
    previous: labels?.previous ?? "Previous page",
  };
  const activate = (page: number) => {
    onPageChange?.(page);
    const href = getHref?.(page);
    if (href && linking) void linking.openUrl(href);
  };
  const action = (
    page: number,
    content: string,
    disabled: boolean,
    current: boolean,
  ) => (
    <Pressable
      accessibilityLabel={
        current ? `${resolved.page(page)}, current page` : content
      }
      accessibilityRole={getHref ? "link" : "button"}
      accessibilityState={{ disabled, selected: current }}
      disabled={disabled}
      key={`${content}-${page}`}
      onPress={() => {
        activate(page);
      }}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: current
            ? theme.colors.primary
            : pressed
              ? theme.colors.accent
              : theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          paddingHorizontal: theme.spacing[2],
        },
      ]}
    >
      <Text
        size="small"
        style={{
          color: current
            ? theme.colors.primaryForeground
            : theme.colors.foreground,
        }}
        weight="medium"
      >
        {content}
      </Text>
    </Pressable>
  );

  return (
    <View
      {...props}
      accessibilityLabel={props.accessibilityLabel ?? resolved.navigation}
      accessibilityRole="none"
      ref={ref}
      style={style}
    >
      <ScrollView
        contentContainerStyle={[styles.row, { gap: theme.spacing[2] }]}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {action(
          Math.max(1, currentPage - 1),
          resolved.previous,
          currentPage <= 1,
          false,
        )}
        {pages.map((page) =>
          action(page, String(page), false, page === currentPage),
        )}
        {action(
          Math.min(totalPages, currentPage + 1),
          resolved.next,
          currentPage >= totalPages,
          false,
        )}
      </ScrollView>
    </View>
  );
}
Pagination.displayName = "Pagination";

export { Pagination };
