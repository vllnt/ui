// Class groups tailwind-merge needs for the classes this library ships, plus the
// groups that share a key with a color group: a color accepts any value, so
// without them a class such as bg-cover would read as a color and replace it.
// The full default config adds about 4 KB for groups no component uses. A class
// from a group missing here stays in the output next to a class it should
// replace; add the group from the tailwind-merge default config.
import {
  type Config,
  createTailwindMerge,
  fromTheme,
  validators,
} from "tailwind-merge";

const {
  isAny,
  isArbitraryImage,
  isArbitraryLength,
  isArbitraryNumber,
  isArbitraryPosition,
  isArbitraryShadow,
  isArbitrarySize,
  isArbitraryValue,
  isInteger,
  isLength,
  isNumber,
  isPercent,
  isTshirtSize,
} = validators;

const colors = fromTheme("colors");
const spacing = fromTheme("spacing");
const blur = fromTheme("blur");
const borderColor = fromTheme("borderColor");
const borderRadius = fromTheme("borderRadius");
const borderSpacing = fromTheme("borderSpacing");
const borderWidth = fromTheme("borderWidth");
const invert = fromTheme("invert");
const gap = fromTheme("gap");
const gradientColorStops = fromTheme("gradientColorStops");
const gradientColorStopPositions = fromTheme("gradientColorStopPositions");
const inset = fromTheme("inset");
const margin = fromTheme("margin");
const opacity = fromTheme("opacity");
const padding = fromTheme("padding");
const saturate = fromTheme("saturate");
const scale = fromTheme("scale");
const space = fromTheme("space");
const translate = fromTheme("translate");
const getOverscroll = () => ["auto", "contain", "none"] as const;
const getOverflow = () =>
  ["auto", "hidden", "clip", "visible", "scroll"] as const;
const getSpacingWithAutoAndArbitrary = () =>
  ["auto", isArbitraryValue, spacing] as const;
const getSpacingWithArbitrary = () => [isArbitraryValue, spacing] as const;
const getLengthWithEmptyAndArbitrary = () =>
  ["", isLength, isArbitraryLength] as const;
const getNumberWithAutoAndArbitrary = () =>
  ["auto", isNumber, isArbitraryValue] as const;
const getPositions = () =>
  [
    "bottom",
    "center",
    "left",
    "left-bottom",
    "left-top",
    "right",
    "right-bottom",
    "right-top",
    "top",
  ] as const;
const getLineStyles = () =>
  ["solid", "dashed", "dotted", "double", "none"] as const;
const getBlendModes = () =>
  [
    "normal",
    "multiply",
    "screen",
    "overlay",
    "darken",
    "lighten",
    "color-dodge",
    "color-burn",
    "hard-light",
    "soft-light",
    "difference",
    "exclusion",
    "hue",
    "saturation",
    "color",
    "luminosity",
  ] as const;
const getAlign = () =>
  ["start", "end", "center", "between", "around", "evenly", "stretch"] as const;
const getZeroAndEmpty = () => ["", "0", isArbitraryValue] as const;
const getNumberAndArbitrary = () => [isNumber, isArbitraryValue];

type ClassGroup = Config<string, string>["classGroups"][string];

