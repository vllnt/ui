"use client";

import {
  type ComponentPropsWithoutRef,
  forwardRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";

import { cn } from "../../lib/utils";

/**
 * Selection mode for {@link TreeView}.
 *
 * @public
 */
export type TreeViewSelectionMode = "multiple" | "single";

/**
 * A node in the tree.
 *
 * @public
 */
export type TreeNode = {
  /** When `true`, the node renders dimmed and ignores clicks. */
  disabled?: boolean;
  /** Optional leading icon. */
  icon?: ReactNode;
  /** Stable identifier. */
  id: string;
  /** Visible label. */
  label: ReactNode;
  /** Child nodes; the node renders as a branch when present. */
  nodes?: TreeNode[];
};

/**
 * Localizable strings.
 *
 * @public
 */
export type TreeViewLabels = {
  /** Aria-label for the tree. Defaults to `"Tree"`. */
  region?: string;
};

const DEFAULT_LABELS = {
  region: "Tree",
} as const satisfies Required<TreeViewLabels>;

/**
 * Props for {@link TreeView}.
 *
 * @public
 */
export type TreeViewProps = {
  /** Default expanded ids (uncontrolled). */
  defaultExpanded?: string[];
  /** Default selected ids (uncontrolled). */
  defaultSelected?: string[];
  /** Controlled expanded ids. */
  expanded?: string[];
  /** Localizable strings. */
  labels?: TreeViewLabels;
  /** Tree data. */
  nodes: TreeNode[];
  /** Fires when expanded ids change. */
  onExpandedChange?: (next: string[]) => void;
  /** Fires when selection changes. */
  onSelect?: (next: string[]) => void;
  /** Controlled selected ids. */
  selected?: string[];
  /** Selection mode. Defaults to `"single"`. */
  selectionMode?: TreeViewSelectionMode;
} & Omit<ComponentPropsWithoutRef<"ul">, "onSelect">;

type FlatNode = {
  depth: number;
  hasChildren: boolean;
  node: TreeNode;
  parentId?: string;
};

type FlattenArguments = {
  depth?: number;
  expanded: ReadonlySet<string>;
  nodes: TreeNode[];
  parentId?: string;
};

function flattenVisible(arguments_: FlattenArguments): FlatNode[] {
  const { depth = 0, expanded, nodes, parentId } = arguments_;
  return nodes.flatMap((node) => {
    const hasChildren = (node.nodes?.length ?? 0) > 0;
    const head: FlatNode = { depth, hasChildren, node, parentId };
    if (!hasChildren || !expanded.has(node.id)) return [head];
    return [
      head,
      ...flattenVisible({
        depth: depth + 1,
        expanded,
        nodes: node.nodes ?? [],
        parentId: node.id,
      }),
    ];
  });
}

function useControlled<T>(
  controlled: T | undefined,
  defaultValue: T,
): readonly [T, (next: T) => void, boolean] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const isControlled = controlled !== undefined;
  const value = isControlled ? controlled : internal;
  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
    },
    [isControlled],
  );
  return [value, setValue, isControlled];
}

function toggleSet(set: ReadonlySet<string>, id: string): string[] {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return [...next];
}

type TreeRowProps = {
  active: boolean;
  expanded: boolean;
  flat: FlatNode;
  onActivate: (id: string) => void;
  onExpand: (id: string) => void;
  onSelect: (id: string) => void;
  selected: boolean;
};

