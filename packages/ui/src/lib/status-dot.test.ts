import { describe, expect, it } from "vitest";

import { isStatusTone, STATUS_TONES, statusDotVariants } from "./status-dot";

describe("isStatusTone", () => {
  it.each(STATUS_TONES)("accepts %s", (tone) => {
    expect(isStatusTone(tone)).toBe(true);
  });

  it.each([
    "solid",
    "danger-solid",
    "danger-tint",
    "warn",
    "",
    undefined,
    null,
  ])("rejects %s", (value) => {
    expect(isStatusTone(value)).toBe(false);
  });
});

describe("statusDotVariants", () => {
  it("draws a 6px dot in the current colour", () => {
    expect(statusDotVariants()).toBe(
      "size-1.5 shrink-0 rounded-full bg-current",
    );
  });

  it.each([
    ["danger", "text-destructive"],
    ["info", "text-info"],
    ["neutral", "text-muted-foreground"],
    ["primary", "text-primary"],
    ["success", "text-success"],
    ["warning", "text-warning"],
  ] as const)("tone %s sets %s on the dot", (tone, colour) => {
    expect(statusDotVariants({ tone })).toContain(colour);
  });
});
