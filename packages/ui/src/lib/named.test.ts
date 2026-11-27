import { describe, expect, it } from "vitest";

import { named } from "./named";

const cardBase = () => null;
const tabsBase = () => null;
const nameBase = () => null;
const keysBase = () => null;
const item = () => null;
const withDefaults = Object.assign(() => null, {
  defaultProps: { size: "md" },
});

describe("named", () => {
  it("sets displayName and returns the component it was given", () => {
    const result = named("Card", cardBase);

    expect(result).toBe(cardBase);
    expect(result.displayName).toBe("Card");
  });

  it("hangs statics on the component", () => {
    const tabs = named("Tabs", tabsBase, () => ({ item }));

    expect(tabs.item).toBe(item);
    expect(tabs.displayName).toBe("Tabs");
  });

  it("lets the name win over a static of the same key", () => {
    const result = named("Tabs", nameBase, () => ({ displayName: "Other" }));

    expect(result.displayName).toBe("Tabs");
  });

  it("leaves what the component already has", () => {
    expect(named("Card", withDefaults).defaultProps).toEqual({ size: "md" });
  });

  it("makes an enumerable own property, like the assignment it replaces", () => {
    expect(Object.keys(named("Card", keysBase))).toEqual(["displayName"]);
  });
});
