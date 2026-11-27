/**
 * The class joiner. `cx` joins class names (strings, arrays,
 * `{ class: condition }` objects) without resolving Tailwind conflicts:
 * `cx("px-2", "px-4")` keeps both. Use it where nothing can conflict, or to stay
 * free of `tailwind-merge`; use `cn` to let a later class replace an earlier
 * one. This module imports nothing, so a component that joins its classes with
 * `cx` adds neither `tailwind-merge` nor the variant helpers to a bundle.
 */
export type ClassDictionary = object;
export type ClassArray = ClassValue[];
export type ClassValue =
  | bigint
  | boolean
  | ClassArray
  | ClassDictionary
  | null
  | number
  | string
  | undefined;

const append = (left: string, right: string): string =>
  left ? `${left} ${right}` : right;

function isClassArray(value: ClassValue): value is ClassArray {
  return Array.isArray(value);
}

function joinClassValue(value: ClassValue): string {
  if (typeof value === "string" || typeof value === "number") return `${value}`;
  if (typeof value !== "object" || value === null) return "";
  if (isClassArray(value)) {
    return value
      .map((item) => (item ? joinClassValue(item) : ""))
      .filter((part) => part !== "")
      .reduce(append, "");
  }
  return Object.keys(value)
    .filter((key) => Reflect.get(value, key))
    .reduce(append, "");
}

/**
 * Joins class names like `clsx` 2.1.1, which the package no longer depends on:
 * strings and numbers as they are, arrays flattened, object keys kept when
 * their value is truthy, everything else dropped. An object contributes its own
 * enumerable keys; `clsx` also reads inherited ones. `variants.test.ts`
 * compares the output with the real package.
 *
 * @example
 * ```ts
 * cx("a", ["b", { c: true, d: false }], null); // "a b c"
 * ```
 */
export function cx(...inputs: ClassValue[]): string {
  return joinClassValue(inputs);
}
