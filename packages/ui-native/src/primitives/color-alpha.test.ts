import { withAlpha } from "./color-alpha";

describe("withAlpha", () => {
  it("appends the opacity to a hex colour as two hex digits", () => {
    expect(withAlpha("#fa6961", 0.1)).toBe("#fa69611a");
    expect(withAlpha("#FA6961", 0.5)).toBe("#FA696180");
    expect(withAlpha("#000000", 1)).toBe("#000000ff");
    expect(withAlpha("#000000", 0)).toBe("#00000000");
  });

  it("clamps an opacity outside 0 to 1", () => {
    expect(withAlpha("#102030", 2)).toBe("#102030ff");
    expect(withAlpha("#102030", -1)).toBe("#10203000");
  });

  it("leaves a colour that is not a six-digit hex untouched", () => {
    expect(withAlpha("rgb(1, 2, 3)", 0.5)).toBe("rgb(1, 2, 3)");
    expect(withAlpha("#abc", 0.5)).toBe("#abc");
    expect(withAlpha("#11223344", 0.5)).toBe("#11223344");
    expect(withAlpha("transparent", 0.5)).toBe("transparent");
  });
});
