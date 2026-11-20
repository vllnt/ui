import {
  computePlacement,
  type PlacementGeometry,
  type PlacementProps,
} from "./anchored-placement";

const GEOMETRY: PlacementGeometry = {
  anchor: { height: 40, width: 80, x: 100, y: 300 },
  bounds: { height: 800, width: 400 },
  panel: { height: 100, width: 200 },
};

function place(
  placement?: PlacementProps,
  geometry: PlacementGeometry = GEOMETRY,
) {
  return computePlacement(geometry, placement);
}

describe("computePlacement", () => {
  it("opens below the anchor, centred, 4 pt away by default", () => {
    expect(place()).toEqual({ left: 40, top: 344 });
  });

  it("opens above the anchor on side top", () => {
    expect(place({ side: "top" })).toEqual({ left: 40, top: 196 });
  });

  it("opens beside the anchor on sides left and right", () => {
    expect(place({ side: "right" })).toEqual({ left: 184, top: 270 });
    expect(place({ side: "left" }).top).toBe(270);
  });

  it("aligns to the start and end edges of the anchor", () => {
    const right = { ...GEOMETRY, anchor: { ...GEOMETRY.anchor, x: 200 } };
    expect(place({ align: "start" }).left).toBe(100);
    expect(place({ align: "end" }, right).left).toBe(80);
  });

  it("slides along the edge by alignOffset: toward the end for start", () => {
    expect(place({ align: "start", alignOffset: 12 }).left).toBe(112);
  });

  it("slides along the edge by alignOffset: toward the start for end", () => {
    const geometry = {
      ...GEOMETRY,
      anchor: { ...GEOMETRY.anchor, x: 200 },
    };
    const flush = place({ align: "end" }, geometry).left;
    expect(place({ align: "end", alignOffset: 12 }, geometry).left).toBe(
      flush - 12,
    );
  });

  it("ignores alignOffset when centred", () => {
    expect(place({ alignOffset: 40 })).toEqual(place());
  });

  it("pushes the panel away by sideOffset", () => {
    expect(place({ sideOffset: 20 }).top).toBe(360);
    expect(place({ side: "top", sideOffset: 20 }).top).toBe(180);
  });

  it("allows a negative sideOffset to overlap the anchor", () => {
    expect(place({ sideOffset: -10 }).top).toBe(330);
  });

  it("keeps an 8 pt margin at the window edges", () => {
    expect(place({ side: "left" }).left).toBe(8);
    const nearTop = {
      ...GEOMETRY,
      anchor: { ...GEOMETRY.anchor, y: 20 },
    };
    expect(place({ side: "top" }, nearTop).top).toBe(8);
  });

  it("keeps the panel inside the bottom and right edges", () => {
    const corner = {
      ...GEOMETRY,
      anchor: { height: 40, width: 80, x: 340, y: 780 },
    };
    expect(place({ align: "start" }, corner)).toEqual({
      left: 400 - 200 - 8,
      top: 800 - 100 - 8,
    });
  });

  it("does not flip: an oversized panel stays on its side, clamped", () => {
    const tall = { ...GEOMETRY, panel: { height: 900, width: 200 } };
    expect(place({ side: "bottom" }, tall).top).toBe(8);
  });
});
