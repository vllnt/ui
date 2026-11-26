import {
  mockGlassPeers,
  NO_PEERS,
  type PeerModes,
  unmockGlassPeers,
} from "../tests/glass-fixtures";

import type * as GlassPeersModule from "./glass-peers";

/** Loads `glass-peers` fresh against `modes` and asks it for the renderer. */
function rendererFor(modes: PeerModes): GlassPeersModule.GlassRenderer {
  let renderer: GlassPeersModule.GlassRenderer = { kind: "none" };
  jest.isolateModules(() => {
    mockGlassPeers(modes);
    try {
      renderer = jest
        .requireActual<typeof GlassPeersModule>("./glass-peers")
        .glassRenderer();
    } finally {
      unmockGlassPeers();
    }
  });
  return renderer;
}

describe("glassRenderer", () => {
  it("draws Liquid Glass when the device supports it", () => {
    expect(
      rendererFor({ blur: "present", glassEffect: "available" }),
    ).toMatchObject({ glassView: expect.any(Function), kind: "glass-effect" });
  });

  it("draws Liquid Glass without expo-blur installed", () => {
    expect(rendererFor({ blur: "absent", glassEffect: "available" }).kind).toBe(
      "glass-effect",
    );
  });

  it.each<readonly [string, PeerModes]>([
    [
      "the device has no Liquid Glass (before iOS 26)",
      { blur: "present", glassEffect: "no-liquid-glass" },
    ],
    [
      "the glass effect API is unavailable",
      { blur: "present", glassEffect: "no-api" },
    ],
    [
      "the Liquid Glass check throws",
      { blur: "present", glassEffect: "liquid-glass-throws" },
    ],
    [
      "the glass effect API check throws",
      { blur: "present", glassEffect: "api-throws" },
    ],
    [
      "expo-glass-effect is not installed",
      { blur: "present", glassEffect: "absent" },
    ],
    [
      "expo-glass-effect exports no GlassView",
      { blur: "present", glassEffect: "malformed" },
    ],
    [
      "expo-glass-effect exports no availability checks",
      { blur: "present", glassEffect: "missing-checks" },
    ],
  ])("falls back to a blur view when %s", (_name, modes) => {
    expect(rendererFor(modes)).toMatchObject({
      blurView: expect.any(Function),
      kind: "blur",
    });
  });

  it("accepts a forwardRef BlurView, the web export of expo-blur", () => {
    expect(
      rendererFor({ blur: "forward-ref", glassEffect: "absent" }),
    ).toMatchObject({ blurView: expect.anything(), kind: "blur" });
  });

  it.each<readonly [string, PeerModes]>([
    ["neither peer is installed", NO_PEERS],
    [
      "expo-blur exports no BlurView and there is no Liquid Glass",
      { blur: "malformed", glassEffect: "absent" },
    ],
    [
      "the device has no Liquid Glass and expo-blur is not installed",
      { blur: "absent", glassEffect: "no-liquid-glass" },
    ],
  ])("draws nothing when %s", (_name, modes) => {
    expect(rendererFor(modes)).toEqual({ kind: "none" });
  });
});
