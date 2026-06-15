/**
 * MCP server at ui.vllnt.ai/mcp — Model Context Protocol endpoint.
 *
 * Speaks JSON-RPC 2.0 over POST. Implements the smallest protocol surface
 * an MCP client needs to discover and use VLLNT UI tools:
 *
 *   - initialize      → server capabilities + protocol version
 *   - tools/list      → describe each tool
 *   - tools/call      → invoke a tool by name
 *
 * Tools (UI registry scope — see #246 scope decision):
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

import { SITE_URL } from "@/lib/seo";
import type { RegistryComponent } from "@/types/registry";

import { getRegistry } from "../../lib/registry";

const REGISTRY = getRegistry();
const PROTOCOL_VERSION = "2025-06-18";

type JsonRpcRequest = {
  id?: null | number | string;
  jsonrpc: "2.0";
  method: string;
  params?: unknown;
};

type JsonRpcSuccess = {
  id: null | number | string;
  jsonrpc: "2.0";
  result: unknown;
};

type JsonRpcError = {
  error: { code: number; data?: unknown; message: string };
  id: null | number | string;
  jsonrpc: "2.0";
};

const ok = (
  id: null | number | string | undefined,
  result: unknown,
): JsonRpcSuccess => ({
  id: id ?? null,
  jsonrpc: "2.0",
  result,
});

const error_ = (
  id: null | number | string | undefined,
  code: number,
  message: string,
  data?: unknown,
): JsonRpcError => ({
  error: data === undefined ? { code, message } : { code, data, message },
  id: id ?? null,
  jsonrpc: "2.0",
});

const TOOLS = [
  {
    description:
      "Search VLLNT UI components by name / title / description. Filter by category.",
    inputSchema: {
      properties: {
        category: {
          description:
            "Optional filter — one of: ai, billing, content, core, data, data-display, educational, form, learning, navigation, overlay, utility.",
          type: "string",
        },
        limit: {
          description: "Maximum results (default 25, capped at 100).",
          type: "number",
        },
        query: {
          description:
            "Free-text query matched against name, title, description (case-insensitive).",
          type: "string",
        },
      },
      type: "object",
    },
    name: "search_components",
  },
  {
    description:
      "Get the full registry descriptor for one component (name, title, description, deps, version, stability, a11y, examples, props).",
    inputSchema: {
      properties: {
        name: {
          description: "Component slug (e.g. 'button', 'data-table').",
          type: "string",
        },
      },
      required: ["name"],
      type: "object",
    },
    name: "get_component",
  },
  {
    description: "List the 12 component categories with item counts.",
    inputSchema: { properties: {}, type: "object" },
    name: "list_categories",
  },
] as const;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

function searchComponents(arguments_: Record<string, unknown>): {
  items: RegistryComponent[];
  total: number;
} {
  const query =
    typeof arguments_.query === "string" ? arguments_.query.toLowerCase() : "";
  const category =
    typeof arguments_.category === "string"
      ? arguments_.category.toLowerCase()
      : null;
  const requested =
    typeof arguments_.limit === "number" && arguments_.limit > 0
      ? arguments_.limit
      : 25;
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

function getComponent(
  arguments_: Record<string, unknown>,
): null | RegistryComponent {
  const name = typeof arguments_.name === "string" ? arguments_.name : null;
  if (!name) return null;
  return REGISTRY.items.find((item) => item.name === name) ?? null;
}

function listCategories(): {
  category: string;
  count: number;
  pageUrl: string;
}[] {
  const counts = REGISTRY.items.reduce((accumulator, item) => {
    const category = item.category ?? "uncategorized";
    return accumulator.set(category, (accumulator.get(category) ?? 0) + 1);
  }, new Map<string, number>());
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
  arguments_: Record<string, unknown>,
): { content: { text: string; type: "text" }[]; isError?: boolean } {
  switch (name) {
    case "search_components": {
      const { items, total } = searchComponents(arguments_);
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
        content: [{ text: lines.join("\n"), type: "text" }],
      };
    }
    case "get_component": {
      const item = getComponent(arguments_);
      if (!item) {
        return {
          content: [
            {
              text: `Component not found. Try search_components first.`,
              type: "text",
            },
          ],
          isError: true,
        };
      }
      return {
        content: [{ text: JSON.stringify(item, null, 2), type: "text" }],
      };
    }
    case "list_categories": {
      const rows = listCategories();
      const lines = [
        `${REGISTRY.items.length} components across ${rows.length} categories. Library version ${REGISTRY.version ?? "unknown"} (generated ${REGISTRY.generatedAt ?? "?"}).`,
        "",
        ...rows.map((row) => `- ${row.category}: ${row.count}`),
      ];
      return { content: [{ text: lines.join("\n"), type: "text" }] };
    }
    default:
      return {
        content: [{ text: `Unknown tool: ${name}`, type: "text" }],
        isError: true,
      };
  }
}

function dispatch(request: JsonRpcRequest): JsonRpcError | JsonRpcSuccess {
  if (request.jsonrpc !== "2.0" || typeof request.method !== "string") {
    return error_(request.id ?? null, -32_600, "Invalid Request");
  }

  switch (request.method) {
    case "initialize":
      return ok(request.id, {
        capabilities: {
          tools: { listChanged: false },
        },
        instructions:
          "VLLNT UI registry MCP server. Use search_components / get_component / list_categories to discover and read 225 React components. Source of truth: " +
          SITE_URL +
          "/r/registry.json",
        protocolVersion: PROTOCOL_VERSION,
        serverInfo: {
          name: "vllnt-ui",
          version: REGISTRY.version ?? "0.0.0",
        },
      });

    case "notifications/initialized":
      return ok(request.id, {});

    case "tools/list":
      return ok(request.id, { tools: TOOLS });

    case "tools/call": {
      if (!isObject(request.params)) {
        return error_(request.id, -32_602, "Invalid params");
      }
      const name = request.params.name;
      const rawArguments = request.params.arguments;
      if (typeof name !== "string") {
        return error_(request.id, -32_602, "Missing tool name");
      }
      const arguments_ = isObject(rawArguments) ? rawArguments : {};
      try {
        const result = callTool(name, arguments_);
        return ok(request.id, result);
      } catch (error) {
        return error_(
          request.id,
          -32_603,
          "Tool execution failed",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    case "ping":
      return ok(request.id, {});

    default:
      return error_(
        request.id ?? null,
        -32_601,
        `Method not found: ${request.method}`,
      );
  }
}

const SERVER_INFO = {
  capabilities: { tools: { listChanged: false } },
  description:
    "MCP server for the VLLNT UI component registry. Tools: search_components, get_component, list_categories.",
  endpoint: `${SITE_URL}/mcp`,
  name: "vllnt-ui",
  protocol: PROTOCOL_VERSION,
  registry: {
    generatedAt: REGISTRY.generatedAt ?? null,
    itemCount: REGISTRY.items.length,
    version: REGISTRY.version ?? "0.0.0",
  },
  tools: TOOLS.map((tool) => ({
    description: tool.description,
    name: tool.name,
  })),
  version: REGISTRY.version ?? "0.0.0",
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
    return NextResponse.json(error_(null, -32_700, "Parse error"), {
      status: 400,
    });
  }

  if (Array.isArray(body)) {
    const responses = body
      .filter((entry): entry is JsonRpcRequest => isObject(entry))
      .map((entry) => dispatch(entry));
    return NextResponse.json(responses);
  }

  if (!isObject(body)) {
    return NextResponse.json(error_(null, -32_600, "Invalid Request"), {
      status: 400,
    });
  }

  return NextResponse.json(dispatch(body as JsonRpcRequest));
}
