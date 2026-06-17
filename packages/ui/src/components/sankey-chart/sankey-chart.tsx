import * as React from "react";

import { cn } from "../../lib/utils";

/**
 * A node in a {@link SankeyChart} flow diagram.
 *
 * @public
 */
export type SankeyNode = {
  /** Unique identifier referenced by links. */
  id: string;
  /** Label drawn beside the node. */
  label: string;
};

/**
 * A weighted connection between two {@link SankeyNode}s.
 *
 * @public
 */
export type SankeyLink = {
  /** Source node id. */
  source: string;
  /** Target node id. */
  target: string;
  /** Positive flow weight; sets the ribbon thickness. */
  value: number;
};

/**
 * Props for {@link SankeyChart}.
 *
 * @public
 */
export type SankeyChartProps = {
  /** Flow color. Defaults to `currentColor` to follow the text token. */
  color?: string;
  /** Viewport height in pixels. @defaultValue 280 */
  height?: number;
  /** Weighted edges between nodes. The chart drops links to unknown nodes. */
  links: SankeyLink[];
  /** Vertical gap between stacked nodes, in pixels. @defaultValue 12 */
  nodePadding?: number;
  /** Flow nodes. */
  nodes: SankeyNode[];
  /** Node rectangle width in pixels. @defaultValue 14 */
  nodeWidth?: number;
  /** Viewport width in pixels. @defaultValue 480 */
  width?: number;
} & React.HTMLAttributes<HTMLDivElement>;

const DEFAULT_WIDTH = 480;
const DEFAULT_HEIGHT = 280;
const DEFAULT_NODE_WIDTH = 14;
const DEFAULT_NODE_PADDING = 12;
const LABEL_GAP = 6;

type Point = { x: number; y: number };
type LaidNode = {
  height: number;
  id: string;
  label: string;
  value: number;
  x: number;
  y: number;
};
type LaidLink = {
  path: string;
  source: string;
  target: string;
  thickness: number;
  value: number;
};
type Dimensions = {
  height: number;
  nodePadding: number;
  nodeWidth: number;
  width: number;
};
type Layout = { links: LaidLink[]; nodes: LaidNode[] };

function computeDepths(
  ids: string[],
  links: SankeyLink[],
): Map<string, number> {
  const incoming = links.reduce<Map<string, string[]>>((map, link) => {
    const sources = map.get(link.target) ?? [];
    sources.push(link.source);
    map.set(link.target, sources);
    return map;
  }, new Map());

  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const resolve = (id: string): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const sources = incoming.get(id) ?? [];
    const value =
      sources.length === 0
        ? 0
        : Math.max(...sources.map((source) => resolve(source) + 1));
    visiting.delete(id);
    depth.set(id, value);
    return value;
  };

  return new Map(ids.map((id) => [id, resolve(id)]));
}

function nodeValues(ids: string[], links: SankeyLink[]): Map<string, number> {
  const sum = (key: "source" | "target") =>
    links.reduce<Map<string, number>>((map, link) => {
      map.set(link[key], (map.get(link[key]) ?? 0) + link.value);
      return map;
    }, new Map());
  const outgoing = sum("source");
  const incoming = sum("target");
  return new Map(
    ids.map((id) => [
      id,
      Math.max(incoming.get(id) ?? 0, outgoing.get(id) ?? 0, 1),
    ]),
  );
}

function groupByDepth(
  ids: string[],
  depth: Map<string, number>,
): Map<number, string[]> {
  return ids.reduce<Map<number, string[]>>((map, id) => {
    const column = depth.get(id) ?? 0;
    const bucket = map.get(column) ?? [];
    bucket.push(id);
    map.set(column, bucket);
    return map;
  }, new Map());
}

