import type { Config } from "tailwindcss";
import type { PluginAPI } from "tailwindcss/types/config";

/*
 * The animation utilities of `tailwindcss-animate` 1.0.7 (animate-in,
 * fade-in, zoom-out, slide-in-from-top, duration-*, ...), kept in the library so
 * the preset needs no extra package. The CSS they generate is identical.
 *
 * Rule order and declaration order show in the CSS, so the lists below keep the
 * order of the original plugin. The lint sorts the keys of an object literal,
 * so each ordered list is an array or an entries table instead.
 */

type Values = Record<string, string>;
type Declarations = Record<string, string>;
type Phase = "enter" | "exit";
type Slide = readonly [
  name: string,
  phase: Phase,
  axis: "x" | "y",
  flip: boolean,
];

const withoutDefault = (values: Values): Values =>
  Object.fromEntries(
    Object.entries(values).filter(([key]) => key !== "DEFAULT"),
  );

const RESET_NAMES = [
  "opacity",
  "scale",
  "rotate",
  "translate-x",
  "translate-y",
];

/** The rule body of `animate-in` and `animate-out`. */
const animation = (phase: Phase, duration: string): Declarations =>
  Object.fromEntries<string>([
    ["animationName", phase],
    ["animationDuration", duration],
    // Reset the variables the other classes of the phase leave open.
    ...RESET_NAMES.map((name): [string, string] => [
      `--tw-${phase}-${name}`,
      "initial",
    ]),
  ]);

function addBaseUtilities({ addUtilities, theme }: PluginAPI): void {
  const duration = theme<string>("animationDuration.DEFAULT");
  addUtilities([
    { "@keyframes enter": theme<Declarations>("keyframes.enter") },
    { "@keyframes exit": theme<Declarations>("keyframes.exit") },
    { ".animate-in": animation("enter", duration) },
    { ".animate-out": animation("exit", duration) },
  ]);
}

function addValueUtilities({ matchUtilities, theme }: PluginAPI): void {
  const match = (
    utilities: Record<string, (value: string) => Declarations>,
    key: string,
  ): void => {
    matchUtilities(utilities, { values: theme<Values>(key) });
  };
  match(
    {
      "fade-in": (value) => ({ "--tw-enter-opacity": value }),
      "fade-out": (value) => ({ "--tw-exit-opacity": value }),
    },
    "animationOpacity",
  );
  match(
    {
      "zoom-in": (value) => ({ "--tw-enter-scale": value }),
      "zoom-out": (value) => ({ "--tw-exit-scale": value }),
    },
    "animationScale",
  );
  match(
    {
      "spin-in": (value) => ({ "--tw-enter-rotate": value }),
      "spin-out": (value) => ({ "--tw-exit-rotate": value }),
    },
    "animationRotate",
  );
}

/** `top` and `left` start from a negative offset, `bottom` and `right` from a positive one. */
const SLIDES: readonly Slide[] = [
  ["slide-in-from-top", "enter", "y", true],
  ["slide-in-from-bottom", "enter", "y", false],
  ["slide-in-from-left", "enter", "x", true],
  ["slide-in-from-right", "enter", "x", false],
  ["slide-out-to-top", "exit", "y", true],
  ["slide-out-to-bottom", "exit", "y", false],
  ["slide-out-to-left", "exit", "x", true],
  ["slide-out-to-right", "exit", "x", false],
];

function addSlideUtilities({ matchUtilities, theme }: PluginAPI): void {
  matchUtilities(
    Object.fromEntries(
      SLIDES.map(
        ([name, phase, axis, flip]): [
          string,
          (value: string) => Declarations,
        ] => [
          name,
          (value) => ({
            [`--tw-${phase}-translate-${axis}`]: flip ? `-${value}` : value,
          }),
        ],
      ),
    ),
    { values: theme<Values>("animationTranslate") },
  );
}

function addTimingUtilities({
  addUtilities,
  matchUtilities,
  theme,
}: PluginAPI): void {
  matchUtilities(
    { duration: (value) => ({ animationDuration: value }) },
    { values: withoutDefault(theme<Values>("animationDuration")) },
  );
  matchUtilities(
    { delay: (value) => ({ animationDelay: value }) },
    { values: theme<Values>("animationDelay") },
  );
  matchUtilities(
    { ease: (value) => ({ animationTimingFunction: value }) },
    { values: withoutDefault(theme<Values>("animationTimingFunction")) },
  );
  addUtilities([
    { ".running": { animationPlayState: "running" } },
    { ".paused": { animationPlayState: "paused" } },
  ]);
}

function addPlaybackUtilities({ matchUtilities, theme }: PluginAPI): void {
  matchUtilities(
    { "fill-mode": (value) => ({ animationFillMode: value }) },
    { values: theme<Values>("animationFillMode") },
  );
  matchUtilities(
    { direction: (value) => ({ animationDirection: value }) },
    { values: theme<Values>("animationDirection") },
  );
  matchUtilities(
    { repeat: (value) => ({ animationIterationCount: value }) },
    { values: theme<Values>("animationRepeat") },
  );
}

const transformOf = (phase: Phase): string =>
  [
    `translate3d(var(--tw-${phase}-translate-x, 0), var(--tw-${phase}-translate-y, 0), 0)`,
    `scale3d(var(--tw-${phase}-scale, 1), var(--tw-${phase}-scale, 1), var(--tw-${phase}-scale, 1))`,
    `rotate(var(--tw-${phase}-rotate, 0))`,
  ].join(" ");

const config: Partial<Config> = {
  theme: {
    extend: {
      animationDelay: ({ theme }: PluginAPI) => ({
        ...theme<Values>("transitionDelay"),
      }),
      animationDirection: {
        alternate: "alternate",
        "alternate-reverse": "alternate-reverse",
        normal: "normal",
        reverse: "reverse",
      },
      animationDuration: ({ theme }: PluginAPI) => ({
        0: "0ms",
        ...theme<Values>("transitionDuration"),
      }),
      animationFillMode: {
        backwards: "backwards",
        both: "both",
        forwards: "forwards",
        none: "none",
      },
      animationOpacity: ({ theme }: PluginAPI) => ({
        DEFAULT: 0,
        ...theme<Values>("opacity"),
      }),
      animationRepeat: { 0: "0", 1: "1", infinite: "infinite" },
      animationRotate: ({ theme }: PluginAPI) => ({
        DEFAULT: "30deg",
        ...theme<Values>("rotate"),
      }),
      animationScale: ({ theme }: PluginAPI) => ({
        DEFAULT: 0,
        ...theme<Values>("scale"),
      }),
      animationTimingFunction: ({ theme }: PluginAPI) => ({
        ...theme<Values>("transitionTimingFunction"),
      }),
      animationTranslate: ({ theme }: PluginAPI) => ({
        DEFAULT: "100%",
        ...theme<Values>("translate"),
      }),
      keyframes: {
        enter: {
          from: {
            opacity: "var(--tw-enter-opacity, 1)",
            transform: transformOf("enter"),
          },
        },
        exit: {
          to: {
            opacity: "var(--tw-exit-opacity, 1)",
            transform: transformOf("exit"),
          },
        },
      },
    },
  },
};

/** Same utilities as `tailwindcss-animate`, in the same order. */
export const animatePlugin = {
  config,
  handler(api: PluginAPI): void {
    addBaseUtilities(api);
    addValueUtilities(api);
    addSlideUtilities(api);
    addTimingUtilities(api);
    addPlaybackUtilities(api);
  },
};
