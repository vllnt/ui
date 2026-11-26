import { type ClassValue, clsx } from "clsx";

/**
 * Joins class names (strings, arrays, `{ class: condition }` objects) without
 * resolving Tailwind conflicts: `cx("px-2", "px-4")` keeps both. Use it where
 * nothing can conflict, or to stay free of `tailwind-merge`; use `cn` to let
 * a later class replace an earlier one.
 *
 * This module imports `clsx` alone, so a component that joins its classes
 * with `cx` adds no `tailwind-merge` to a bundle.
 */
export function cx(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