function computeScale(
  columns: Map<number, string[]>,
  values: Map<string, number>,
  dims: Dimensions,
): number {
  const scales = [...columns.values()].map((bucket) => {
    const total = bucket.reduce((sum, id) => sum + (values.get(id) ?? 0), 0);
    const available = dims.height - (bucket.length - 1) * dims.nodePadding;
    return total > 0 && available > 0
      ? available / total
      : Number.POSITIVE_INFINITY;
  });
  const scale = Math.min(...scales);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

type PlacementOptions = {
  dims: Dimensions;
  maxDepth: number;
  scale: number;
  values: Map<string, number>;
};

function positionNodes(
  nodes: SankeyNode[],
  columns: Map<number, string[]>,
  options: PlacementOptions,
): Map<string, LaidNode> {
  const { dims, maxDepth, scale, values } = options;
  const xStep = maxDepth > 0 ? (dims.width - dims.nodeWidth) / maxDepth : 0;
  const labelOf = (id: string) =>
    nodes.find((node) => node.id === id)?.label ?? id;

  const perColumn = [...columns.entries()].map(([column, bucket]) => {
    const used =
      bucket.reduce((sum, id) => sum + (values.get(id) ?? 0) * scale, 0) +
      (bucket.length - 1) * dims.nodePadding;
    const startY = Math.max(0, (dims.height - used) / 2);
    return bucket.reduce<{ cursor: number; out: [string, LaidNode][] }>(
      (accumulator, id) => {
        const value = values.get(id) ?? 0;
        const height = Math.max(value * scale, 1);
        accumulator.out.push([
          id,
          {
            height,
            id,
            label: labelOf(id),
            value,
            x: column * xStep,
            y: accumulator.cursor,
          },
        ]);
        accumulator.cursor += height + dims.nodePadding;
        return accumulator;
      },
      { cursor: startY, out: [] },
    ).out;
  });

  return new Map(perColumn.flat());
}

function orderLinks(
  links: SankeyLink[],
  laid: Map<string, LaidNode>,
): SankeyLink[] {
  const sorted = [...links].sort(
    (a, b) => (laid.get(a.target)?.y ?? 0) - (laid.get(b.target)?.y ?? 0),
  );
  const bySource = sorted.reduce<Map<string, SankeyLink[]>>((map, link) => {
    const bucket = map.get(link.source) ?? [];
    bucket.push(link);
    map.set(link.source, bucket);
    return map;
  }, new Map());
  return [...bySource.values()].flat();
}

function ribbon(from: Point, to: Point): string {
  const xc = (from.x + to.x) / 2;
  return `M ${from.x.toFixed(2)} ${from.y.toFixed(2)} C ${xc.toFixed(2)} ${from.y.toFixed(2)} ${xc.toFixed(2)} ${to.y.toFixed(2)} ${to.x.toFixed(2)} ${to.y.toFixed(2)}`;
}

type LinkOptions = {
  dims: Dimensions;
  laid: Map<string, LaidNode>;
  orderedLinks: SankeyLink[];
  scale: number;
};

function computeLinks(options: LinkOptions): LaidLink[] {
  const { dims, laid, orderedLinks, scale } = options;
  const sourceOffset = new Map<string, number>();
  const targetOffset = new Map<string, number>();

  return orderedLinks.reduce<LaidLink[]>((accumulator, link) => {
    const source = laid.get(link.source);
    const target = laid.get(link.target);
    if (!source || !target) return accumulator;

    const thickness = Math.max(link.value * scale, 1);
    const sOffset = sourceOffset.get(link.source) ?? 0;
    const tOffset = targetOffset.get(link.target) ?? 0;
    sourceOffset.set(link.source, sOffset + thickness);
    targetOffset.set(link.target, tOffset + thickness);

    const from = {
      x: source.x + dims.nodeWidth,
      y: source.y + sOffset + thickness / 2,
    };
    const to = { x: target.x, y: target.y + tOffset + thickness / 2 };
    accumulator.push({
      path: ribbon(from, to),
      source: link.source,
      target: link.target,
      thickness,
      value: link.value,
    });
    return accumulator;
  }, []);
}

function computeLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  dims: Dimensions,
): Layout {
  const ids = nodes.map((node) => node.id);
  const known = new Set(ids);
  const validLinks = links.filter(
    (link) =>
      link.value > 0 && known.has(link.source) && known.has(link.target),
  );
  const depth = computeDepths(ids, validLinks);
  const values = nodeValues(ids, validLinks);
  const maxDepth = Math.max(0, ...ids.map((id) => depth.get(id) ?? 0));
  const columns = groupByDepth(ids, depth);
  const scale = computeScale(columns, values, dims);
  const laid = positionNodes(nodes, columns, { dims, maxDepth, scale, values });
  const orderedLinks = orderLinks(validLinks, laid);
  const computedLinks = computeLinks({ dims, laid, orderedLinks, scale });
  return { links: computedLinks, nodes: [...laid.values()] };
}

