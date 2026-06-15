/**
 * MCP server at ui.vllnt.ai/mcp — Model Context Protocol endpoint.
 *
 * Speaks JSON-RPC 2.0 over POST. Implements the minimum protocol surface
 * an MCP client needs to discover and use VLLNT UI tools:
 *
 *   - initialize      → server capabilities + protocol version
 *   - tools/list      → describe each tool
 *   - tools/call      → invoke a tool by name
 *
 * Tools (UI registry only — see #246 scope decision):
 *   - search_components({ query, category?, limit? })
 *   - get_component({ name })
 *   - list_categories()
 *
 * Out of scope for this PR (tracked separately):
 *   - SSE streaming responses (Streamable HTTP transport — text/event-stream)
 *   - resources/* methods
 *   - prompts/* methods
 *   - sampling/createMessage
 *   - Edge rate limiting
 *   - The npm `@vllnt/mcp` stdio bridge for Claude Desktop users
 *
 * The endpoint reads the canonical registry.json shipped with the app — same
 * source of truth as /r/registry.json. No DB, no auth, no writes.
 */

import { NextResponse } from "next/server";

import { getRegistry } from "../../lib/registry";

import type { RegistryComponent } from "@/types/registry";
import { SITE_URL } from "@/lib/seo";

const REGISTRY = getRegistry();
const PROTOCOL_VERSION = "2025-06-18";

type JsonRpcRequest = {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: unknown;
};

type JsonRpcSuccess = {
  jsonrpc: "2.0";
  id: string | number | null;
  result: unknown;
};

type JsonRpcError = {
  jsonrpc: "2.0";
  id: string | number | null;
  error: { code: number; message: string; data?: unknown };
};

const ok = (
  id: string | number | null | undefined,
  result: unknown,
): JsonRpcSuccess => ({
  jsonrpc: "2.0",
  id: id ?? null,
  result,
});

