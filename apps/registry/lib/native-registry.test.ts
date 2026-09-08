import { existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { nativeRegistry } from "./native-registry";
import { registry } from "./registry";

describe("native renderer manifest", () => {
  it("truthfully reports source-only availability", () => {
    expect(nativeRegistry).toMatchObject({
      availability: "source",
      channel: "canary",
      installation: { available: false },
      package: "@vllnt/ui-native",
      status: "experimental",
    });
  });

  it("pairs every native source with browser-safe Web catalog metadata", () => {
    const webEntries = new Map(registry.items.map((item) => [item.name, item]));
    const entriesAreValid = nativeRegistry.components.every((component) => {
      const webEntry = webEntries.get(component.name);

      return (
        webEntry?.platforms.includes("web") === true &&
        webEntry.platforms.includes("native") &&
        webEntry.native?.source === component.source &&
        existsSync(resolve("../../packages/ui-native", component.source))
      );
    });

    expect(entriesAreValid).toBe(true);
  });

  it("uses unique alphabetized component names", () => {
    const names = nativeRegistry.components.map((component) => component.name);
    expect(new Set(names).size).toBe(names.length);
    expect(names).toEqual(
      [...names].sort((left, right) => left.localeCompare(right)),
    );
  });
});