function SankeyLinks({ color, links }: { color: string; links: LaidLink[] }) {
  return (
    <g fill="none" stroke={color} strokeOpacity={0.25}>
      {links.map((link, index) => (
        <path
          d={link.path}
          key={`${link.source}-${link.target}-${index}`}
          strokeWidth={link.thickness}
        >
          <title>{`${link.source} → ${link.target}: ${link.value.toLocaleString()}`}</title>
        </path>
      ))}
    </g>
  );
}

function SankeyNodes({
  color,
  nodes,
  nodeWidth,
  width,
}: {
  color: string;
  nodes: LaidNode[];
  nodeWidth: number;
  width: number;
}) {
  return (
    <>
      {nodes.map((node) => {
        const isLast = node.x + nodeWidth >= width - 1;
        return (
          <g key={node.id}>
            <rect
              fill={color}
              height={node.height}
              rx={2}
              width={nodeWidth}
              x={node.x}
              y={node.y}
            >
              <title>{`${node.label}: ${node.value.toLocaleString()}`}</title>
            </rect>
            <text
              className="fill-foreground text-[10px]"
              dominantBaseline="middle"
              textAnchor={isLast ? "end" : "start"}
              x={isLast ? node.x - LABEL_GAP : node.x + nodeWidth + LABEL_GAP}
              y={node.y + node.height / 2}
            >
              {node.label}
            </text>
          </g>
        );
      })}
    </>
  );
}

/**
 * Token-styled SVG Sankey flow diagram.
 *
 * Pure SVG, no chart dependency. The chart builds a layered layout: node depth
 * from the longest incoming path, heights scaled to flow weight, and links as
 * bezier ribbons. Node fills and ribbons use `currentColor`, so the diagram
 * follows the active theme. Returns `null` without nodes.
 *
 * @example
 * ```tsx
 * <SankeyChart
 *   className="text-primary"
 *   nodes={[
 *     { id: "a", label: "Visits" },
 *     { id: "b", label: "Signup" },
 *     { id: "c", label: "Paid" },
 *   ]}
 *   links={[
 *     { source: "a", target: "b", value: 60 },
 *     { source: "b", target: "c", value: 25 },
 *   ]}
 * />
 * ```
 *
 * @public
 */
export const SankeyChart = ({
  className,
  color = "currentColor",
  height = DEFAULT_HEIGHT,
  links,
  nodePadding = DEFAULT_NODE_PADDING,
  nodes,
  nodeWidth = DEFAULT_NODE_WIDTH,
  ref,
  width = DEFAULT_WIDTH,
  ...props
}: SankeyChartProps & { ref?: React.Ref<HTMLDivElement> }) => {
  if (nodes.length === 0) return null;

  const layout = computeLayout(nodes, links, {
    height,
    nodePadding,
    nodeWidth,
    width,
  });

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-background/40 p-3",
        className,
      )}
      ref={ref}
      {...props}
    >
      <svg
        aria-label="Sankey chart"
        className="h-full w-full"
        height={height}
        role="img"
        viewBox={`0 0 ${width} ${height}`}
        width={width}
      >
        <SankeyLinks color={color} links={layout.links} />
        <SankeyNodes
          color={color}
          nodes={layout.nodes}
          nodeWidth={nodeWidth}
          width={width}
        />
      </svg>
    </div>
  );
};

SankeyChart.displayName = "SankeyChart";
