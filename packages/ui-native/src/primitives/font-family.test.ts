import { fontFamilyStyle, monospaceFontFamily } from "./font-family";

// The Jest preset runs as iOS. Android takes the `default` branch, "monospace".
describe("font family", () => {
  it("uses Menlo on iOS, which has no monospace alias", () => {
    expect(monospaceFontFamily).toBe("Menlo");
  });

  it("sets a font only for mono, so sans keeps the system face", () => {
    expect(fontFamilyStyle("mono")).toEqual({ fontFamily: "Menlo" });
    expect(fontFamilyStyle("sans")).toEqual({});
  });
});