const err = (
  id: string | number | null | undefined,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcError => ({
  jsonrpc: "2.0",
  id: id ?? null,
  error: data === undefined ? { code, message } : { code, message, data },
});

const TOOLS = [
  {
    name: "search_components",
    description:
      "Search VLLNT UI components by name / title / description. Filter by category.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Free-text query matched against name, title, description (case-insensitive).",
        },
        category: {
          type: "string",
          description:
            "Optional filter — one of: ai, billing, content, core, data, data-display, educational, form, learning, navigation, overlay, utility.",
        },
        limit: {
          type: "number",
          description: "Maximum results (default 25, capped at 100).",
        },
      },
    },
  },
  {
    name: "get_component",
    description:
      "Get the full registry descriptor for one component (name, title, description, deps, version, stability, a11y, examples, props).",
    inputSchema: {
      type: "object",
      required: ["name"],
      properties: {
        name: {
          type: "string",
          description: "Component slug (e.g. 'button', 'data-table').",
        },
      },
    },
  },
  {
    name: "list_categories",
    description:
      "List the 12 component categories with item counts.",
    inputSchema: { type: "object", properties: {} },
  },
] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function searchComponents(
  args: Record<string, unknown>,
): { items: RegistryComponent[]; total: number } {
  const query = typeof args.query === "string" ? args.query.toLowerCase() : "";
  const category =
    typeof args.category === "string" ? args.category.toLowerCase() : null;
  const requested =
    typeof args.limit === "number" && args.limit > 0 ? args.limit : 25;
  const limit = Math.min(requested, 100);

  const items = REGISTRY.items.filter((item) => {
    if (category && (item.category ?? "").toLowerCase() !== category) {
      return false;
    }
    if (!query) return true;
    const haystack = [
      item.name,
      item.title,
      item.description ?? "",
      item.category ?? "",
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });

  return { items: items.slice(0, limit), total: items.length };
}

function getComponent(args: Record<string, unknown>): RegistryComponent | null {
  const name = typeof args.name === "string" ? args.name : null;
  if (!name) return null;
  return REGISTRY.items.find((item) => item.name === name) ?? null;
}

function listCategories(): { category: string; count: number; pageUrl: string }[] {
  const counts = new Map<string, number>();
  for (const item of REGISTRY.items) {
    const category = item.category ?? "uncategorized";
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([category, count]) => ({
      category,
      count,
      pageUrl: `${SITE_URL}/components?category=${encodeURIComponent(category)}`,
    }))
    .sort((a, b) => a.category.localeCompare(b.category));
}

function callTool(
  name: string,
  args: Record<string, unknown>,
): { content: { type: "text"; text: string }[]; isError?: boolean } {
  switch (name) {
    case "search_components": {
      const { items, total } = searchComponents(args);
      const lines = [
        `Found ${total} component(s) matching the query. Showing ${items.length}.`,
        "",
        ...items.map(
          (item) =>
            `- ${item.name} (${item.category ?? "uncategorized"}): ${item.title}${
              item.description ? ` — ${item.description}` : ""
            }`,
        ),
      ].filter(Boolean);
      return {
        content: [{ type: "text", text: lines.join("\n") }],
      };
    }
    case "get_component": {
      const item = getComponent(args);
      if (!item) {
        return {
          content: [
            {
              type: "text",
              text: `Component not found. Try search_components first.`,
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
      };
    }
    case "list_categories": {
      const rows = listCategories();
      const lines = [
        `${REGISTRY.items.length} components across ${rows.length} categories. Library version ${REGISTRY.version ?? "unknown"} (generated ${REGISTRY.generatedAt ?? "?"}).`,
        "",
        ...rows.map((row) => `- ${row.category}: ${row.count}`),
      ];
      return { content: [{ type: "text", text: lines.join("\n") }] };
    }
    default:
      return {
        content: [{ type: "text", text: `Unknown tool: ${name}` }],
        isError: true,
      };
  }
}

function dispatch(req: JsonRpcRequest): JsonRpcSuccess | JsonRpcError {
  if (req.jsonrpc !== "2.0" || typeof req.method !== "string") {
    return err(req.id ?? null, -32600, "Invalid Request");
  }

  switch (req.method) {
    case "initialize":
      return ok(req.id, {
        protocolVersion: PROTOCOL_VERSION,
        serverInfo: {
          name: "vllnt-ui",
          version: REGISTRY.version ?? "0.0.0",
        },
        capabilities: {
          tools: { listChanged: false },
        },
        instructions:
          "VLLNT UI registry MCP server. Use search_components / get_component / list_categories to discover and read 225 React components. Source of truth: " +
          SITE_URL +
          "/r/registry.json",
      });

    case "notifications/initialized":
      return ok(req.id, {});

    case "tools/list":
      return ok(req.id, { tools: TOOLS });

    case "tools/call": {
      if (!isObject(req.params)) {
        return err(req.id, -32602, "Invalid params");
      }
      const name = req.params.name;
      const rawArgs = req.params.arguments;
      if (typeof name !== "string") {
        return err(req.id, -32602, "Missing tool name");
      }
      const args = isObject(rawArgs) ? rawArgs : {};
      try {
        const result = callTool(name, args);
        return ok(req.id, result);
      } catch (error) {
        return err(
          req.id,
          -32603,
          "Tool execution failed",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    case "ping":
      return ok(req.id, {});

    default:
      return err(req.id ?? null, -32601, `Method not found: ${req.method}`);
  }
}

const SERVER_INFO = {
  name: "vllnt-ui",
  version: REGISTRY.version ?? "0.0.0",
  description:
    "MCP server for the VLLNT UI component registry. Tools: search_components, get_component, list_categories.",
  endpoint: `${SITE_URL}/mcp`,
  protocol: PROTOCOL_VERSION,
  capabilities: { tools: { listChanged: false } },
  registry: {
    version: REGISTRY.version ?? "0.0.0",
    generatedAt: REGISTRY.generatedAt ?? null,
    itemCount: REGISTRY.items.length,
  },
  tools: TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
  })),
};

export const dynamic = "force-static";

export function GET(): NextResponse {
  return NextResponse.json(SERVER_INFO);
}

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }

  if (Array.isArray(body)) {
    const responses = body
      .filter((entry): entry is JsonRpcRequest => isObject(entry))
      .map((entry) => dispatch(entry as JsonRpcRequest));
    return NextResponse.json(responses);
  }

  if (!isObject(body)) {
    return NextResponse.json(err(null, -32600, "Invalid Request"), {
      status: 400,
    });
  }

  return NextResponse.json(dispatch(body as JsonRpcRequest));
}
