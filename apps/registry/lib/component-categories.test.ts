import { describe, expect, it } from "vitest";

import {
  components,
  groupedComponents,
} from "@/lib/component-categories";
import { registry } from "@/lib/registry";
import type { ComponentCategory } from "@/types/registry";

/**
 * Regression guard for the sidebar-category bug. A fixed `categoryOrder` used to
 * drop any component whose category was missing from the list (ai, billing,
 * data-display, educational — 32 components), so those never reached the docs
 * sidebar. These tests fail if the sidebar drops a category again.
 */
describe("sidebar category coverage", () => {
  it("renders every registry component in exactly one sidebar group", () => {
    const renderedCount = groupedComponents.reduce(
      (total, group) => total + group.items.length,
      0,
    );

    expect(renderedCount).toBe(components.length);
  });

  it("surfaces every category present in the registry data", () => {
    const usedCategories = new Set(
      registry.items.map((item) => item.category ?? "utility"),
    );
    const renderedCategories = new Set(
      groupedComponents.map((group) => group.category),
    );

    const missing = [...usedCategories].filter(
      (category) => !renderedCategories.has(category),
    );

    expect(missing).toEqual([]);
  });

  it("includes the previously-missing categories", () => {
    const renderedCategories = new Set(
      groupedComponents.map((group) => group.category),
    );

    const previouslyMissing: ComponentCategory[] = [
      "ai",
      "billing",
      "data-display",
      "educational",
    ];
    const missing = previouslyMissing.filter(
      (category) => !renderedCategories.has(category),
    );

    expect(missing).toEqual([]);
  });
});
