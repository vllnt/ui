import { BREAKPOINTS, responsiveValue } from "./breakpoints";

describe("responsiveValue", () => {
  const all = { lg: 4, md: 3, sm: 2 } as const;

  it("matches the Tailwind defaults the web components use", () => {
    expect(BREAKPOINTS).toEqual({ lg: 1024, md: 768, sm: 640 });
  });

  it("returns the base below the first breakpoint and each value from its width up", () => {
    expect(responsiveValue(639, 1, all)).toBe(1);
    expect(responsiveValue(640, 1, all)).toBe(2);
    expect(responsiveValue(768, 1, all)).toBe(3);
    expect(responsiveValue(1024, 1, all)).toBe(4);
  });

  it("lets a breakpoint without a value inherit the one below", () => {
    expect(responsiveValue(2000, 1, { lg: undefined, md: 3, sm: 2 })).toBe(3);
    expect(
      responsiveValue(2000, 1, { lg: undefined, md: undefined, sm: 2 }),
    ).toBe(2);
    expect(
      responsiveValue(2000, 1, { lg: undefined, md: undefined, sm: undefined }),
    ).toBe(1);
  });

  it("skips a missing smaller breakpoint without losing the base", () => {
    expect(responsiveValue(700, 1, { lg: 4, md: 3, sm: undefined })).toBe(1);
  });
});
