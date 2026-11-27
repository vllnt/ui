import { type ClassValue, cx } from "./cx";

export type { ClassArray, ClassDictionary, ClassValue } from "./cx";
export { cx } from "./cx";

export type ClassProperty =
  | { class: ClassValue; className?: never }
  | { class?: never; className: ClassValue }
  | { class?: never; className?: never };

type ConfigSchema = Record<string, Record<string, ClassValue>>;

type StringToBoolean<TValue> = TValue extends "false" | "true"
  ? boolean
  : TValue;

type ConfigVariants<TSchema extends ConfigSchema> = {
  [Variant in keyof TSchema]?:
    | null
    | StringToBoolean<keyof TSchema[Variant]>
    | undefined;
};

type ConfigVariantsMulti<TSchema extends ConfigSchema> = {
  [Variant in keyof TSchema]?:
    | StringToBoolean<keyof TSchema[Variant]>
    | StringToBoolean<keyof TSchema[Variant]>[]
    | undefined;
};

type Config<TSchema> = TSchema extends ConfigSchema
  ? {
      compoundVariants?: ((
        | ConfigVariants<TSchema>
        | ConfigVariantsMulti<TSchema>
      ) &
        ClassProperty)[];
      defaultVariants?: ConfigVariants<TSchema>;
      variants?: TSchema;
    }
  : never;

type Props<TSchema> = TSchema extends ConfigSchema
  ? ClassProperty & ConfigVariants<TSchema>
  : ClassProperty;

/** The variant props of a `cva` function, without `class` and `className`. */
export type VariantProps<TComponent extends (props: never) => unknown> = Omit<
  Exclude<Parameters<TComponent>[0], undefined>,
  "class" | "className"
>;

type LooseProps = { class?: ClassValue; className?: ClassValue } & Record<
  string,
  unknown
>;

type LooseConfig = {
  compoundVariants?: LooseProps[];
  defaultVariants?: Record<string, unknown>;
  variants?: ConfigSchema;
};

/** `true`, `false` and `0` select the variants named "true", "false" and "0". */
function toKey(value: unknown): unknown {
  if (typeof value === "boolean") return `${value}`;
  return value === 0 ? "0" : value;
}

function selectedClasses(
  { defaultVariants, variants = {} }: LooseConfig,
  props: LooseProps | undefined,
): ClassValue[] {
  return Object.keys(variants).map((name) => {
    const value = props?.[name];
    if (value === null) return;
    const key = toKey(value) || toKey(defaultVariants?.[name]);
    return variants[name]?.[String(key)];
  });
}

function compoundClasses(
  { compoundVariants, defaultVariants }: LooseConfig,
  props: LooseProps | undefined,
): ClassValue[] | undefined {
  const given = Object.entries(props ?? {}).filter(
    ([, value]) => value !== undefined,
  );
  const resolved = { ...defaultVariants, ...Object.fromEntries(given) };
  return compoundVariants?.flatMap(
    ({ class: classValue, className: classNameValue, ...options }) =>
      Object.entries(options).every(([name, expected]) =>
        Array.isArray(expected)
          ? expected.includes(resolved[name])
          : resolved[name] === expected,
      )
        ? [classValue, classNameValue]
        : [],
  );
}

/**
 * Builds a function that turns variant props into a class string, like
 * `class-variance-authority` 0.7.1, which the package no longer depends on: the
 * base classes, the class of each selected variant (the default one for an
 * `undefined` prop, none for `null`), the classes of every matching compound
 * variant, then the `class` and `className` props. `variants.test.ts` compares
 * the output with the real package, and the types mirror theirs so the variant
 * props inferred from a config stay the same.
 *
 * @example
 * ```ts
 * const button = cva("rounded", {
 *   variants: { size: { sm: "h-8", lg: "h-10" } },
 *   defaultVariants: { size: "sm" },
 * });
 * button({ size: "lg" }); // "rounded h-10"
 * ```
 */
export function cva<TSchema>(
  base?: ClassValue,
  config?: Config<TSchema>,
): (props?: Props<TSchema>) => string;
export function cva(
  base?: ClassValue,
  config?: LooseConfig,
): (props?: LooseProps) => string {
  return (props) =>
    config?.variants === undefined
      ? cx(base, props?.class, props?.className)
      : cx(
          base,
          selectedClasses(config, props),
          compoundClasses(config, props),
          props?.class,
          props?.className,
        );
}
