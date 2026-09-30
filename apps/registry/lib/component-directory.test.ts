import { existsSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import {
  COMPONENT_LEVELS,
  findComponentDirectory,
  listComponentDirectories,
} from "./component-directory";
import { registry } from "./registry";

const componentsRoot = path.join(
  process.cwd(),
  "..",
  "..",
  "packages",
  "ui",
  "src",
  "components",
);
const CHART_ITEMS = new Set(["area-chart", "bar-chart", "line-chart"]);

describe("component directory lookup", () => {
  it("finds a component in its atomic level folder", () => {
    expect(findComponentDirectory(componentsRoot, "button")).toBe(
      path.join(componentsRoot, "atoms", "button"),
    );
    expect(findComponentDirectory(componentsRoot, "canvas-shell")).toBe(
      path.join(componentsRoot, "templates", "canvas-shell"),
    );
    expect(findComponentDirectory(componentsRoot, "not-a-component")).toBe(
      undefined,
    );
  });

  it("resolves the source file of every registry item", () => {
    const unresolved = registry.items
      .filter((item) => !CHART_ITEMS.has(item.name))
      .filter((item) => {
        const directory = findComponentDirectory(componentsRoot, item.name);
        return (
          !directory || !existsSync(path.join(directory, `${item.name}.tsx`))
        );
      })
      .map((item) => item.name);

    expect(unresolved).toEqual([]);
  });

  it("lists every component once, sorted, inside a level folder", () => {
    const components = listComponentDirectories(componentsRoot);
    const names = components.map((component) => component.name);

    expect(names).toEqual([...names].sort());
    expect(new Set(names).size).toBe(names.length);
    for (const { directory, name } of components) {
      const level = path.basename(path.dirname(directory));
      expect(COMPONENT_LEVELS).toContain(level);
      expect(path.basename(directory)).toBe(name);
    }
  });
});
