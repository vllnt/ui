import { forwardRef } from "react";

import { type GlassPeerExports, resolveGlassRenderer } from "./glass-renderer";

const glassView = jest.fn();
const blurView = jest.fn();
const yes = () => true;
const no = () => false;
const throwing = () => {
  throw new Error("The native module is missing");
};

/** Module exports keyed as the peers name them (PascalCase component names). */
const moduleExports = (
  entries: readonly (readonly [string, unknown])[],
): Readonly<Record<string, unknown>> => Object.fromEntries(entries);

/** The exports of `expo-glass-effect` on a device that has Liquid Glass. */
const liquidGlass = moduleExports([
  ["GlassView", glassView],
  ["isGlassEffectAPIAvailable", yes],
  ["isLiquidGlassAvailable", yes],
]);

/** The exports of `expo-blur`. */
const blur = moduleExports([["BlurView", blurView]]);

describe("resolveGlassRenderer", () => {
  it("draws Liquid Glass when the device supports it", () => {
    expect(resolveGlassRenderer({ blur, glassEffect: liquidGlass })).toEqual({
      glassView,
      kind: "glass",
    });
  });

  it("draws Liquid Glass without expo-blur installed", () => {
    expect(resolveGlassRenderer({ glassEffect: liquidGlass })).toEqual({
      glassView,
      kind: "glass",
    });
  });

  it("reads the device check each time it is called", () => {
    let supported = false;
    const glassEffect = {
      ...liquidGlass,
      isLiquidGlassAvailable: () => supported,
    };

    expect(resolveGlassRenderer({ blur, glassEffect }).kind).toBe("blur");
    supported = true;
    expect(resolveGlassRenderer({ blur, glassEffect }).kind).toBe("glass");
  });

  it.each<readonly [string, unknown]>([
    [
      "the device has no Liquid Glass (before iOS 26)",
      { ...liquidGlass, isLiquidGlassAvailable: no },
    ],
    [
      "the glass effect API is unavailable",
      { ...liquidGlass, isGlassEffectAPIAvailable: no },
    ],
    [
      "the Liquid Glass check throws",
      { ...liquidGlass, isLiquidGlassAvailable: throwing },
    ],
    [
      "the glass effect API check throws",
      { ...liquidGlass, isGlassEffectAPIAvailable: throwing },
    ],
    ["expo-glass-effect is not installed", undefined],
    // eslint-disable-next-line unicorn/no-null -- a module can export null
    ["expo-glass-effect exports nothing", null],
    ["expo-glass-effect exports no GlassView", {}],
    [
      "expo-glass-effect exports no availability checks",
      moduleExports([["GlassView", glassView]]),
    ],
    [
      "expo-glass-effect exports a GlassView that is not a component",
      { ...liquidGlass, ...moduleExports([["GlassView", 42]]) },
    ],
  ])("falls back to a blur view when %s", (_name, glassEffect) => {
    expect(resolveGlassRenderer({ blur, glassEffect })).toEqual({
      blurView,
      kind: "blur",
    });
  });

  it("accepts a forwardRef BlurView, the web export of expo-blur", () => {
    const forwardedBlurView = forwardRef(jest.fn());
    forwardedBlurView.displayName = "ForwardedBlurView";

    expect(
      resolveGlassRenderer({
        blur: moduleExports([["BlurView", forwardedBlurView]]),
      }),
    ).toEqual({ blurView: forwardedBlurView, kind: "blur" });
  });

  it.each<readonly [string, GlassPeerExports]>([
    ["neither peer is installed", {}],
    ["both peers are undefined", { blur: undefined, glassEffect: undefined }],
    [
      "expo-blur exports no BlurView and there is no Liquid Glass",
      { blur: {} },
    ],
    [
      "expo-blur exports a BlurView that is not a component",
      { blur: moduleExports([["BlurView", 42]]) },
    ],
    [
      "the device has no Liquid Glass and expo-blur is not installed",
      { glassEffect: { ...liquidGlass, isLiquidGlassAvailable: no } },
    ],
  ])("draws nothing when %s", (_name, peers) => {
    expect(resolveGlassRenderer(peers)).toEqual({ kind: "none" });
  });
});
