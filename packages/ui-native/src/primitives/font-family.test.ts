import { Platform } from "react-native";

describe("font family", () => {
  afterEach(() => {
    jest.resetModules();
  });

  const load = (os: typeof Platform.OS) => {
    jest.doMock("react-native/Libraries/Utilities/Platform", () => ({
      ...jest.requireActual("react-native/Libraries/Utilities/Platform"),
      OS: os,
      select: (spec: Record<string, unknown>) => (os in spec ? spec[os] : spec.default),
    }));
    return jest.requireActual<typeof import("./font-family")>("./font-family");
  };

  it("uses Menlo on iOS, which has no monospace alias", () => {
    expect(load("ios").monospaceFontFamily).toBe("Menlo");
  });

  it("uses the generic monospace name on Android", () => {
    expect(load("android").monospaceFontFamily).toBe("monospace");
  });

  it("sets a font only for mono, so sans keeps the system face", () => {
    const { fontFamilyStyle } = load("ios");
    expect(fontFamilyStyle("mono")).toEqual({ fontFamily: "Menlo" });
    expect(fontFamilyStyle("sans")).toEqual({});
  });
});
