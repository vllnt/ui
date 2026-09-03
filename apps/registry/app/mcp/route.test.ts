import { describe, expect, it } from "vitest";

import { getComponent, searchComponents, TOOLS } from "./route";

describe("platform-aware MCP tools", () => {
  it("advertises the renderer filter", () => {
    expect(TOOLS[0].inputSchema.properties.platform).toMatchObject({
      enum: ["web", "native"],
      type: "string",
    });
  });

  it("filters native-capable components", () => {
    const result = searchComponents({ platform: "native", query: "" });

    expect(result.total).toBe(5);
    expect(result.items.map((item) => item.name)).toEqual([
      "badge",
      "button",
      "card",
      "heading",
      "text",
    ]);
    expect(
      result.items.every((item) => item.platforms.includes("native")),
    ).toBe(true);
  });

  it("returns native metadata from get_component", () => {
    expect(getComponent({ name: "button" })).toMatchObject({
      native: {
        channel: "canary",
        package: "@vllnt/ui-native",
        status: "experimental",
      },
      platforms: ["web", "native"],
    });
  });
});