function TreeRow({
  active,
  expanded,
  flat,
  onActivate,
  onExpand,
  onSelect,
  selected,
}: TreeRowProps): ReactNode {
  const { depth, hasChildren, node } = flat;
  const activate = (): void => {
    if (node.disabled) return;
    onActivate(node.id);
    if (hasChildren) onExpand(node.id);
    else onSelect(node.id);
  };
  const handleKeyDown = (event: ReactKeyboardEvent<HTMLLIElement>): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    activate();
  };
  return (
    <li
      aria-disabled={node.disabled || undefined}
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selected || undefined}
      className={cn(
        "flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-sm focus:outline-none",
        active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60",
        selected ? "ring-1 ring-primary" : "",
        node.disabled ? "cursor-not-allowed opacity-50" : "",
      )}
      data-active={active ? "true" : undefined}
      data-depth={depth}
      data-node-id={node.id}
      data-selected={selected ? "true" : undefined}
      onClick={activate}
      onKeyDown={handleKeyDown}
      role="treeitem"
      style={{ paddingLeft: `${(depth * 16 + 8).toString()}px` }}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex h-4 w-4 shrink-0 items-center justify-center text-xs text-muted-foreground transition-transform",
          hasChildren ? "" : "opacity-0",
          expanded ? "rotate-90" : "",
        )}
      >
        ▸
      </span>
      {node.icon ? (
        <span aria-hidden="true" className="inline-flex h-4 w-4 shrink-0">
          {node.icon}
        </span>
      ) : null}
      <span className="truncate">{node.label}</span>
    </li>
  );
}

function nextActiveId(
  flat: FlatNode[],
  delta: number,
  current?: string,
): string | undefined {
  if (flat.length === 0) return undefined;
  if (!current) return flat[0]?.node.id;
  const index = flat.findIndex((entry) => entry.node.id === current);
  if (index < 0) return flat[0]?.node.id;
  const nextIndex = Math.min(Math.max(index + delta, 0), flat.length - 1);
  return flat[nextIndex]?.node.id;
}

function findFlat(flat: FlatNode[], id?: string): FlatNode | undefined {
  if (!id) return undefined;
  return flat.find((entry) => entry.node.id === id);
}

function useTreeState(arguments_: {
  defaultExpanded?: string[];
  defaultSelected?: string[];
  expanded?: string[];
  onExpandedChange?: (next: string[]) => void;
  onSelect?: (next: string[]) => void;
  selected?: string[];
  selectionMode: TreeViewSelectionMode;
}): {
  applyExpand: (id: string) => void;
  applySelect: (id: string) => void;
  expandedSet: ReadonlySet<string>;
  selectedSet: ReadonlySet<string>;
} {
  const {
    defaultExpanded = [],
    defaultSelected = [],
    expanded,
    onExpandedChange,
    onSelect,
    selected,
    selectionMode,
  } = arguments_;
  const [expandedState, setExpandedState] = useControlled<string[]>(
    expanded,
    defaultExpanded,
  );
  const [selectedState, setSelectedState] = useControlled<string[]>(
    selected,
    defaultSelected,
  );
  const expandedSet = useMemo(() => new Set(expandedState), [expandedState]);
  const selectedSet = useMemo(() => new Set(selectedState), [selectedState]);

  const applyExpand = useCallback(
    (id: string) => {
      const next = toggleSet(expandedSet, id);
      setExpandedState(next);
      onExpandedChange?.(next);
    },
    [expandedSet, onExpandedChange, setExpandedState],
  );

  const applySelect = useCallback(
    (id: string) => {
      const next =
        selectionMode === "single" ? [id] : toggleSet(selectedSet, id);
      setSelectedState(next);
      onSelect?.(next);
    },
    [onSelect, selectedSet, selectionMode, setSelectedState],
  );

  return { applyExpand, applySelect, expandedSet, selectedSet };
}

function useKeyboardHandler(arguments_: {
  activeId?: string;
  applyExpand: (id: string) => void;
  applySelect: (id: string) => void;
  expandedSet: ReadonlySet<string>;
  flat: FlatNode[];
  setActiveId: (id?: string) => void;
}): (event: ReactKeyboardEvent<HTMLUListElement>) => void {
  const { activeId, applyExpand, applySelect, expandedSet, flat, setActiveId } =
    arguments_;
  return useCallback(
    (event) => {
      const current = findFlat(flat, activeId);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveId(nextActiveId(flat, 1, activeId));
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveId(nextActiveId(flat, -1, activeId));
        return;
      }
      if (event.key === "ArrowRight" && current?.hasChildren) {
        event.preventDefault();
        if (!expandedSet.has(current.node.id)) applyExpand(current.node.id);
        return;
      }
      if (event.key === "ArrowLeft" && current) {
        event.preventDefault();
        if (current.hasChildren && expandedSet.has(current.node.id)) {
          applyExpand(current.node.id);
        } else if (current.parentId) {
          setActiveId(current.parentId);
        }
        return;
      }
      if (event.key === "Enter" || event.key === " ") {
        if (!current || current.node.disabled) return;
        event.preventDefault();
        if (current.hasChildren) applyExpand(current.node.id);
        else applySelect(current.node.id);
      }
    },
    [activeId, applyExpand, applySelect, expandedSet, flat, setActiveId],
  );
}

