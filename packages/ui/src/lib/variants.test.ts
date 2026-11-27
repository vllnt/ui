import {
  cva as referenceCva,
  type VariantProps as ReferenceVariantProps,
} from "class-variance-authority";
import { type ClassValue as ReferenceClassValue, clsx } from "clsx";
import { describe, expect, expectTypeOf, it } from "vitest";

import { differences, type LooseConfig } from "./__tests__/variant-props";
import { cva, cx, type VariantProps } from "./variants";

/*
 * `cx` and `cva` replace `clsx` 2.1.1 and `class-variance-authority` 0.7.1.
 * Both packages stay devDependencies as the oracle: every table below compares
 * our output with theirs. `variants-definitions.test.ts` does the same for every
 * `cva` definition of the library.
 */

const HOLEY_ARRAY = Object.assign([], { 0: "first", 2: "third" });

class WithInheritedKey {}
Object.assign(WithInheritedKey.prototype, { inherited: true });
const INHERITED = new WithInheritedKey();

/** The linter reorders the keys of an object literal; here their order is the point. */
const KEY_AFTER_EMPTY_KEY = Object.fromEntries([
  ["a", true],
  ["", true],
]);

const CLASS_WITH_FIELDS = new (class {
  readonly field = true;
})();

function nested(depth: number): ReferenceClassValue {
  return depth === 0
    ? "deep"
    : [nested(depth - 1), { [`level-${depth}`]: true }];
}

const CX_CASES: [string, ReferenceClassValue[]][] = [
  ["no input", []],
  ["strings", ["a", "b", "c"]],
  ["blank and padded strings", ["", " ", "a  b", " c ", "\td\n"]],
  ["numbers", [0, 1, -1, 1.5, Number.NaN, Number.POSITIVE_INFINITY, 1e21, -0]],
  ["booleans, null and undefined", [true, false, null, undefined]],
  ["bigint", [10n, 0n]],
  ["functions and symbols", [() => "x", Symbol("s"), Math.max]],
  ["arrays", [["a", ["b", ["c", [0, "d", [[], [[]]]]]]], []]],
  ["falsy array items", [["a", null, false, 0, "", undefined, "b"]]],
  ["array hole", [HOLEY_ARRAY]],
  ["objects", [{ a: true, b: false, c: 1, d: 0, e: "", f: "x", g: null }]],
  ["object with object and array values", [{ a: {}, b: [], c: [0] }]],
  ["keys with spaces", [{ "a b": true, "c  d ": 1 }]],
  ["empty key", [{ "": true, a: true }, { "": true }, KEY_AFTER_EMPTY_KEY]],
  ["integer keys sort first", [{ 1: true, 2: true, a: true, b: true }]],
  ["objects in arrays in objects", [["a", { b: true, c: ["d", { e: 1 }] }]]],
  ["a Date, a Map, a Set", [new Date(0), new Map([["a", 1]]), new Set(["a"])]],
  ["a class instance", [CLASS_WITH_FIELDS]],
  ["null prototype", [Object.assign(Object.create(null), { a: true })]],
  ["array-like object", [{ 0: "a", length: 1 }]],
  ["mixed", ["a", 0, ["b", { c: true }], null, 3, { d: 1 }, false, "e f"]],
  ["deep nesting", [nested(60)]],
];

describe("cx", () => {
  it.each(CX_CASES)("joins like clsx: %s", (_name, inputs) => {
    expect(cx(...inputs)).toBe(clsx(...inputs));
  });

  it("joins an array argument like clsx, as `cn` passes its inputs", () => {
    expect(cx(["a", { b: true }, ["c"]])).toBe(clsx(["a", { b: true }, ["c"]]));
  });

  it("reads own enumerable keys only, where clsx also reads inherited ones", () => {
    expect(clsx(INHERITED)).toBe("inherited");
    expect(cx(INHERITED)).toBe("");
  });
});

const SIZE = { lg: "h-10 px-4", md: ["h-9", { "px-3": true }], sm: "h-8" };

const MANY_VARIANTS = Object.fromEntries(
  ["a", "b", "c", "d", "e", "f"].map((name) => [
    name,
    Object.fromEntries(
      ["one", "two", "three", "four", "five"].map((key) => [
        key,
        `${name}-${key}`,
      ]),
    ),
  ]),
);

