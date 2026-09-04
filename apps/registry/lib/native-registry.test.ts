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

  it("maps every entry to native source and web catalog metadata", () => {
    const webNames = new Set(registry.items.map((item) => item.name));
    const entriesAreValid = nativeRegistry.components.every(
      (component) =>
        webNames.has(component.name) &&
        existsSync(resolve("../../packages/ui-native", component.source)),
    );

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
