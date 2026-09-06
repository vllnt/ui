import { type Ref, useState } from "react";

import { ScrollView, StyleSheet, View, type ViewProps } from "react-native";

import { useTheme } from "../../theme/theme-provider";
import { Badge } from "../badge/badge";
import { Button } from "../button/button";
import { Card } from "../card/card";
import { Text } from "../text/text";

/** Semantic tone for a native activity entry. */
export type ActivityLogTone = "danger" | "default" | "success" | "warning";

/** One caller-keyed activity log entry. */
export type ActivityLogItem = {
  readonly action: string;
  readonly actor: string;
  readonly description?: string;
  readonly id: string;
  readonly scope?: string;
  readonly target?: string;
  readonly timestamp: string;
  readonly tone?: ActivityLogTone;
};

/** Props for a paginated native activity log. */
export type ActivityLogProps = Omit<ViewProps, "children"> & {
  readonly defaultPage?: number;
  readonly description?: string;
  readonly emptyMessage?: string;
  readonly items: readonly ActivityLogItem[];
  readonly nextLabel?: string;
  readonly onPageChange?: (page: number) => void;
  readonly page?: number;
  readonly pageSize?: number;
  readonly previousLabel?: string;
  readonly ref?: Ref<View>;
  readonly title?: string;
};

const styles = StyleSheet.create({
  controls: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  item: { borderTopWidth: 1 },
});

function positiveInteger(value: number, fallback: number): number {
  return Number.isFinite(value) ? Math.max(1, Math.floor(value)) : fallback;
}

function ActivityHeader({
  currentPage,
  description,
  title,
  totalPages,
}: {
  readonly currentPage: number;
  readonly description?: string;
  readonly title: string;
  readonly totalPages: number;
}) {
  const theme = useTheme();
  return (
    <View style={{ gap: theme.spacing[1] }}>
      <Text weight="semibold">{title}</Text>
      {description ? (
        <Text size="small" tone="muted">
          {description}
        </Text>
      ) : null}
      <Text size="caption" tone="muted">
        Page {currentPage} of {totalPages}
      </Text>
    </View>
  );
}
ActivityHeader.displayName = "ActivityHeader";

function ActivityRow({ item }: { readonly item: ActivityLogItem }) {
  const theme = useTheme();
  return (
    <View
      accessibilityRole="text"
      style={[
        styles.item,
        {
          borderTopColor: theme.colors.border,
          gap: theme.spacing[1],
          paddingVertical: theme.spacing[3],
        },
      ]}
    >
      <Text weight="medium">
        {item.actor} · {item.action}
        {item.target ? ` · ${item.target}` : ""}
      </Text>
      {item.description ? (
        <Text size="small" tone="muted">
          {item.description}
        </Text>
      ) : null}
      <View style={styles.controls}>
        {item.scope ? (
          <Badge variant={item.tone === "danger" ? "destructive" : "outline"}>
            {item.scope}
          </Badge>
        ) : (
          <View />
        )}
        <Text size="caption" tone="muted">
          {item.timestamp}
        </Text>
      </View>
    </View>
  );
}
ActivityRow.displayName = "ActivityRow";

function ActivityControls({
  currentPage,
  itemCount,
  nextLabel,
  onPageChange,
  previousLabel,
  start,
  totalItems,
  totalPages,
}: {
  readonly currentPage: number;
  readonly itemCount: number;
  readonly nextLabel: string;
  readonly onPageChange: (page: number) => void;
  readonly previousLabel: string;
  readonly start: number;
  readonly totalItems: number;
  readonly totalPages: number;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.controls, { gap: theme.spacing[2] }]}>
      <Button
        accessibilityLabel={`${previousLabel}, page ${currentPage - 1}`}
        disabled={currentPage === 1}
        onPress={() => {
          onPageChange(currentPage - 1);
        }}
        size="sm"
        variant="outline"
      >
        {previousLabel}
      </Button>
      <Text size="caption" tone="muted">
        Showing {start + 1}–{start + itemCount} of {totalItems}
      </Text>
      <Button
        accessibilityLabel={`${nextLabel}, page ${currentPage + 1}`}
        disabled={currentPage === totalPages}
        onPress={() => {
          onPageChange(currentPage + 1);
        }}
        size="sm"
        variant="outline"
      >
        {nextLabel}
      </Button>
    </View>
  );
}
ActivityControls.displayName = "ActivityControls";

/** Native paginated activity history with caller-owned entry identifiers. */
function ActivityLog({
  defaultPage = 1,
  description,
  emptyMessage = "No activity recorded yet.",
  items,
  nextLabel = "Next",
  onPageChange,
  page,
  pageSize = 5,
  previousLabel = "Previous",
  ref,
  style,
  title = "Activity log",
  ...props
}: ActivityLogProps) {
  const theme = useTheme();
  const safePageSize = positiveInteger(pageSize, 5);
  const totalPages = Math.max(1, Math.ceil(items.length / safePageSize));
  const [uncontrolledPage, setUncontrolledPage] = useState(() =>
    positiveInteger(defaultPage, 1),
  );
  const requestedPage = positiveInteger(page ?? uncontrolledPage, 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const start = (currentPage - 1) * safePageSize;
  const visibleItems = items.slice(start, start + safePageSize);
  const changePage = (nextPage: number) => {
    const boundedPage = Math.min(Math.max(nextPage, 1), totalPages);
    if (page === undefined) setUncontrolledPage(boundedPage);
    onPageChange?.(boundedPage);
  };

  return (
    <Card
      {...props}
      ref={ref}
      style={[{ gap: theme.spacing[3], padding: theme.spacing[4] }, style]}
    >
      <ActivityHeader
        currentPage={currentPage}
        description={description}
        title={title}
        totalPages={totalPages}
      />
      {items.length === 0 ? (
        <Text size="small" tone="muted">
          {emptyMessage}
        </Text>
      ) : (
        <ScrollView accessibilityLabel={title} accessibilityRole="list">
          {visibleItems.map((item) => (
            <ActivityRow item={item} key={item.id} />
          ))}
        </ScrollView>
      )}
      {items.length > 0 ? (
        <ActivityControls
          currentPage={currentPage}
          itemCount={visibleItems.length}
          nextLabel={nextLabel}
          onPageChange={changePage}
          previousLabel={previousLabel}
          start={start}
          totalItems={items.length}
          totalPages={totalPages}
        />
      ) : null}
    </Card>
  );
}
ActivityLog.displayName = "ActivityLog";

export { ActivityLog };
