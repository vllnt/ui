import {
  clampDelta,
  resolveRelease,
  resolveSnapPoints,
  type SnapReleaseInput,
} from "./snap-points";

const SIZES = [200, 400, 800];

function release(overrides: Partial<SnapReleaseInput>) {
  return resolveRelease({
    activeIndex: 0,
    closeThreshold: 0.25,
    delta: 0,
    dismissible: true,
    sequential: false,
    sizes: SIZES,
    velocity: 0,
    ...overrides,
  });
}

describe("resolveSnapPoints", () => {
  it("turns fractions and pixel strings into sizes, smallest first", () => {
    const sizes = resolveSnapPoints([1, "148px", 0.5], 800).map(
      (snap) => snap.size,
    );
    expect(sizes).toEqual([148, 400, 800]);
  });

  it("keeps the caller's point next to its size", () => {
    expect(resolveSnapPoints(["148px"], 800)).toEqual([
      { point: "148px", size: 148 },
    ]);
  });

  it("drops points that are not a fraction in (0, 1] or a px string", () => {
    const invalid = [0, -0.5, 1.5, Number.NaN, "50%", "px", "-4px", "0px", ""];
    expect(resolveSnapPoints(invalid, 800)).toEqual([]);
  });

  it("caps a pixel size at the window", () => {
    expect(resolveSnapPoints(["2000px"], 800)[0]?.size).toBe(800);
  });

  it("returns nothing without points", () => {
    expect(resolveSnapPoints([], 800)).toEqual([]);
  });
});

describe("clampDelta", () => {
  it("lets a dismissible drawer slide fully away", () => {
    const drag = { activeIndex: 1, dismissible: true, sizes: SIZES };
    expect(clampDelta(900, drag)).toBe(400);
  });

  it("stops a non-dismissible drawer at its lowest snap point", () => {
    const drag = { activeIndex: 1, dismissible: false, sizes: SIZES };
    expect(clampDelta(900, drag)).toBe(200);
  });

  it("stops at the largest snap point when dragged larger", () => {
    const drag = { activeIndex: 1, dismissible: true, sizes: SIZES };
    expect(clampDelta(-900, drag)).toBe(-400);
  });

  it("passes a delta inside the range through", () => {
    const drag = { activeIndex: 1, dismissible: true, sizes: SIZES };
    expect(clampDelta(-120, drag)).toBe(-120);
  });

  it("does not move a drawer with no snap sizes", () => {
    const drag = { activeIndex: 0, dismissible: false, sizes: [] };
    expect(clampDelta(50, drag)).toBe(0);
  });
});

describe("resolveRelease: slow drags", () => {
  it("closes once the drag covers the close threshold", () => {
    expect(release({ delta: 60, sizes: [200] })).toEqual({ close: true });
  });

  it("settles back when the drag stays under the threshold", () => {
    expect(release({ delta: 40, sizes: [200] })).toEqual({
      close: false,
      index: 0,
    });
  });

  it("honours a custom close threshold", () => {
    const input = { closeThreshold: 0.8, delta: 120, sizes: [200] };
    expect(release(input)).toEqual({ close: false, index: 0 });
  });

  it("never closes a non-dismissible drawer", () => {
    expect(release({ delta: 190, dismissible: false, sizes: [200] })).toEqual({
      close: false,
      index: 0,
    });
  });

  it("settles on the nearest snap point", () => {
    expect(release({ activeIndex: 1, delta: -150 })).toEqual({
      close: false,
      index: 1,
    });
    expect(release({ activeIndex: 1, delta: -300 })).toEqual({
      close: false,
      index: 2,
    });
  });

  it("jumps over snap points when not sequential", () => {
    expect(release({ activeIndex: 0, delta: -600 })).toEqual({
      close: false,
      index: 2,
    });
  });

  it("moves at most one snap point when sequential", () => {
    expect(release({ activeIndex: 0, delta: -600, sequential: true })).toEqual({
      close: false,
      index: 1,
    });
  });

  it("settles on the active snap point for a zero drag", () => {
    expect(release({ activeIndex: 2 })).toEqual({ close: false, index: 2 });
  });
});

describe("resolveRelease: flings", () => {
  it("closes a dismissible drawer flung down from its lowest snap point", () => {
    expect(release({ velocity: 0.9 })).toEqual({ close: true });
  });

  it("keeps a non-dismissible drawer on its lowest snap point", () => {
    expect(release({ dismissible: false, velocity: 0.9 })).toEqual({
      close: false,
      index: 0,
    });
  });

  it("flings to the lowest snap point, not closed, from a higher one", () => {
    expect(release({ activeIndex: 2, velocity: 0.9 })).toEqual({
      close: false,
      index: 0,
    });
  });

  it("flings to the largest snap point when flung larger", () => {
    expect(release({ activeIndex: 0, velocity: -0.9 })).toEqual({
      close: false,
      index: 2,
    });
  });

  it("moves one snap point per fling when sequential", () => {
    expect(
      release({ activeIndex: 2, sequential: true, velocity: 0.9 }),
    ).toEqual({ close: false, index: 1 });
    expect(
      release({ activeIndex: 0, sequential: true, velocity: -0.9 }),
    ).toEqual({ close: false, index: 1 });
  });

  it("stays on the largest snap point when flung larger again", () => {
    expect(
      release({ activeIndex: 2, sequential: true, velocity: -0.9 }),
    ).toEqual({ close: false, index: 2 });
  });

  it("treats a drag at the fling speed as a slow drag", () => {
    expect(release({ delta: 10, velocity: 0.4 })).toEqual({
      close: false,
      index: 0,
    });
  });
});
