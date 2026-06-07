import { describe, expect, it } from "vitest";

import {
  hexToOklchChannels,
  oklchChannelsToHex,
  oklchToCss,
  parseOklchChannels,
} from "@/lib/oklch";

describe("oklch", () => {
  it("parses an L C H channel string", () => {
    expect(parseOklchChannels("0.88 0.21 150")).toEqual([0.88, 0.21, 150]);
  });

  it("parses an empty string to zeros", () => {
    expect(parseOklchChannels("")).toEqual([0, 0, 0]);
  });

  it("formats channels as a full oklch() color", () => {
    expect(oklchToCss("0.2044 0 0")).toBe("oklch(0.2044 0 0)");
  });

  it("maps achromatic black/white to hex anchors", () => {
    expect(oklchChannelsToHex("1 0 0")).toBe("#ffffff");
    expect(oklchChannelsToHex("0 0 0")).toBe("#000000");
  });

  it("returns black for non-numeric input (no invalid color value)", () => {
    expect(oklchChannelsToHex("abc")).toBe("#000000");
    expect(oklchChannelsToHex("not a color")).toBe("#000000");
    expect(oklchChannelsToHex("")).toBe("#000000");
  });

  it("round-trips channels -> hex -> channels within tolerance", () => {
    for (const sample of ["0.5555 0 0", "0.6368 0.2078 25.326", "0.62 0.17 280"]) {
      const back = hexToOklchChannels(oklchChannelsToHex(sample));
      const [l1] = parseOklchChannels(sample);
      const [l2] = parseOklchChannels(back);
      expect(Math.abs(l1 - l2)).toBeLessThan(0.01);
    }
  });

  it("emits an achromatic 'L 0 0' form for greys", () => {
    expect(hexToOklchChannels("#808080")).toMatch(/^[\d.]+ 0 0$/);
  });
});
