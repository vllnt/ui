import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { cva as referenceCva } from "class-variance-authority";
import { describe, expect, it, vi } from "vitest";

import { differences, type LooseConfig } from "./__tests__/variant-props";
import type * as Variants from "./variants";

/*
 * Every `cva` definition of the library, run through `cva` of this package and
 * through `class-variance-authority` for each combination of its variants. A
 * wrapper around `./variants` records each definition while the component
 * modules load and calls through to the real function, so a new definition
 * joins the comparison without an edit here.
 */

type Recorded = {
  base: Parameters<typeof Variants.cva>[0];
  config?: LooseConfig;
};

const recorded = vi.hoisted((): Recorded[] => []);

vi.mock("./variants", async (importOriginal) => {
  const original = await importOriginal<typeof Variants>();
  return {
    ...original,
    cva: (base: Recorded["base"], config?: LooseConfig) => {
      recorded.push({ base, config });
      return original.cva(base, config as never);
    },
  };
});

const SOURCE_ROOT = join(import.meta.dirname, "..");

const SKIPPED = /\.(?:test|stories|visual|visual\.fixture)\.tsx?$/;

const DEFINING_FILES = readdirSync(SOURCE_ROOT, { recursive: true })
  .map(String)
  .filter((file) => /\.tsx?$/.test(file) && !SKIPPED.test(file))
  .filter((file) => !file.includes("__tests__"))
  .filter((file) =>
    /from "[^"]*\/variants"/.test(
      readFileSync(join(SOURCE_ROOT, file), "utf8"),
    ),
  )
  .toSorted();

await Promise.all(
  DEFINING_FILES.map(
    (file) => import(/* @vite-ignore */ join(SOURCE_ROOT, file)),
  ),
);

const original = await vi.importActual<typeof Variants>("./variants");

describe("every cva definition of the library", () => {
  it("is found in the component modules", () => {
    expect(DEFINING_FILES.length).toBeGreaterThanOrEqual(45);
    expect(recorded.length).toBeGreaterThanOrEqual(DEFINING_FILES.length);
  });

  it.each(recorded.map((definition, index) => [index, definition] as const))(
    "resolves like class-variance-authority: definition %i",
    (_index, { base, config }) => {
      expect(
        differences({
          base,
          config,
          ours: original.cva,
          reference: referenceCva,
        }),
      ).toEqual([]);
    },
  );
});
