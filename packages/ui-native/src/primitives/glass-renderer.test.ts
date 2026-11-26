import { forwardRef } from "react";

import { type GlassPeerExports, resolveGlassRenderer } from "./glass-renderer";

const GlassView = () => null;
const BlurView = () => null;
const yes = () => true;
const no = () => false;
const throwing = () => {
  throw new Error("The native module is missing");
};

/** The exports of `expo-glass-effect` on a device that has Liquid Glass. */
const liquidGlass = {
  GlassView,
  isGlassEffectAPIAvailable: yes,
  isLiquidGlassAvailable: yes,
};

/** The exports of `expo-blur`. */
const blur = { BlurView };

describe("resolveGlassRenderer", () => {
  it("draws Liquid Glass when the device supports it", () => {
    expect(resolveGlassRenderer({ blur, glassEffect: liquidGlass })).toEqual({
      glassView: GlassView,
      kind: "glass",
    });
  });

  it("draws Liquid Glass without expo-blur installed", () => {
    expect(resolveGlassRenderer({ glassEffect: liquidGlass })).toEqual({
      glassView: GlassView,
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
    ["expo-glass-effect exports nothing", null],
    ["expo-glass-effect exports no GlassView", {}],
    ["expo-glass-effect exports no availability checks", { GlassView }],
    [
      "expo-glass-effect exports a GlassView that is not a component",
      { ...liquidGlass, GlassView: 42 },
    ],
  ])("falls back to a blur view when %s", (_name, glassEffect) => {
    expect(resolveGlassRenderer({ blur, glassEffect })).toEqual({
      blurView: BlurView,
      kind: "blur",
    });
  });

  it("accepts a forwardRef BlurView, the web export of expo-blur", () => {
    const ForwardedBlurView = forwardRef(() => null);

    expect(
      resolveGlassRenderer({ blur: { BlurView: ForwardedBlurView } }),
    ).toEqual({ blurView: ForwardedBlurView, kind: "blur" });
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
      { blur: { BlurView: 42 } },
    ],
    [
      "the device has no Liquid Glass and expo-blur is not installed",
      { glassEffect: { ...liquidGlass, isLiquidGlassAvailable: no } },
    ],
  ])("draws nothing when %s", (_name, peers) => {
    expect(resolveGlassRenderer(peers)).toEqual({ kind: "none" });
  });
});
