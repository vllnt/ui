import { describe, expect, it } from "vitest";

import { keyByOccurrence } from "./occurrence-keys";

describe("keyByOccurrence", () => {
  it("keeps every key unique when items repeat", () => {
    const keyed = keyByOccurrence(["a", "b", "a", "a", "b"], (text) => text);
    expect(keyed.map(({ key }) => key)).toEqual([
      "a-0",
      "b-0",
      "a-1",
      "a-2",
      "b-1",
    ]);
    expect(new Set(keyed.map(({ key }) => key)).size).toBe(5);
  });

  it("keeps the key of an equal item when others change around it", () => {
    const before = keyByOccurrence(["x", "y", "x"], (text) => text);
    const after = keyByOccurrence(["z", "x", "y", "x"], (text) => text);
    expect(after.map(({ key }) => key)).toEqual(["z-0", "x-0", "y-0", "x-1"]);
    expect(before.at(2)?.key).toBe(after.at(3)?.key);
  });

  it("does not collide when an identity already ends in a number", () => {
    const keyed = keyByOccurrence(["a", "a-1", "a"], (text) => text);
    expect(new Set(keyed.map(({ key }) => key)).size).toBe(3);
  });

  it("treats items as equal by identity text, not by object reference", () => {
    const keyed = keyByOccurrence(
      [{ label: "Tax" }, { label: "Tax" }],
      (line) => line.label,
    );
    expect(keyed.map(({ key }) => key)).toEqual(["Tax-0", "Tax-1"]);
  });

  it("returns the original items and an empty list for no items", () => {
    const first = { id: 1 };
    expect(keyByOccurrence([first], () => "same").at(0)?.item).toBe(first);
    expect(keyByOccurrence([], () => "same")).toEqual([]);
  });
});
