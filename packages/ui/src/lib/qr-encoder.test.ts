import { createRequire } from "node:module";

import { create } from "qrcode";
import { describe, expect, it } from "vitest";

import { encodeQrMatrix, type QrErrorLevel } from "./qr-encoder";

const LEVELS: QrErrorLevel[] = ["L", "M", "Q", "H"];
const LONG_TIMEOUT = 120_000;

type Capacity = (version: number, level: unknown, mode: unknown) => number;
const nodeRequire = createRequire(import.meta.url);
const capacityOf = nodeRequire("qrcode/lib/core/version") as {
  getCapacity: Capacity;
};
const levelsOf = nodeRequire(
  "qrcode/lib/core/error-correction-level",
) as Record<QrErrorLevel, unknown>;
const modesOf = nodeRequire("qrcode/lib/core/mode") as Record<
  "ALPHANUMERIC" | "BYTE" | "NUMERIC",
  unknown
>;

/** Splits a string into code points, like spreading it. */
function characters(text: string): string[] {
  return text.match(/./gsu) ?? [];
}

/** The module matrix `qrcode` produces, the reference for every case. */
function reference(value: string, level: QrErrorLevel) {
  const { modules } = create(value, { errorCorrectionLevel: level });
  return { modules: modules.data, size: modules.size };
}

function expectSameAsQrcode(value: string, level: QrErrorLevel) {
  const expected = reference(value, level);
  const actual = encodeQrMatrix(value, level);
  expect(actual.size).toBe(expected.size);
  expect(
    Buffer.from(actual.modules).equals(Buffer.from(expected.modules)),
  ).toBe(true);
}

/** Small deterministic generator: one seed always gives the same cases. */
function randomSource(seed: number) {
  let state = seed;
  return () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state / 2 ** 32;
  };
}

function randomText(
  next: () => number,
  alphabet: string[],
  length: number,
): string {
  return Array.from(
    { length },
    () => alphabet[Math.floor(next() * alphabet.length)],
  ).join("");
}

const ALPHABETS = {
  alphanumeric: characters("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"),
  ascii: Array.from({ length: 95 }, (_, index) =>
    String.fromCodePoint(32 + index),
  ),
  digits: characters("0123456789"),
  mixed: characters("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef .-:/"),
  unicode: characters("0123456789ABCéü日本😀xyz"),
};

const SAMPLES = [
  "a",
  "hello",
  "Hello, World!",
  "https://vllnt.com",
  "HTTPS://VLLNT.COM/PATH?A=1",
  "https://example.com/a/very/long/path?query=string&with=many&params=true#fragment",
  "0",
  "12345678",
  "00000000000",
  "1234567890123456789012345678901234567890",
  "WIFI:S:home;T:WPA;P:secret;;",
  "MAILTO:USER@EXAMPLE.COM",
  "BEGIN:VCARD\nVERSION:3.0\nFN:Jane Doe\nTEL:+33123456789\nEND:VCARD",
  "café",
  "日本語のテキスト",
  "emoji 😀 mix 123",
  "line one\nline two\r\nline three",
  "A1A1A1A1A1A1A1A1A1A1",
  "ABC123def456GHI789",
  "1234567ABCDEFG1234567abcdefg",
  " ",
  "$%*+-./:",
  "a1b2c3d4e5f6g7h8i9",
  "😀😀😀",
  "x".repeat(120),
  "9".repeat(500),
  "Z".repeat(300),
  "1A".repeat(200),
  "1a".repeat(200),
  "abc123ABC".repeat(40),
];

// The longest text each mode holds, and one character more, for versions
// where the layout changes: first version with version info (7), count
// field widths (10, 27), alignment pattern spacing (32) and the largest.
const BOUNDARY_VERSIONS = [1, 2, 6, 7, 9, 10, 13, 14, 26, 27, 32, 39, 40];
const BOUNDARY_MODES = [
  { alphabet: characters("0123456789"), mode: modesOf.NUMERIC },
  {
    alphabet: characters("ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"),
    mode: modesOf.ALPHANUMERIC,
  },
  { alphabet: characters("abcdefghijklmnopqrstuvwxyz"), mode: modesOf.BYTE },
];

