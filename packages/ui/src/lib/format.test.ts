import { describe, expect, it } from "vitest";

import {
  formatChange,
  getCurrencyFormatter,
  getDateTimeFormatter,
  getNumberFormatter,
} from "./format";

describe("getNumberFormatter", () => {
  it("returns the same instance for identical inputs", () => {
    const first = getNumberFormatter("en-US", { maximumFractionDigits: 2 });
    const second = getNumberFormatter("en-US", { maximumFractionDigits: 2 });

    expect(first).toBe(second);
  });

  it("returns distinct instances for different options", () => {
    const first = getNumberFormatter("en-US", { maximumFractionDigits: 2 });
    const second = getNumberFormatter("en-US", { maximumFractionDigits: 0 });

    expect(first).not.toBe(second);
  });
});

describe("getCurrencyFormatter", () => {
  it("formats as currency", () => {
    expect(getCurrencyFormatter("en-US", "USD").format(1234.5)).toBe(
      "$1,234.50",
    );
  });

  it("caches per locale and currency", () => {
    expect(getCurrencyFormatter("en-US", "USD")).toBe(
      getCurrencyFormatter("en-US", "USD"),
    );
    expect(getCurrencyFormatter("en-US", "USD")).not.toBe(
      getCurrencyFormatter("en-US", "EUR"),
    );
  });
});

describe("getDateTimeFormatter", () => {
  it("returns the same instance for identical inputs", () => {
    const options = { day: "numeric", month: "short" } as const;

    expect(getDateTimeFormatter("en-US", options)).toBe(
      getDateTimeFormatter("en-US", options),
    );
  });

  it("respects the timeZone option", () => {
    const formatter = getDateTimeFormatter("en-US", {
      hour: "numeric",
      timeZone: "UTC",
    });

    expect(formatter.format(new Date("2026-01-01T13:00:00Z"))).toBe("1 PM");
  });
});

describe("formatChange", () => {
  it("prefixes gains with +", () => {
    expect(formatChange(1.254)).toBe("+1.25%");
  });

  it("keeps the minus sign for losses", () => {
    expect(formatChange(-0.4)).toBe("-0.40%");
  });

  it("renders zero without a sign", () => {
    expect(formatChange(0)).toBe("0.00%");
  });
});
