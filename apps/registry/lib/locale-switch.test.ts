import { describe, expect, it } from "vitest";

import { languageSwitchLocale } from "./locale-switch";

describe("languageSwitchLocale", () => {
  it("gives the current language no locale, so its link is not prefixed", () => {
    expect(languageSwitchLocale("en", "en")).toBeUndefined();
    expect(languageSwitchLocale("fr", "fr")).toBeUndefined();
  });

  it("keeps the locale of the language being switched to", () => {
    expect(languageSwitchLocale("fr", "en")).toBe("fr");
    expect(languageSwitchLocale("en", "fr")).toBe("en");
  });
});
