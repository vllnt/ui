import { describe, expect, it } from "vitest";

import { groupedComponents } from "@/lib/component-categories";
import { getFamilyGroups } from "@/lib/family-groups";

/**
 * Integrity guard for the family landing template. The hero count and the
 * `collectionPageLd` read from `groupedComponents` (registry-derived), while the
 * grid renders the hand-authored slugs in `family-groups.ts`. If the two drift,
 * the page shows a wrong count or renders a component twice. These tests keep the
 * grouped slugs a complete, non-overlapping cover of each family's registry
 * members.
 */
describe("family-groups integrity", () => {
  it("gives every family a groups entry, so none renders the flat-grid fallback", () => {
    const missing = groupedComponents
      .filter((group) => getFamilyGroups(group.category) === undefined)
      .map((group) => group.category);

    expect(missing).toEqual([]);
  });

  it("covers every registry member of a family once, with no foreign or duplicate slugs", () => {
    const mismatches = groupedComponents
      .filter((group) => {
        const groups = getFamilyGroups(group.category);
        if (!groups) {
          return false;
        }

        const itemSlugs = group.items.map((item) => item.name).sort();
        const groupSlugs = groups.flatMap((section) => section.slugs);
        const uniqueGroupSlugs = [...new Set(groupSlugs)].sort();

        const hasDuplicate = groupSlugs.length !== uniqueGroupSlugs.length;
        const coversMembers =
          JSON.stringify(uniqueGroupSlugs) === JSON.stringify(itemSlugs);

        return hasDuplicate || !coversMembers;
      })
      .map((group) => group.category);

    expect(mismatches).toEqual([]);
  });
});