// Order matters: for one class prefix the first group whose check accepts the
// value wins, so `border-2` must meet the width group before the color group.
const classGroupEntries: readonly (readonly [string, ClassGroup])[] = [
  ["aspect", [{ aspect: ["auto", "square", "video", isArbitraryValue] }]],
  ["box", [{ box: ["border", "content"] }]],
  [
    "display",
    [
      "block",
      "inline-block",
      "inline",
      "flex",
      "inline-flex",
      "table",
      "inline-table",
      "table-caption",
      "table-cell",
      "table-column",
      "table-column-group",
      "table-footer-group",
      "table-header-group",
      "table-row-group",
      "table-row",
      "flow-root",
      "grid",
      "inline-grid",
      "contents",
      "list-item",
      "hidden",
    ],
  ],
  ["isolation", ["isolate", "isolation-auto"]],
  [
    "object-fit",
    [{ object: ["contain", "cover", "fill", "none", "scale-down"] }],
  ],
  ["overflow", [{ overflow: getOverflow() }]],
  ["overflow-x", [{ "overflow-x": getOverflow() }]],
  ["overflow-y", [{ "overflow-y": getOverflow() }]],
  ["overscroll", [{ overscroll: getOverscroll() }]],
  ["position", ["static", "fixed", "absolute", "relative", "sticky"]],
  ["inset", [{ inset: [inset] }]],
  ["inset-x", [{ "inset-x": [inset] }]],
  ["inset-y", [{ "inset-y": [inset] }]],
  ["start", [{ start: [inset] }]],
  ["end", [{ end: [inset] }]],
  ["top", [{ top: [inset] }]],
  ["right", [{ right: [inset] }]],
  ["bottom", [{ bottom: [inset] }]],
  ["left", [{ left: [inset] }]],
  ["visibility", ["visible", "invisible", "collapse"]],
  ["z", [{ z: ["auto", isInteger, isArbitraryValue] }]],
  ["basis", [{ basis: getSpacingWithAutoAndArbitrary() }]],
  ["flex-direction", [{ flex: ["row", "row-reverse", "col", "col-reverse"] }]],
  ["flex-wrap", [{ flex: ["wrap", "wrap-reverse", "nowrap"] }]],
  ["flex", [{ flex: ["1", "auto", "initial", "none", isArbitraryValue] }]],
  ["grow", [{ grow: getZeroAndEmpty() }]],
  ["shrink", [{ shrink: getZeroAndEmpty() }]],
  [
    "order",
    [{ order: ["first", "last", "none", isInteger, isArbitraryValue] }],
  ],
  ["grid-cols", [{ "grid-cols": [isAny] }]],
  [
    "col-start-end",
    [
      {
        col: [
          "auto",
          { span: ["full", isInteger, isArbitraryValue] },
          isArbitraryValue,
        ],
      },
    ],
  ],
  ["col-start", [{ "col-start": getNumberWithAutoAndArbitrary() }]],
  ["grid-rows", [{ "grid-rows": [isAny] }]],
  [
    "row-start-end",
    [
      {
        row: [
          "auto",
          { span: [isInteger, isArbitraryValue] },
          isArbitraryValue,
        ],
      },
    ],
  ],
  ["row-start", [{ "row-start": getNumberWithAutoAndArbitrary() }]],
  [
    "auto-rows",
    [{ "auto-rows": ["auto", "min", "max", "fr", isArbitraryValue] }],
  ],
  ["gap", [{ gap: [gap] }]],
  ["gap-x", [{ "gap-x": [gap] }]],
  ["gap-y", [{ "gap-y": [gap] }]],
  ["justify-content", [{ justify: ["normal", ...getAlign()] }]],
  [
    "align-items",
    [{ items: ["start", "end", "center", "baseline", "stretch"] }],
  ],
  [
    "align-self",
    [{ self: ["auto", "start", "end", "center", "stretch", "baseline"] }],
  ],
  [
    "place-items",
    [{ "place-items": ["start", "end", "center", "baseline", "stretch"] }],
  ],
  ["p", [{ p: [padding] }]],
  ["px", [{ px: [padding] }]],
  ["py", [{ py: [padding] }]],
  ["pt", [{ pt: [padding] }]],
  ["pr", [{ pr: [padding] }]],
  ["pb", [{ pb: [padding] }]],
  ["pl", [{ pl: [padding] }]],
  ["m", [{ m: [margin] }]],
  ["mx", [{ mx: [margin] }]],
  ["my", [{ my: [margin] }]],
  ["ms", [{ ms: [margin] }]],
  ["me", [{ me: [margin] }]],
  ["mt", [{ mt: [margin] }]],
  ["mr", [{ mr: [margin] }]],
  ["mb", [{ mb: [margin] }]],
  ["ml", [{ ml: [margin] }]],
  ["space-x", [{ "space-x": [space] }]],
  ["space-y", [{ "space-y": [space] }]],
  [
    "w",
    [
      {
        w: [
          "auto",
          "min",
          "max",
          "fit",
          "svw",
          "lvw",
          "dvw",
          isArbitraryValue,
          spacing,
        ],
      },
    ],
  ],
  ["min-w", [{ "min-w": [isArbitraryValue, spacing, "min", "max", "fit"] }]],
  [
    "max-w",
    [
      {
        "max-w": [
          isArbitraryValue,
          spacing,
          "none",
          "full",
          "min",
          "max",
          "fit",
          "prose",
          { screen: [isTshirtSize] },
          isTshirtSize,
        ],
      },
    ],
  ],
  [
    "h",
    [
      {
        h: [
          isArbitraryValue,
          spacing,
          "auto",
          "min",
          "max",
          "fit",
          "svh",
          "lvh",
          "dvh",
        ],
      },
    ],
  ],
  [
    "min-h",
    [
      {
        "min-h": [
          isArbitraryValue,
          spacing,
          "min",
          "max",
          "fit",
          "svh",
          "lvh",
          "dvh",
        ],
      },
    ],
  ],
  [
    "max-h",
    [
      {
        "max-h": [
          isArbitraryValue,
          spacing,
          "min",
          "max",
          "fit",
          "svh",
          "lvh",
          "dvh",
        ],
      },
    ],
  ],
  [
    "size",
    [{ size: [isArbitraryValue, spacing, "auto", "min", "max", "fit"] }],
  ],
  ["font-size", [{ text: ["base", isTshirtSize, isArbitraryLength] }]],
  ["font-style", ["italic", "not-italic"]],
  [
    "font-weight",
    [
      {
        font: [
          "thin",
          "extralight",
          "light",
          "normal",
          "medium",
          "semibold",
          "bold",
          "extrabold",
          "black",
          isArbitraryNumber,
        ],
      },
    ],
  ],
  ["font-family", [{ font: [isAny] }]],
  ["fvn-spacing", ["proportional-nums", "tabular-nums"]],
  [
    "tracking",
    [
      {
        tracking: [
          "tighter",
          "tight",
          "normal",
          "wide",
          "wider",
          "widest",
          isArbitraryValue,
        ],
      },
    ],
  ],
  ["line-clamp", [{ "line-clamp": ["none", isNumber, isArbitraryNumber] }]],
  [
    "leading",
    [
      {
        leading: [
          "none",
          "tight",
          "snug",
          "normal",
          "relaxed",
          "loose",
          isLength,
          isArbitraryValue,
        ],
      },
    ],
  ],
  [
    "list-style-type",
    [{ list: ["none", "disc", "decimal", isArbitraryValue] }],
  ],
  ["list-style-position", [{ list: ["inside", "outside"] }]],
  [
    "text-alignment",
    [{ text: ["left", "center", "right", "justify", "start", "end"] }],
  ],
  ["text-color", [{ text: [colors] }]],
  ["text-opacity", [{ "text-opacity": [opacity] }]],
  [
    "text-decoration",
    ["underline", "overline", "line-through", "no-underline"],
  ],
  [
    "underline-offset",
    [{ "underline-offset": ["auto", isLength, isArbitraryValue] }],
  ],
  ["text-transform", ["uppercase", "lowercase", "capitalize", "normal-case"]],
  ["text-overflow", ["truncate", "text-ellipsis", "text-clip"]],
  ["text-wrap", [{ text: ["wrap", "nowrap", "balance", "pretty"] }]],
  [
    "vertical-align",
    [
      {
        align: [
          "baseline",
          "top",
          "middle",
          "bottom",
          "text-top",
          "text-bottom",
          "sub",
          "super",
          isArbitraryValue,
        ],
      },
    ],
  ],
  [
    "whitespace",
    [
      {
        whitespace: [
          "normal",
          "nowrap",
          "pre",
          "pre-line",
          "pre-wrap",
          "break-spaces",
        ],
      },
    ],
  ],
  ["break", [{ break: ["normal", "words", "all", "keep"] }]],
  ["content", [{ content: ["none", isArbitraryValue] }]],
  ["bg-attachment", [{ bg: ["fixed", "local", "scroll"] }]],
  ["bg-clip", [{ "bg-clip": ["border", "padding", "content", "text"] }]],
  ["bg-opacity", [{ "bg-opacity": [opacity] }]],
  ["bg-origin", [{ "bg-origin": ["border", "padding", "content"] }]],
  ["bg-position", [{ bg: [...getPositions(), isArbitraryPosition] }]],
  [
    "bg-repeat",
    [{ bg: ["no-repeat", { repeat: ["", "x", "y", "round", "space"] }] }],
  ],
  ["bg-size", [{ bg: ["auto", "cover", "contain", isArbitrarySize] }]],
  [
    "bg-image",
    [
      {
        bg: [
          "none",
          { "gradient-to": ["t", "tr", "r", "br", "b", "bl", "l", "tl"] },
          isArbitraryImage,
        ],
      },
    ],
  ],
  ["bg-color", [{ bg: [colors] }]],
  ["gradient-from-pos", [{ from: [gradientColorStopPositions] }]],
  ["gradient-via-pos", [{ via: [gradientColorStopPositions] }]],
  ["gradient-to-pos", [{ to: [gradientColorStopPositions] }]],
  ["gradient-from", [{ from: [gradientColorStops] }]],
  ["gradient-via", [{ via: [gradientColorStops] }]],
  ["gradient-to", [{ to: [gradientColorStops] }]],
  ["rounded", [{ rounded: [borderRadius] }]],
  ["rounded-t", [{ "rounded-t": [borderRadius] }]],
  ["rounded-r", [{ "rounded-r": [borderRadius] }]],
  ["rounded-b", [{ "rounded-b": [borderRadius] }]],
  ["rounded-l", [{ "rounded-l": [borderRadius] }]],
  ["rounded-tl", [{ "rounded-tl": [borderRadius] }]],
  ["rounded-br", [{ "rounded-br": [borderRadius] }]],
  ["rounded-bl", [{ "rounded-bl": [borderRadius] }]],
  ["border-w", [{ border: [borderWidth] }]],
  ["border-w-x", [{ "border-x": [borderWidth] }]],
  ["border-w-y", [{ "border-y": [borderWidth] }]],
  ["border-w-s", [{ "border-s": [borderWidth] }]],
  ["border-w-e", [{ "border-e": [borderWidth] }]],
  ["border-w-t", [{ "border-t": [borderWidth] }]],
  ["border-w-r", [{ "border-r": [borderWidth] }]],
  ["border-w-b", [{ "border-b": [borderWidth] }]],
  ["border-w-l", [{ "border-l": [borderWidth] }]],
  ["border-opacity", [{ "border-opacity": [opacity] }]],
  ["border-style", [{ border: [...getLineStyles(), "hidden"] }]],
  ["divide-x", [{ "divide-x": [borderWidth] }]],
  ["divide-x-reverse", ["divide-x-reverse"]],
  ["divide-y", [{ "divide-y": [borderWidth] }]],
  ["divide-y-reverse", ["divide-y-reverse"]],
  ["divide-opacity", [{ "divide-opacity": [opacity] }]],
  ["divide-style", [{ divide: getLineStyles() }]],
  ["border-color", [{ border: [borderColor] }]],
  ["border-color-x", [{ "border-x": [borderColor] }]],
  ["border-color-y", [{ "border-y": [borderColor] }]],
  ["border-color-s", [{ "border-s": [borderColor] }]],
  ["border-color-e", [{ "border-e": [borderColor] }]],
  ["border-color-t", [{ "border-t": [borderColor] }]],
  ["border-color-r", [{ "border-r": [borderColor] }]],
  ["border-color-b", [{ "border-b": [borderColor] }]],
  ["border-color-l", [{ "border-l": [borderColor] }]],
  ["divide-color", [{ divide: [borderColor] }]],
  ["outline-style", [{ outline: ["", ...getLineStyles()] }]],
  ["outline-offset", [{ "outline-offset": [isLength, isArbitraryValue] }]],
  ["outline-w", [{ outline: [isLength, isArbitraryLength] }]],
  ["outline-color", [{ outline: [colors] }]],
  ["ring-w", [{ ring: getLengthWithEmptyAndArbitrary() }]],
  ["ring-w-inset", ["ring-inset"]],
  ["ring-color", [{ ring: [colors] }]],
  ["ring-opacity", [{ "ring-opacity": [opacity] }]],
  ["ring-offset-w", [{ "ring-offset": [isLength, isArbitraryLength] }]],
  ["ring-offset-color", [{ "ring-offset": [colors] }]],
  [
    "shadow",
    [{ shadow: ["", "inner", "none", isTshirtSize, isArbitraryShadow] }],
  ],
  ["shadow-color", [{ shadow: [isAny] }]],
  ["opacity", [{ opacity: [opacity] }]],
  [
    "mix-blend",
    [{ "mix-blend": [...getBlendModes(), "plus-lighter", "plus-darker"] }],
  ],
  ["bg-blend", [{ "bg-blend": getBlendModes() }]],
  ["filter", [{ filter: ["", "none"] }]],
  ["blur", [{ blur: [blur] }]],
  [
    "drop-shadow",
    [{ "drop-shadow": ["", "none", isTshirtSize, isArbitraryValue] }],
  ],
  ["saturate", [{ saturate: [saturate] }]],
  ["backdrop-invert", [{ "backdrop-invert": [invert] }]],
  ["border-collapse", [{ border: ["collapse", "separate"] }]],
  ["border-spacing", [{ "border-spacing": [borderSpacing] }]],
  ["border-spacing-x", [{ "border-spacing-x": [borderSpacing] }]],
  ["border-spacing-y", [{ "border-spacing-y": [borderSpacing] }]],
  ["caption", [{ caption: ["top", "bottom"] }]],
  [
    "transition",
    [
      {
        transition: [
          "none",
          "all",
          "",
          "colors",
          "opacity",
          "shadow",
          "transform",
          isArbitraryValue,
        ],
      },
    ],
  ],
  ["duration", [{ duration: getNumberAndArbitrary() }]],
  ["ease", [{ ease: ["linear", "in", "out", "in-out", isArbitraryValue] }]],
  [
    "animate",
    [
      {
        animate: ["none", "spin", "ping", "pulse", "bounce", isArbitraryValue],
      },
    ],
  ],
  ["transform", [{ transform: ["", "gpu", "none"] }]],
  ["scale", [{ scale: [scale] }]],
  ["rotate", [{ rotate: [isInteger, isArbitraryValue] }]],
  ["translate-x", [{ "translate-x": [translate] }]],
  ["translate-y", [{ "translate-y": [translate] }]],
  [
    "transform-origin",
    [
      {
        origin: [
          "center",
          "top",
          "top-right",
          "right",
          "bottom-right",
          "bottom",
          "bottom-left",
          "left",
          "top-left",
          isArbitraryValue,
        ],
      },
    ],
  ],
  ["accent", [{ accent: ["auto", colors] }]],
  ["appearance", [{ appearance: ["none", "auto"] }]],
  [
    "cursor",
    [
      {
        cursor: [
          "auto",
          "default",
          "pointer",
          "wait",
          "text",
          "move",
          "help",
          "not-allowed",
          "none",
          "context-menu",
          "progress",
          "cell",
          "crosshair",
          "vertical-text",
          "alias",
          "copy",
          "no-drop",
          "grab",
          "grabbing",
          "all-scroll",
          "col-resize",
          "row-resize",
          "n-resize",
          "e-resize",
          "s-resize",
          "w-resize",
          "ne-resize",
          "nw-resize",
          "se-resize",
          "sw-resize",
          "ew-resize",
          "ns-resize",
          "nesw-resize",
          "nwse-resize",
          "zoom-in",
          "zoom-out",
          isArbitraryValue,
        ],
      },
    ],
  ],
  ["pointer-events", [{ "pointer-events": ["none", "auto"] }]],
  ["resize", [{ resize: ["none", "y", "x", ""] }]],
  ["scroll-m", [{ "scroll-m": getSpacingWithArbitrary() }]],
  ["snap-type", [{ snap: ["none", "x", "y", "both"] }]],
  ["snap-strictness", [{ snap: ["mandatory", "proximity"] }]],
  [
    "touch",
    [
      {
        touch: ["auto", "none", "manipulation"],
      },
    ],
  ],
  [
    "touch-y",
    [
      {
        "touch-pan": ["y", "up", "down"],
      },
    ],
  ],
  ["select", [{ select: ["none", "text", "all", "auto"] }]],
  [
    "will-change",
    [
      {
        "will-change": [
          "auto",
          "scroll",
          "contents",
          "transform",
          isArbitraryValue,
        ],
      },
    ],
  ],
  ["fill", [{ fill: [colors, "none"] }]],
  ["stroke-w", [{ stroke: [isLength, isArbitraryLength, isArbitraryNumber] }]],
  ["stroke", [{ stroke: [colors, "none"] }]],
  ["sr", ["sr-only", "not-sr-only"]],
];