const CVA_CASES: [string, ReferenceClassValue, LooseConfig | undefined][] = [
  ["a base only", "inline-flex gap-2", undefined],
  ["no base", undefined, { variants: { size: SIZE } }],
  ["an array and object base", ["a", { b: true, c: false }, ["d"]], undefined],
  [
    "string variants with defaults",
    "base",
    {
      defaultVariants: { size: "md", tone: "neutral" },
      variants: {
        size: SIZE,
        tone: { danger: "text-red", neutral: "text-gray", none: undefined },
      },
    },
  ],
  [
    "string variants without defaults",
    "base",
    { variants: { size: SIZE, tone: { danger: "red", neutral: "gray" } } },
  ],
  [
    "boolean variants",
    "base",
    {
      defaultVariants: { rounded: false },
      variants: {
        loading: { false: "idle", true: "busy" },
        rounded: { false: "rounded-none", true: "rounded-full" },
      },
    },
  ],
  [
    "a boolean variant with only a true key",
    "base",
    { variants: { disabled: { true: "opacity-50" } } },
  ],
  [
    "numeric keys and a default of 0",
    "base",
    {
      defaultVariants: { level: 0 },
      variants: { level: { 0: "zero", 1: "one", 2: ["two", { deep: true }] } },
    },
  ],
  [
    "numeric keys and a default of 1",
    "base",
    {
      defaultVariants: { level: 1 },
      variants: { level: { 0: "zero", 1: "one" } },
    },
  ],
  [
    "an empty-string key and class values that are empty",
    "base",
    {
      defaultVariants: { tone: "" },
      variants: { tone: { "": "blank", a: "", b: undefined, c: null } },
    },
  ],
  [
    "compound variants on strings, arrays and booleans",
    "base",
    {
      compoundVariants: [
        { class: "compound-class", size: "sm", tone: "danger" },
        { className: "compound-name", size: ["sm", "md"] },
        { class: ["a", { b: true }], className: "c", loading: true },
        { class: "never", loading: false, size: "lg", tone: ["danger"] },
        { class: "always" },
      ],
      defaultVariants: { size: "md" },
      variants: {
        loading: { false: "idle", true: "busy" },
        size: SIZE,
        tone: { danger: "red", neutral: "gray" },
      },
    },
  ],
  [
    "compound variants that match a default",
    "base",
    {
      compoundVariants: [
        { class: "from-default", tone: "neutral" },
        { class: "from-default-boolean", loading: false },
      ],
      defaultVariants: { loading: false, tone: "neutral" },
      variants: {
        loading: { false: "idle", true: "busy" },
        tone: { danger: "red", neutral: "gray" },
      },
    },
  ],
  [
    "compound variants that a config without variants ignores",
    "base",
    {
      compoundVariants: [{ class: "one" }, { class: "two", size: "sm" }],
      defaultVariants: { size: "sm" },
    },
  ],
  [
    "compound variants without defaults",
    "base",
    {
      compoundVariants: [
        { class: "one", size: "sm" },
        { class: "two", size: ["lg", "md"] },
      ],
      variants: { size: SIZE },
    },
  ],
  [
    "more combinations than the matrix keeps",
    "base",
    { variants: MANY_VARIANTS },
  ],
];

describe("cva", () => {
  it.each(CVA_CASES)(
    "resolves like class-variance-authority: %s",
    (_name, base, config) => {
      expect(
        differences({ base, config, ours: cva, reference: referenceCva }),
      ).toEqual([]);
    },
  );

  it("selects the default variant for an undefined prop and none for null", () => {
    const button = cva("base", {
      defaultVariants: { size: "sm" },
      variants: { size: { lg: "h-10", sm: "h-8" } },
    });

    expect(button()).toBe("base h-8");
    expect(button({ size: undefined })).toBe("base h-8");
    expect(button({ size: null })).toBe("base");
    expect(button({ size: "lg" })).toBe("base h-10");
  });

  it("reads true and false props as the variants named true and false", () => {
    const badge = cva("base", {
      variants: { dot: { false: "no-dot", true: "dot" } },
    });

    expect(badge({ dot: true })).toBe("base dot");
    expect(badge({ dot: false })).toBe("base no-dot");
  });

  it("adds compound variants after the variants, then class and className", () => {
    const button = cva("base", {
      compoundVariants: [
        { class: "compound", size: ["sm", "lg"], tone: "danger" },
      ],
      variants: {
        size: { lg: "h-10", sm: "h-8" },
        tone: { danger: "red", neutral: "gray" },
      },
    });

    expect(button({ size: "lg", tone: "danger" })).toBe(
      "base h-10 red compound",
    );
    expect(button({ size: "lg", tone: "neutral" })).toBe("base h-10 gray");
    expect(button({ className: "mine", size: "sm", tone: "danger" })).toBe(
      "base h-8 red compound mine",
    );
    expect(button({ class: ["a", { b: true }], tone: "danger" })).toBe(
      "base red a b",
    );
  });

  it("ignores compound variants when there are no variants", () => {
    expect(cva("base")({ className: "mine" })).toBe("base mine");
  });
});

const ours = cva("base", {
  compoundVariants: [
    { class: "x", size: ["lg", "sm"], tone: "danger" },
    { className: "y", loading: true },
  ],
  defaultVariants: { loading: false, size: "sm" },
  variants: {
    loading: { false: "idle", true: "busy" },
    size: { lg: "h-10", sm: "h-8" },
    tone: { danger: "red", neutral: "gray" },
  },
});

const reference = referenceCva("base", {
  compoundVariants: [
    { class: "x", size: ["lg", "sm"], tone: "danger" },
    { className: "y", loading: true },
  ],
  defaultVariants: { loading: false, size: "sm" },
  variants: {
    loading: { false: "idle", true: "busy" },
    size: { lg: "h-10", sm: "h-8" },
    tone: { danger: "red", neutral: "gray" },
  },
});

describe("types", () => {
  it("infers the variant props that class-variance-authority infers", () => {
    expectTypeOf<VariantProps<typeof ours>>().toEqualTypeOf<
      ReferenceVariantProps<typeof reference>
    >();
    expectTypeOf<VariantProps<typeof ours>>().toEqualTypeOf<{
      loading?: boolean | null;
      size?: "lg" | "sm" | null;
      tone?: "danger" | "neutral" | null;
    }>();
    expectTypeOf<Parameters<typeof ours>[0]>().toExtend<
      Parameters<typeof reference>[0]
    >();
    expectTypeOf<Parameters<typeof reference>[0]>().toExtend<
      Parameters<typeof ours>[0]
    >();
    expect(ours({ size: "lg", tone: "danger" })).toBe(
      reference({ size: "lg", tone: "danger" }),
    );
  });

  it("accepts every class value that clsx accepts", () => {
    expectTypeOf<ReferenceClassValue>().toExtend<
      Parameters<typeof cx>[number]
    >();
  });
});
