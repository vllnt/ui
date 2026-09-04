import { describe, expect, it } from "vitest";

import { nativeRegistry } from "@/lib/native-registry";

import { getComponent, searchComponents, TOOLS } from "./route";

describe("platform-aware MCP tools", () => {
  it("advertises renderer filtering and projection", () => {
    expect(TOOLS[0].inputSchema.properties.platform).toMatchObject({
      enum: ["web", "native"],
      type: "string",
    });
    expect(TOOLS[1].inputSchema.properties.platform).toMatchObject({
      enum: ["web", "native"],
      type: "string",
    });
    expect(TOOLS.map((tool) => tool.name)).toContain("list_platforms");
  });

  it("filters native-capable components from the manifest", () => {
    const result = searchComponents({ platform: "native", query: "" });

    expect(result.total).toBe(nativeRegistry.components.length);
    expect(result.items).toHaveLength(25);
    expect(
      result.items.every((item) => item.platforms.includes("native")),
    ).toBe(true);
  });

  it("rejects invalid renderer filters", () => {
    expect(() => searchComponents({ platform: "desktop" })).toThrow(
      "Unsupported platform: desktop",
    );
    expect(() => getComponent({ name: "button", platform: "desktop" })).toThrow(
      "Unsupported platform: desktop",
    );
  });

  it("returns a native-only projection without web props or source", () => {
    expect(getComponent({ name: "button", platform: "native" })).toMatchObject({
      compatibility: "portable-options",
      install: {
        available: false,
        command: "pnpm add @vllnt/ui-native@canary",
        kind: "package",
      },
      package: "@vllnt/ui-native",
      platform: "native",
      source: { path: "src/components/button/button.tsx" },
      status: "experimental",
    });
  });

  it("returns a web-only projection with shadcn installation", () => {
    expect(getComponent({ name: "button", platform: "web" })).toMatchObject({
      install: { available: true, kind: "shadcn" },
      package: "@vllnt/ui",
      platform: "web",
    });
  });

  it("preserves the legacy combined descriptor when platform is omitted", () => {
    expect(getComponent({ name: "button" })).toMatchObject({
      native: {
        availability: "source",
        channel: "canary",
        package: "@vllnt/ui-native",
        status: "experimental",
      },
      platforms: ["web", "native"],
    });
  });

  it("returns null for an unsupported component-renderer pair", () => {
    expect(getComponent({ name: "table", platform: "native" })).toBeNull();
  });
});