type TreeRowsProps = {
  activeId?: string;
  applyExpand: (id: string) => void;
  applySelect: (id: string) => void;
  expandedSet: ReadonlySet<string>;
  flat: FlatNode[];
  selectedSet: ReadonlySet<string>;
  setActiveId: (id?: string) => void;
};

function TreeRows({
  activeId,
  applyExpand,
  applySelect,
  expandedSet,
  flat,
  selectedSet,
  setActiveId,
}: TreeRowsProps): ReactNode {
  return (
    <>
      {flat.map((entry) => (
        <TreeRow
          active={entry.node.id === activeId}
          expanded={expandedSet.has(entry.node.id)}
          flat={entry}
          key={entry.node.id}
          onActivate={setActiveId}
          onExpand={applyExpand}
          onSelect={applySelect}
          selected={selectedSet.has(entry.node.id)}
        />
      ))}
    </>
  );
}

/**
 * Hierarchical tree component for nested data (file systems, categories,
 * org charts). Pass {@link TreeNode} data via `nodes`. Supports controlled
 * and uncontrolled expand/select state, single or multi-select, and full
 * keyboard navigation (arrows expand/collapse and traverse, enter/space
 * activates).
 *
 * @example
 * ```tsx
 * <TreeView
 *   nodes={[
 *     { id: "src", label: "src/", nodes: [
 *       { id: "components", label: "components/" },
 *       { id: "utils", label: "utils/" },
 *     ]},
 *   ]}
 *   defaultExpanded={["src"]}
 *   onSelect={(ids) => console.info(ids)}
 * />
 * ```
 *
 * @public
 */
export const TreeView = forwardRef<HTMLUListElement, TreeViewProps>(
  (props, ref) => {
    const {
      className,
      defaultExpanded,
      defaultSelected,
      expanded,
      labels,
      nodes,
      onExpandedChange,
      onSelect,
      selected,
      selectionMode = "single",
      ...rest
    } = props;
    const resolvedLabels = useMemo(
      () => ({ ...DEFAULT_LABELS, ...labels }),
      [labels],
    );

    const { applyExpand, applySelect, expandedSet, selectedSet } = useTreeState(
      {
        defaultExpanded,
        defaultSelected,
        expanded,
        onExpandedChange,
        onSelect,
        selected,
        selectionMode,
      },
    );

    const flat = useMemo(
      () => flattenVisible({ expanded: expandedSet, nodes }),
      [expandedSet, nodes],
    );

    const [activeId, setActiveId] = useState<string | undefined>(
      () => flat[0]?.node.id,
    );

    const handleKeyDown = useKeyboardHandler({
      activeId,
      applyExpand,
      applySelect,
      expandedSet,
      flat,
      setActiveId,
    });

    return (
      <ul
        aria-label={resolvedLabels.region}
        aria-multiselectable={selectionMode === "multiple" || undefined}
        className={cn(
          "flex flex-col gap-0.5 rounded-2xl border bg-background p-2 text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
        onKeyDown={handleKeyDown}
        ref={ref}
        role="tree"
        tabIndex={0}
        {...rest}
      >
        <TreeRows
          activeId={activeId}
          applyExpand={applyExpand}
          applySelect={applySelect}
          expandedSet={expandedSet}
          flat={flat}
          selectedSet={selectedSet}
          setActiveId={setActiveId}
        />
      </ul>
    );
  },
);
TreeView.displayName = "TreeView";
