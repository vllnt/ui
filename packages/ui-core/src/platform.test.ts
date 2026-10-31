import { componentPlatforms, isComponentPlatform } from "./index";

describe("isComponentPlatform", () => {
  it.each(componentPlatforms)("accepts %s", (platform) => {
    expect(isComponentPlatform(platform)).toBe(true);
  });

  it.each([undefined, "", "Web", "ios", 1, {}])("rejects %j", (value) => {
    expect(isComponentPlatform(value)).toBe(false);
  });
});