function boundaryTexts(level: QrErrorLevel): string[] {
  return BOUNDARY_VERSIONS.flatMap((version) =>
    BOUNDARY_MODES.flatMap(({ alphabet, mode }) => {
      const capacity = capacityOf.getCapacity(version, levelsOf[level], mode);
      // Version 40 has no larger symbol, so one past its capacity throws.
      const lengths = version === 40 ? [capacity] : [capacity, capacity + 1];
      return lengths.map((length) =>
        Array.from(
          { length },
          (_, index) => alphabet[(index * 7 + version) % alphabet.length],
        ).join(""),
      );
    }),
  );
}

describe("encodeQrMatrix against qrcode", () => {
  it.each(LEVELS)(
    "matches module for module on fixed samples at level %s",
    (level) => {
      SAMPLES.forEach((sample) => {
        expectSameAsQrcode(sample, level);
      });
    },
    LONG_TIMEOUT,
  );

  it.each(LEVELS)(
    "matches on random text in five alphabets at level %s",
    (level) => {
      const next = randomSource(20_251_126);
      Object.values(ALPHABETS).forEach((alphabet) => {
        Array.from({ length: 12 }).forEach((_, count) => {
          const length = 1 + Math.floor(next() * (count < 10 ? 150 : 700));
          expectSameAsQrcode(randomText(next, alphabet, length), level);
        });
      });
    },
    LONG_TIMEOUT,
  );

  it.each(LEVELS)(
    "matches on text that mixes digit, letter and byte runs at level %s",
    (level) => {
      const next = randomSource(7);
      const runAlphabets = [
        ALPHABETS.digits,
        ALPHABETS.alphanumeric.slice(10),
        characters("abcdefghijklmnopqrstuvwxyz"),
      ];
      Array.from({ length: 25 }).forEach(() => {
        const runs = 1 + Math.floor(next() * 12);
        const text = Array.from({ length: runs }, () => {
          const alphabet = runAlphabets[Math.floor(next() * 3)] ?? [];
          return randomText(next, alphabet, 1 + Math.floor(next() * 30));
        }).join("");
        expectSameAsQrcode(text, level);
      });
    },
    LONG_TIMEOUT,
  );

  it.each(LEVELS)(
    "matches at the capacity of each mode and one past it at level %s",
    (level) => {
      boundaryTexts(level).forEach((text) => {
        expectSameAsQrcode(text, level);
      });
    },
    LONG_TIMEOUT,
  );

  it("rejects text that does not fit version 40, like qrcode", () => {
    const capacity = capacityOf.getCapacity(40, levelsOf.L, modesOf.BYTE);
    expect(() => encodeQrMatrix("a".repeat(capacity + 1), "L")).toThrow(
      "The amount of data is too big to be stored in a QR Code",
    );
    expect(() =>
      create("a".repeat(capacity + 1), { errorCorrectionLevel: "L" }),
    ).toThrow("The amount of data is too big to be stored in a QR Code");
  });
});

describe("encodeQrMatrix", () => {
  it("returns a square matrix of 0 and 1 modules", () => {
    const { modules, size } = encodeQrMatrix("https://vllnt.com", "M");
    expect(size).toBe(25);
    expect(modules).toHaveLength(size * size);
    expect(modules.every((module) => module === 0 || module === 1)).toBe(true);
  });

  it("grows the symbol with the level at equal text", () => {
    const text = "https://vllnt.com/a/path/long/enough/to/cross/a/version";
    const sizes = LEVELS.map((level) => encodeQrMatrix(text, level).size);
    expect(sizes).toEqual([...sizes].sort((a, b) => a - b));
    expect(new Set(sizes).size).toBeGreaterThan(1);
  });

  it("rejects empty text like qrcode", () => {
    expect(() => encodeQrMatrix("", "M")).toThrow("No input text");
    expect(() => create("", { errorCorrectionLevel: "M" })).toThrow(
      "No input text",
    );
  });

  it("falls back to level M for an unknown level", () => {
    const unknown = encodeQrMatrix("fallback", "X" as QrErrorLevel);
    expect(unknown).toEqual(encodeQrMatrix("fallback", "M"));
  });

  it("encodes a lone surrogate as U+FFFD where qrcode throws", () => {
    expect(() => create("\uD800", { errorCorrectionLevel: "M" })).toThrow(
      URIError,
    );
    expect(encodeQrMatrix("\uD800", "M")).toEqual(encodeQrMatrix("�", "M"));
    expectSameAsQrcode("�", "M");
  });
});
