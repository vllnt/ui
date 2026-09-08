"use client";

import { useCallback, useMemo } from "react";

import type { ReactNode, Ref } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewProps,
} from "react-native";

import { toggleMultipleSelected } from "../../primitives/selection";
import { useControllableState } from "../../primitives/use-controllable-state";
import { useTheme } from "../../theme/theme-provider";

/** Caller-identified node in a native hierarchy. */
export type TreeViewNode = {
  readonly disabled?: boolean;
  readonly icon?: ReactNode;
  readonly id: string;
  readonly label: string;
  readonly nodes?: readonly TreeViewNode[];
};

/** Localized labels for native tree disclosure controls. */
export type TreeViewLabels = {
  readonly collapseNode: (node: TreeViewNode) => string;
  readonly expandNode: (node: TreeViewNode) => string;
  readonly region: string;
};

/** Props for controlled or uncontrolled native tree state. */
export type TreeViewProps = Omit<ViewProps, "children" | "ref"> & {
  readonly defaultExpandedIds?: readonly string[];
  readonly defaultSelectedIds?: readonly string[];
  readonly expandedIds?: readonly string[];
  readonly labels: TreeViewLabels;
  readonly nodes: readonly TreeViewNode[];
  readonly onExpandedIdsChange?: (ids: readonly string[]) => void;
  readonly onSelectedIdsChange?: (ids: readonly string[]) => void;
  readonly ref?: Ref<View>;
  readonly selectedIds?: readonly string[];
  readonly selectionMode?: "multiple" | "single";
};

type TreeRowsProps = {
  readonly depth: number;
  readonly expandedIds: readonly string[];
  readonly labels: TreeViewLabels;
  readonly nodes: readonly TreeViewNode[];
  readonly onExpand: (id: string) => void;
  readonly onSelect: (node: TreeViewNode) => void;
  readonly selectedIds: readonly string[];
};

const styles = StyleSheet.create({
  branch: { width: "100%" },
  disclosure: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44,
  },
  label: { flex: 1 },
  row: { alignItems: "center", flexDirection: "row", minHeight: 44 },
  selection: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minHeight: 44,
  },
});

function toggledIds(ids: readonly string[], id: string): readonly string[] {
  return ids.includes(id)
    ? ids.filter((candidate) => candidate !== id)
    : [...ids, id];
}

function TreeRow({
  depth,
  expandedIds,
  labels,
  node,
  onExpand,
  onSelect,
  selectedIds,
}: Omit<TreeRowsProps, "nodes"> & { readonly node: TreeViewNode }) {
  const theme = useTheme();
  const expanded = expandedIds.includes(node.id);
  const selected = selectedIds.includes(node.id);
  const branch = (node.nodes?.length ?? 0) > 0;
  return (
    <View style={styles.branch}>
      <View
        style={[
          styles.row,
          {
            backgroundColor: selected
              ? theme.colors.accent
              : theme.colors.background,
            borderRadius: theme.radius.md,
            paddingLeft: depth * theme.spacing[4],
          },
        ]}
      >
        {branch ? (
          <Pressable
            accessibilityLabel={
              expanded ? labels.collapseNode(node) : labels.expandNode(node)
            }
            accessibilityRole="button"
            accessibilityState={{ disabled: node.disabled, expanded }}
            disabled={node.disabled}
            onPress={() => {
              onExpand(node.id);
            }}
            style={({ pressed }) => [
              styles.disclosure,
              { opacity: node.disabled ? 0.5 : pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={{ color: theme.colors.foreground }}>
              {expanded ? "−" : "+"}
            </Text>
          </Pressable>
        ) : (
          <View style={styles.disclosure} />
        )}
        <Pressable
          accessibilityLabel={node.label}
          accessibilityRole="button"
          accessibilityState={{ disabled: node.disabled, selected }}
          disabled={node.disabled}
          onPress={() => {
            onSelect(node);
          }}
          style={({ pressed }) => [
            styles.selection,
            {
              gap: theme.spacing[2],
              opacity: node.disabled ? 0.5 : pressed ? 0.8 : 1,
              paddingRight: theme.spacing[3],
            },
          ]}
        >
          {node.icon}
          <Text
            numberOfLines={1}
            style={[
              styles.label,
              theme.typography.scale.bodySmall,
              {
                color: selected
                  ? theme.colors.accentForeground
                  : theme.colors.foreground,
              },
            ]}
          >
            {node.label}
          </Text>
        </Pressable>
      </View>
      {branch && expanded ? (
        <TreeRows
          depth={depth + 1}
          expandedIds={expandedIds}
          labels={labels}
          nodes={node.nodes ?? []}
          onExpand={onExpand}
          onSelect={onSelect}
          selectedIds={selectedIds}
        />
      ) : null}
    </View>
  );
}
TreeRow.displayName = "TreeRow";

function TreeRows(props: TreeRowsProps) {
  return props.nodes.map((node) => (
    <TreeRow key={node.id} node={node} {...props} />
  ));
}
TreeRows.displayName = "TreeRows";

/**
 * Nested native list with separate 44-point disclosure and selection actions.
 * It does not claim the browser tree keyboard pattern on touch platforms.
 */
function TreeView({
  defaultExpandedIds = [],
  defaultSelectedIds = [],
  expandedIds,
  labels,
  nodes,
  onExpandedIdsChange,
  onSelectedIdsChange,
  ref,
  selectedIds,
  selectionMode = "single",
  style,
  ...props
}: TreeViewProps) {
  const theme = useTheme();
  const [expanded, setExpanded] = useControllableState(
    expandedIds === undefined
      ? {
          defaultValue: defaultExpandedIds,
          mode: "uncontrolled",
          onChange: onExpandedIdsChange,
        }
      : {
          mode: "controlled",
          onChange: onExpandedIdsChange,
          value: expandedIds,
        },
  );
  const [selected, setSelected] = useControllableState(
    selectedIds === undefined
      ? {
          defaultValue: defaultSelectedIds,
          mode: "uncontrolled",
          onChange: onSelectedIdsChange,
        }
      : {
          mode: "controlled",
          onChange: onSelectedIdsChange,
          value: selectedIds,
        },
  );
  const onExpand = useCallback(
    (id: string) => {
      setExpanded(toggledIds(expanded, id));
    },
    [expanded, setExpanded],
  );
  const onSelect = useCallback(
    (node: TreeViewNode) => {
      if (selectionMode === "single") {
        setSelected([node.id]);
        return;
      }
      const next = toggleMultipleSelected(
        new Set(selected),
        node,
        (candidate) => candidate.id,
      );
      setSelected([...next]);
    },
    [selected, selectionMode, setSelected],
  );
  const rows = useMemo(
    () => (
      <TreeRows
        depth={0}
        expandedIds={expanded}
        labels={labels}
        nodes={nodes}
        onExpand={onExpand}
        onSelect={onSelect}
        selectedIds={selected}
      />
    ),
    [expanded, labels, nodes, onExpand, onSelect, selected],
  );

  return (
    <View
      {...props}
      accessibilityLabel={labels.region}
      accessibilityRole="list"
      ref={ref}
      style={[
        {
          backgroundColor: theme.colors.background,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          borderWidth: 1,
          padding: theme.spacing[1],
        },
        style,
      ]}
    >
      {rows}
    </View>
  );
}
TreeView.displayName = "TreeView";

export { TreeView };
