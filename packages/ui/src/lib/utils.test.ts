import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { getDefaultConfig, twMerge } from "tailwind-merge";
import { describe, expect, it } from "vitest";

import { cn } from "./utils";

/*
 * `cn` merges with a pruned tailwind-merge config (see
 * `tailwind-merge-config.ts`). It must behave like the full `twMerge` for every
 * class the library ships. These tests read every class string in `src` and
 * compare the two mergers.
 */

const SRC_ROOT = join(__dirname, "..");
const SKIPPED = /\.(?:test|stories|visual|visual\.fixture)\.tsx?$/;
const STRING_LITERAL = /(["'`])((?:\\.|(?!\1)[^\n\\])*)\1/g;

function sourceFiles(): string[] {
  return readdirSync(SRC_ROOT, { recursive: true })
    .map(String)
    .filter((file) => /\.tsx?$/.test(file) && !SKIPPED.test(file))
    .filter((file) => !file.includes("__tests__"))
    .toSorted();
}

function isClassString(text: string): boolean {
  const withoutBrackets = text.replaceAll(/\[[^\]]*]/g, "");
  return /\s/.test(text) && !/[$;{}]/.test(withoutBrackets);
}

/** Every string literal in `src` that reads like a list of Tailwind classes. */
const CLASS_STRINGS: string[] = sourceFiles().flatMap((file) =>
  [...readFileSync(join(SRC_ROOT, file), "utf8").matchAll(STRING_LITERAL)]
    .map((match) => match[2] ?? "")
    .filter(isClassString),
);

/** The distinct classes of those strings, with variants and `!` removed. */
const BASE_CLASSES: string[] = [
  ...new Set(
    CLASS_STRINGS.flatMap((text) => text.split(/\s+/)).flatMap((token) => {
      const base = (token.split(":").pop() ?? "").replace(/^!/, "");
      return base === "" || base.startsWith("[") ? [] : [base];
    }),
  ),
].toSorted();

/** The classes the full config knows: it drops the second of two equal ones. */
const TAILWIND_CLASSES: string[] = BASE_CLASSES.filter(
  (name) => twMerge(`${name} ${name}`) === name,
);

/**
 * One class per group of classes that replace each other, found with the
 * full merger: a class joins the first group whose first class it replaces.
 */
function representatives(classes: string[]): string[] {
  return classes.reduce<string[]>((found, candidate) => {
    const replaces = found.some(
      (known) => twMerge(`${known} ${candidate}`) === candidate,
    );
    return replaces ? found : [...found, candidate];
  }, []);
}

const LONG_TIMEOUT = 60_000;

type ClassDefinition = unknown;

/** Every fixed class name the full config knows, such as `bg-cover`. */
function vocabulary(): string[] {
  const config = getDefaultConfig();
  const theme = config.theme as Record<string, unknown>;
  const expand = (prefix: string, items: ClassDefinition): string[] =>
    (Array.isArray(items) ? items : []).flatMap((item: unknown) => {
      if (typeof item === "string") {
        if (prefix === "") return [item];
        return [item === "" ? prefix : `${prefix}-${item}`];
      }
      if (typeof item === "function") {
        // Theme getters hold class names; the other functions are checks.
        if (!("isThemeGetter" in item)) return [];
        return expand(prefix, (item as (value: unknown) => unknown)(theme));
      }
      if (typeof item === "object" && item !== null) {
        return Object.entries(item).flatMap(([key, value]) =>
          expand(prefix === "" ? key : `${prefix}-${key}`, value),
        );
      }
      return [];
    });
  return [
    ...new Set(
      Object.values(config.classGroups).flatMap((group) => expand("", group)),
    ),
  ].toSorted();
}

const firstPart = (name: string): string => name.split("-")[0] ?? name;

/** Values of other kinds that a color group would accept: `bg-[length:2px]`. */
const OPEN_VALUES = [
  "[#fff]",
  "[1px]",
  "[color:red]",
  "[length:2px]",
  "[position:top]",
  "[percentage:10%]",
  "[size:2px]",
  "[url(a.png)]",
  "[image:url(a.png)]",
  "[number:1]",
  "[family-name:x]",
  "[absolute-size:2px]",
  "[line-width:2px]",
  "[shadow:0_0_1px_red]",
];

describe("cn with the pruned tailwind-merge config", () => {
  it("finds the class strings of the library", () => {
    expect(CLASS_STRINGS.length).toBeGreaterThan(1000);
    expect(BASE_CLASSES.length).toBeGreaterThan(500);
    expect(TAILWIND_CLASSES.length).toBeGreaterThan(500);
  });

  it("merges every class string in src like the full twMerge", () => {
    const differing = CLASS_STRINGS.filter(
      (text) => cn(text) !== twMerge(text),
    );
    expect(differing).toEqual([]);
  });

  it("recognizes every class of src as the full twMerge does", () => {
    // A class that belongs to a group replaces its own duplicate; a class
    // the config misses stays twice. Both mergers must agree for each class.
    const differing = BASE_CLASSES.filter((name) => {
      const doubled = `${name} ${name}`;
      return cn(doubled) !== twMerge(doubled);
    });
    expect(differing).toEqual([]);
  });

  it(
    "resolves conflicts between every pair of class groups like twMerge",
    () => {
      const reps = representatives(TAILWIND_CLASSES);
      expect(reps.length).toBeGreaterThan(100);
      const differing = reps.flatMap((first) =>
        reps.flatMap((second) => {
          const text = `${first} ${second}`;
          return cn(text) === twMerge(text) ? [] : [text];
        }),
      );
      expect(differing).toEqual([]);
    },
    LONG_TIMEOUT,
  );

  it(
    "resolves conflicts inside each group like twMerge",
    () => {
      const differing = TAILWIND_CLASSES.flatMap((name) =>
        ["p-4", "text-sm", "bg-red-500", "rounded-md", "w-1/2", "z-10"].flatMap(
          (other) => {
            const text = `${other} ${name}`;
            return cn(text) === twMerge(text) ? [] : [text];
          },
        ),
      );
      expect(differing).toEqual([]);
    },
    LONG_TIMEOUT,
  );

  it(
    "keeps a class of a dropped group instead of reading it as another group",
    () => {
      // Without the group of `bg-cover`, a color group would take that class
      // in and `bg-primary` would remove it. Each class name of the full
      // config meets every library class that shares its first word. The
      // pruned merger either agrees with the full one or leaves both classes
      // alone; it never removes a class the full merger keeps.
      const reps = representatives(TAILWIND_CLASSES);
      const probes = [
        ...vocabulary(),
        ...[...new Set(reps.map(firstPart))].flatMap((word) =>
          OPEN_VALUES.map((value) => `${word}-${value}`),
        ),
      ];
      const differing = probes.flatMap((probe) =>
        reps
          .filter((rep) => firstPart(rep) === firstPart(probe))
          .flatMap((rep) =>
            [`${rep} ${probe}`, `${probe} ${rep}`].filter((text) => {
              const merged = cn(text);
              return merged !== twMerge(text) && merged !== text;
            }),
          ),
      );
      expect(differing).toEqual([]);
    },
    LONG_TIMEOUT,
  );

  it.each([
    "px-2 p-4",
    "p-4 px-2",
    "text-lg text-red-500",
    "text-red-500 text-lg",
    "text-sm leading-6 text-lg",
    "hover:bg-red-500 bg-blue-500 hover:bg-green-500",
    "!p-2 p-4",
    "-mt-2 mt-4",
    "size-4 w-6 h-8",
    "rounded-md rounded-t-lg rounded-tl-none",
    "border border-2 border-red-500 border-t",
    "shadow-md shadow-red-500 shadow-lg",
    "data-[state=open]:animate-in animate-none",
    "inset-0 top-2 inset-x-1",
    "bg-[url('/a.png')] bg-cover bg-red-500",
    "w-[calc(100%-2rem)] w-full",
    "bg-cover bg-red-500",
    "bg-red-500 bg-cover",
    "bg-[length:2px] bg-red-500",
    "border-spacing-2 border-red-500",
    "from-10% from-red-500",
    "text-opacity-50 text-red-500",
  ])("merges %s like twMerge", (text) => {
    expect(cn(text)).toBe(twMerge(text));
  });

  it("joins falsy and nested inputs like clsx", () => {
    expect(cn("p-2", false, null, undefined, ["m-1", { "p-4": true }])).toBe(
      "m-1 p-4",
    );
  });

  it("leaves classes of groups the library never uses unmerged", () => {
    expect(cn("columns-sm columns-lg")).toBe("columns-sm columns-lg");
    expect(twMerge("columns-sm columns-lg")).toBe("columns-lg");
  });
});
