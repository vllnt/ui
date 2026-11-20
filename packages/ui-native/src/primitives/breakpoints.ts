/**
 * Viewport widths, in points, where the web responsive props start to apply.
 * They are the Tailwind defaults that the web components rely on (`sm:`, `md:`
 * and `lg:` apply from 640, 768 and 1024 pixels); neither the design tokens
 * nor the Tailwind preset define their own, so native keeps one copy here.
 */
export const BREAKPOINTS = { lg: 1024, md: 768, sm: 640 } as const;

/** Name of a responsive breakpoint. */
export type Breakpoint = keyof typeof BREAKPOINTS;

const ASCENDING: readonly Breakpoint[] = ["sm", "md", "lg"];

/**
 * Picks a value for a viewport width the way the web `sm:`, `md:` and `lg:`
 * prefixes cascade: the base value first, then each breakpoint that has a
 * value overrides it from its width upward. A breakpoint without a value
 * keeps the one below it.
 *
 * @param width - Window width in points.
 * @param base - Value below the first breakpoint.
 * @param overrides - Value per breakpoint, or `undefined` to inherit.
 * @returns The value that applies at `width`.
 * @example
 * responsiveValue(800, 1, { lg: 4, md: 3, sm: undefined }); // 3
 */
export function responsiveValue<TValue>(
  width: number,
  base: TValue,
  overrides: Readonly<Record<Breakpoint, TValue | undefined>>,
): TValue {
  return ASCENDING.filter((name) => width >= BREAKPOINTS[name]).reduce(
    (value, name) => overrides[name] ?? value,
    base,
  );
}
