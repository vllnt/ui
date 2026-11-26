import type { ClassValue as ReferenceClassValue } from "clsx";

/*
 * Props to call a `cva` function with, built from its config: each selecting
 * value of each variant plus `undefined`, `null` and a missing key, and the
 * props that trigger each compound variant. A config with more combinations than
 * MAX_COMBINATIONS keeps every nth one, so each run tries the same props.
 */

export type LooseConfig = {
  compoundVariants?: Record<string, unknown>[];
  defaultVariants?: Record<string, unknown>;
  variants?: Record<string, Record<string, unknown>>;
};

type Props = Record<string, unknown>;

const MAX_COMBINATIONS = 3000;

/** The values a prop can take to select `key`: "true", "false" and numbers read as strings too. */
function selecting(key: string): unknown[] {
  if (key === "true") return [true, "true"];
  if (key === "false") return [false, "false"];
  return /^\d+$/.test(key) ? [key, Number(key)] : [key];
}

function domain(variant: Record<string, unknown>): unknown[] {
  return [
    undefined,
    null,
    "missing-key",
    ...Object.keys(variant).flatMap(selecting),
  ];
}

/** The props at `index` of the cartesian product of the variant domains. */
function decode(names: string[], domains: unknown[][], index: number): Props {
  return Object.fromEntries(
    names.map((name, position) => {
      const size = domains
        .slice(position + 1)
        .reduce((product, values) => product * values.length, 1);
      const values = domains[position] ?? [];
      return [name, values[Math.floor(index / size) % values.length]];
    }),
  );
}

function sampled(variants: Record<string, Record<string, unknown>>): Props[] {
  const names = Object.keys(variants);
  const domains = names.map((name) => domain(variants[name] ?? {}));
  const total = domains.reduce((product, values) => product * values.length, 1);
  const stride = Math.max(1, Math.ceil(total / MAX_COMBINATIONS));
  return Array.from({ length: Math.ceil(total / stride) }, (_, step) =>
    decode(names, domains, step * stride),
  );
}

/** The props that make one compound variant match, once per value of an array option. */
function triggering(compound: Record<string, unknown>): Props[] {
  const options = Object.entries(compound).filter(
    ([name]) => name !== "class" && name !== "className",
  );
  const widest = Math.max(
    1,
    ...options.map(([, value]) => (Array.isArray(value) ? value.length : 1)),
  );
  return Array.from({ length: widest }, (_, position) =>
    Object.fromEntries(
      options.map(([name, value]) => [
        name,
        Array.isArray(value) ? value[position % value.length] : value,
      ]),
    ),
  );
}

const CLASS_PROPS: Props[] = [
  {},
  { class: "extra-class" },
  { className: "extra-name" },
  { class: ["extra-a", { "extra-b": true, "extra-c": false }], className: "x" },
];

export function propsToTry(config: LooseConfig): Props[] {
  const given = sampled(config.variants ?? {});
  const compound = (config.compoundVariants ?? []).flatMap(triggering);
  return [{}, ...given, ...compound].flatMap((props) =>
    CLASS_PROPS.map((classProps) => ({ ...props, ...classProps })),
  );
}

/** The shape of `cva` that both implementations share, with the config and props left to the caller. */
export type CvaImplementation = (
  base?: ReferenceClassValue,
  config?: never,
) => (props?: never) => string;

type Difference = { ours: string; props: Props; reference: string };

type Comparison = {
  base: ReferenceClassValue;
  config?: LooseConfig;
  ours: CvaImplementation;
  reference: CvaImplementation;
};

/**
 * Calls two `cva` implementations with the same base, config and each props of
 * {@link propsToTry}. This seam skips the config types, so a recorded or odd
 * config can go in; the type tests of `variants.test.ts` cover the types.
 *
 * @returns the props where the two outputs differ, empty when they agree.
 */
export function differences({
  base,
  config,
  ours,
  reference,
}: Comparison): Difference[] {
  const ourFunction = ours(base, config as never);
  const referenceFunction = reference(base, config as never);
  return propsToTry(config ?? {})
    .map((props) => ({
      ours: ourFunction(props as never),
      props,
      reference: referenceFunction(props as never),
    }))
    .filter((result) => result.ours !== result.reference);
}