const config: Config<string, string> = {
  cacheSize: 500,
  classGroups: Object.fromEntries(classGroupEntries),
  conflictingClassGroupModifiers: {
    "font-size": ["leading"],
  },
  conflictingClassGroups: {
    "border-color": [
      "border-color-s",
      "border-color-e",
      "border-color-t",
      "border-color-r",
      "border-color-b",
      "border-color-l",
    ],
    "border-color-x": ["border-color-r", "border-color-l"],
    "border-color-y": ["border-color-t", "border-color-b"],
    "border-spacing": ["border-spacing-x", "border-spacing-y"],
    "border-w": [
      "border-w-s",
      "border-w-e",
      "border-w-t",
      "border-w-r",
      "border-w-b",
      "border-w-l",
    ],
    "border-w-x": ["border-w-r", "border-w-l"],
    "border-w-y": ["border-w-t", "border-w-b"],
    flex: ["basis", "grow", "shrink"],
    "font-size": ["leading"],
    gap: ["gap-x", "gap-y"],
    inset: [
      "inset-x",
      "inset-y",
      "start",
      "end",
      "top",
      "right",
      "bottom",
      "left",
    ],
    "inset-x": ["right", "left"],
    "inset-y": ["top", "bottom"],
    "line-clamp": ["display", "overflow"],
    m: ["mx", "my", "ms", "me", "mt", "mr", "mb", "ml"],
    mx: ["mr", "ml"],
    my: ["mt", "mb"],
    overflow: ["overflow-x", "overflow-y"],
    p: ["px", "py", "pt", "pr", "pb", "pl"],
    px: ["pr", "pl"],
    py: ["pt", "pb"],
    rounded: [
      "rounded-t",
      "rounded-r",
      "rounded-b",
      "rounded-l",
      "rounded-tl",
      "rounded-br",
      "rounded-bl",
    ],
    "rounded-b": ["rounded-br", "rounded-bl"],
    "rounded-l": ["rounded-tl", "rounded-bl"],
    "rounded-r": ["rounded-br"],
    "rounded-t": ["rounded-tl"],
    size: ["w", "h"],
    touch: ["touch-y"],
    "touch-y": ["touch"],
  },
  separator: ":",
  theme: {
    blur: ["none", "", isTshirtSize, isArbitraryValue],
    borderColor: [colors],
    borderRadius: ["none", "", "full", isTshirtSize, isArbitraryValue],
    borderSpacing: getSpacingWithArbitrary(),
    borderWidth: getLengthWithEmptyAndArbitrary(),
    colors: [isAny],
    gap: getSpacingWithArbitrary(),
    gradientColorStopPositions: [isPercent, isArbitraryLength],
    gradientColorStops: [colors],
    inset: getSpacingWithAutoAndArbitrary(),
    invert: getZeroAndEmpty(),
    margin: getSpacingWithAutoAndArbitrary(),
    opacity: getNumberAndArbitrary(),
    padding: getSpacingWithArbitrary(),
    saturate: getNumberAndArbitrary(),
    scale: getNumberAndArbitrary(),
    space: getSpacingWithArbitrary(),
    spacing: [isLength, isArbitraryLength],
    translate: getSpacingWithArbitrary(),
  },
};

export const mergeClasses = createTailwindMerge(() => config);
