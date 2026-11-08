import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const designDirectory = join(scriptDirectory, "..");
const repositoryRoot = join(designDirectory, "..", "..");
const checkOnly = process.argv.includes("--check");

const paths = {
  contracts: join(designDirectory, "component-contracts.json"),
  contractsSchema: join(designDirectory, "component-contracts.schema.json"),
  coreContracts: join(repositoryRoot, "packages/ui-core/component-contracts.json"),
  coreContractsSchema: join(
    repositoryRoot,
    "packages/ui-core/component-contracts.schema.json",
  ),
  coreGenerated: join(
    repositoryRoot,
    "packages/ui-core/src/generated/design-tokens.ts",
  ),
  coreTokens: join(repositoryRoot, "packages/ui-core/tokens.json"),
  coreTokensSchema: join(repositoryRoot, "packages/ui-core/tokens.schema.json"),
  penpotTokens: join(designDirectory, "generated/penpot-tokens.json"),
  tokens: join(designDirectory, "tokens.json"),
  tokensSchema: join(designDirectory, "tokens.schema.json"),
  uiDefaultTheme: join(repositoryRoot, "packages/ui/themes/default.css"),
  uiProductThemes: join(repositoryRoot, "packages/ui/themes/products.css"),
  uiStyles: join(repositoryRoot, "packages/ui/styles.css"),
};

const parseJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const [designTokens, componentContracts] = await Promise.all([
  parseJson(paths.tokens),
  parseJson(paths.contracts),
]);

// Renderer-specific adjustment: DESIGN.md bans pure-black backgrounds on native.
const nativeColorOverrides = {
  dark: {
    background: "#050505",
  },
  light: {},
};

const expectedSemanticColors = [
  "background",
  "foreground",
  "card",
  "cardForeground",
  "popover",
  "popoverForeground",
  "primary",
  "primaryForeground",
  "secondary",
  "secondaryForeground",
  "muted",
  "mutedForeground",
  "accent",
  "accentForeground",
  "destructive",
  "destructiveForeground",
  "success",
  "successForeground",
  "warning",
  "warningForeground",
  "info",
  "infoForeground",
  "diffAdded",
  "diffRemoved",
  "border",
  "input",
  "ring",
];

const modes = ["dark", "light"];

// Tamagui requires a zIndex token group; core has no z-index scale, so this is
// Tamagui's conventional ladder rather than a value read from tokens.json.
const tamaguiZIndex = { 0: 0, 1: 100, 2: 200, 3: 300, 4: 400, 5: 500 };

// Tamagui theme keys that differ from the core role name.
const tamaguiRoleAliases = { border: "borderColor", foreground: "color" };

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const mapValues = (object, map) =>
  Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, map(value, key)]),
  );

function validateChannels(label, value) {
  const channels = value.split(/\s+/).map(Number);
  assert(
    channels.length === 3 && channels.every(Number.isFinite),
    `${label} must contain three OKLCH channels.`,
  );
  assert(
    channels[0] >= 0 && channels[0] <= 1 && channels[1] >= 0,
    `${label} has out-of-range OKLCH channels.`,
  );
}

function validateThemes() {
  const { fontFamily, fontWeight, scale } = designTokens.typography;
  const themes = Object.entries(designTokens.themes ?? {});
  assert(themes.length > 0, "tokens.json must define at least one product theme.");

  for (const [name, theme] of themes) {
    assert(
      /^[a-z][a-z0-9]*$/.test(name) && name !== "core",
      `Theme ${name} must be lowercase alphanumeric and not "core".`,
    );
    for (const mode of modes) {
      for (const [role, value] of Object.entries(theme.color?.[mode] ?? {})) {
        assert(
          role in designTokens.color.semantic,
          `Theme ${name}.color.${mode}.${role} is not a core color role.`,
        );
        validateChannels(`Theme ${name}.color.${mode}.${role}`, value);
      }
    }
    for (const [group, core] of [
      ["fontFamily", fontFamily],
      ["fontWeight", fontWeight],
      ["scale", scale],
    ]) {
      for (const step of Object.keys(theme.typography?.[group] ?? {})) {
        assert(
          step in core,
          `Theme ${name}.typography.${group}.${step} is not a core token.`,
        );
      }
    }
    for (const step of Object.keys(theme.radius ?? {})) {
      assert(step in designTokens.radius, `Theme ${name}.radius.${step} is not a core radius.`);
    }
  }
}

function validateSource() {
  assert(designTokens.name === "VLLNT UI", 'tokens.json name must be "VLLNT UI".');
  assert(
    designTokens.color?.format === "oklch-channel",
    'tokens.json color.format must be "oklch-channel".',
  );

  const colorEntries = Object.entries(designTokens.color?.semantic ?? {});
  assert(
    colorEntries.map(([name]) => name).join(",") ===
      expectedSemanticColors.join(","),
    "tokens.json semantic color names or order changed unexpectedly.",
  );

  const variables = new Set();
  for (const [name, color] of colorEntries) {
    assert(
      /^--[a-z][a-z0-9-]*$/.test(color.cssVariable),
      `Color ${name} has an invalid CSS variable.`,
    );
    assert(!variables.has(color.cssVariable), `Duplicate CSS variable ${color.cssVariable}.`);
    variables.add(color.cssVariable);
    for (const mode of ["light", "dark"]) {
      validateChannels(`Color ${name}.${mode}`, color[mode]);
    }
  }

  for (const [name, step] of Object.entries(designTokens.typography?.scale ?? {})) {
    assert(step.cssVariable, `Typography ${name} is missing cssVariable.`);
    assert(
      step.lineHeightCssVariable,
      `Typography ${name} is missing lineHeightCssVariable.`,
    );
  }

  validateThemes();

  for (const [component, contract] of Object.entries(
    componentContracts.components ?? {},
  )) {
    for (const value of Object.values(contract)) {
      assert(Array.isArray(value) && value.length > 0, `${component} contract lists cannot be empty.`);
      assert(new Set(value).size === value.length, `${component} contract lists must be unique.`);
    }
  }
}

function cssFontFamily(value) {
  return value.replaceAll(/'([^']+)'/g, '"$1"');
}

function declarationLines(mode, indentation) {
  return Object.values(designTokens.color.semantic).map(
    (color) => `${indentation}${color.cssVariable}: ${color[mode]};`,
  );
}

function typographyLines(indentation) {
  const lines = [
    `${indentation}--radius: ${designTokens.radius.md};`,
    `${indentation}/* Typography — theme-overridable font tokens (issue #465). */`,
  ];
  for (const family of Object.values(designTokens.typography.fontFamily)) {
    lines.push(
      `${indentation}${family.cssVariable}: ${cssFontFamily(family.value)};`,
    );
  }
  for (const weight of Object.values(designTokens.typography.fontWeight)) {
    if (weight.cssVariable) {
      lines.push(`${indentation}${weight.cssVariable}: ${weight.value};`);
    }
  }
  for (const step of Object.values(designTokens.typography.scale)) {
    lines.push(`${indentation}${step.cssVariable}: ${step.fontSize};`);
    lines.push(
      `${indentation}${step.lineHeightCssVariable}: ${step.lineHeight};`,
    );
  }
  return lines;
}

function renderDefaultTheme() {
  return [
    '/* Default theme variables. Values are OKLCH channels ("L C H"), consumed as oklch(var(--x)). */',
    ":root {",
    ...declarationLines("light", "  "),
    ...typographyLines("  "),
    "}",
    ".dark {",
    ...declarationLines("dark", "  "),
    "}",
    "",
  ].join("\n");
}

function renderStylesThemeBlock() {
  const typography = typographyLines("    ");
  const commentIndex = typography.findIndex((line) => line.includes("Typography"));
  typography.splice(
    commentIndex,
    1,
    "    /* Typography — theme-overridable font tokens (issue #465). Override any of",
    "       these on a theme scope to restyle the Text/Heading/Display/Prose primitives",
    "       without editing the library. Defaults reproduce the house style (sans, 600). */",
  );

  return [
    "/* Default theme variables */",
    "@layer base {",
    "  :root {",
    ...declarationLines("light", "    "),
    ...typography,
    "  }",
    "  .dark {",
    ...declarationLines("dark", "    "),
    "  }",
    "}",
    "",
    "",
  ].join("\n");
}

function replaceStylesThemeBlock(source) {
  const startMarker = "/* Default theme variables */\n@layer base {";
  const endMarker = "@layer base {\n  * {";
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert(start >= 0 && end > start, "Could not locate the generated token block in styles.css.");
  return `${source.slice(0, start)}${renderStylesThemeBlock()}${source.slice(end)}`;
}

function remToPoints(value) {
  const match = /^(-?[0-9]+(?:\.[0-9]+)?)rem$/.exec(value);
  assert(match, `Expected a rem value, received ${value}.`);
  return Number(match[1]) * 16;
}

function lengthToPoints(value) {
  return value.endsWith("rem") ? remToPoints(value) : Number.parseFloat(value);
}

function typeScaleToPoints(scale) {
  return mapValues(scale, (step) => {
    const fontSize = remToPoints(step.fontSize);
    return {
      fontSize,
      lineHeight: Number((fontSize * Number(step.lineHeight)).toFixed(3)),
    };
  });
}

function milliseconds(value) {
  const match = /^([0-9]+(?:\.[0-9]+)?)ms$/.exec(value);
  assert(match, `Expected an ms value, received ${value}.`);
  return Number(match[1]);
}

function relativeLuminance(hex) {
  const channels = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.040_45
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return (
    0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
  );
}

function contrastRatio(first, second) {
  const light = Math.max(relativeLuminance(first), relativeLuminance(second));
  const dark = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (light + 0.05) / (dark + 0.05);
}

function oklchToHex(channels) {
  const [lightness, chroma, hue] = channels.split(/\s+/).map(Number);
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const lPrime = lightness + 0.396_337_777_4 * a + 0.215_803_757_3 * b;
  const mPrime = lightness - 0.105_561_345_8 * a - 0.063_854_172_8 * b;
  const sPrime = lightness - 0.089_484_177_5 * a - 1.291_485_548 * b;
  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;
  const linear = [
    4.076_741_662_1 * l - 3.307_711_591_3 * m + 0.230_969_929_2 * s,
    -1.268_438_004_6 * l + 2.609_757_401_1 * m - 0.341_319_396_5 * s,
    -0.004_196_086_3 * l - 0.703_418_614_7 * m + 1.707_614_701 * s,
  ];
  const encoded = linear.map((channel) => {
    const value =
      channel <= 0.003_130_8
        ? 12.92 * channel
        : 1.055 * channel ** (1 / 2.4) - 0.055;
    return Math.round(Math.min(1, Math.max(0, value)) * 255);
  });
  return `#${encoded.map((value) => value.toString(16).padStart(2, "0")).join("")}`;
}

function nativeTokens() {
  const colors = { dark: {}, light: {} };
  for (const [name, color] of Object.entries(designTokens.color.semantic)) {
    colors.light[name] =
      nativeColorOverrides.light[name] ?? oklchToHex(color.light);
    colors.dark[name] =
      nativeColorOverrides.dark[name] ?? oklchToHex(color.dark);
  }
  for (const mode of ["light", "dark"]) {
    for (const [surface, foreground] of [
      ["card", "cardForeground"],
      ["destructive", "destructiveForeground"],
      ["info", "infoForeground"],
      ["primary", "primaryForeground"],
      ["secondary", "secondaryForeground"],
      ["success", "successForeground"],
      ["warning", "warningForeground"],
    ]) {
      assert(
        contrastRatio(colors[mode][surface], colors[mode][foreground]) >= 4.5,
        `Native ${mode} ${surface}/${foreground} contrast must be at least 4.5:1.`,
      );
    }
  }

  return {
    color: colors,
    motion: { duration: mapValues(designTokens.motion.duration, milliseconds) },
    radius: mapValues(designTokens.radius, lengthToPoints),
    spacing: mapValues(designTokens.spacing.scale, remToPoints),
    typography: {
      fontWeight: mapValues(
        designTokens.typography.fontWeight,
        (weight) => weight.value,
      ),
      scale: typeScaleToPoints(designTokens.typography.scale),
    },
  };
}

/** Core tokens with a product theme's overrides applied, still in source units. */
function resolveTheme(theme) {
  const { fontFamily, fontWeight, scale } = designTokens.typography;
  return {
    colors: Object.fromEntries(
      modes.map((mode) => [
        mode,
        {
          ...mapValues(designTokens.color.semantic, (color) => color[mode]),
          ...theme.color?.[mode],
        },
      ]),
    ),
    fontFamily: {
      ...mapValues(fontFamily, (family) => family.value),
      ...theme.typography?.fontFamily,
    },
    fontWeight: {
      ...mapValues(fontWeight, (weight) => weight.value),
      ...theme.typography?.fontWeight,
    },
    radius: { ...designTokens.radius, ...theme.radius },
    scale: mapValues(scale, (step, name) => ({
      fontSize: step.fontSize,
      lineHeight: step.lineHeight,
      ...theme.typography?.scale?.[name],
    })),
  };
}

const familyByVariable = Object.fromEntries(
  Object.entries(designTokens.typography.fontFamily).map(([name, family]) => [
    family.cssVariable,
    name,
  ]),
);

/** The family a `var(--font-x)` stack points at, or undefined for a literal stack. */
function referencedFamily(stack) {
  const variable = /^var\((--[a-z-]+)\)$/.exec(stack.trim())?.[1];
  if (variable === undefined) return undefined;
  assert(variable in familyByVariable, `Unknown font variable ${variable}.`);
  return familyByVariable[variable];
}

/** First face of a font stack: the one name native and design tools can load. */
function primaryFace(stack, families) {
  const reference = referencedFamily(stack);
  if (reference) return primaryFace(families[reference], families);
  return stack.split(",")[0].trim().replaceAll(/^['"]|['"]$/g, "");
}

function productThemeTokens() {
  return mapValues(designTokens.themes, (theme) => {
    const resolved = resolveTheme(theme);
    return {
      colors: mapValues(resolved.colors, (palette) =>
        mapValues(palette, oklchToHex),
      ),
      defaultMode: theme.defaultMode ?? null,
      label: theme.label,
      radius: mapValues(resolved.radius, lengthToPoints),
      typography: {
        fontFamily: mapValues(resolved.fontFamily, (stack) =>
          primaryFace(stack, resolved.fontFamily),
        ),
        fontWeight: resolved.fontWeight,
        scale: typeScaleToPoints(resolved.scale),
      },
    };
  });
}

function tamaguiThemeColors(palette) {
  const theme = Object.fromEntries(
    Object.entries(palette).map(([role, value]) => [
      tamaguiRoleAliases[role] ?? role,
      value,
    ]),
  );
  return { ...theme, placeholderColor: palette.mutedForeground };
}

/** Plain objects shaped for Tamagui's `createTokens` / `createTamagui`; no Tamagui import. */
function tamaguiTokens() {
  const native = nativeTokens();
  const capitalize = (word) => word[0].toUpperCase() + word.slice(1);
  return {
    color: Object.fromEntries(
      Object.entries(native.color).flatMap(([mode, palette]) =>
        Object.entries(palette).map(([role, value]) => [
          `${role}${capitalize(mode)}`,
          value,
        ]),
      ),
    ),
    radius: native.radius,
    size: native.spacing,
    space: native.spacing,
    zIndex: tamaguiZIndex,
  };
}

function tamaguiThemes() {
  return Object.fromEntries(
    Object.entries(productThemeTokens()).flatMap(([name, theme]) =>
      modes.map((mode) => [
        `${name}_${mode}`,
        tamaguiThemeColors(theme.colors[mode]),
      ]),
    ),
  );
}

function paletteLines(palette, indentation) {
  return Object.entries(designTokens.color.semantic).map(
    ([role, color]) => `${indentation}${color.cssVariable}: ${palette[role]};`,
  );
}

/** CSS custom properties for the typography a theme overrides (nothing it inherits). */
function themeTypographyLines(theme, indentation) {
  const { fontFamily, fontWeight, scale } = designTokens.typography;
  const typography = theme.typography ?? {};
  const lines = [];
  for (const [name, stack] of Object.entries(typography.fontFamily ?? {})) {
    lines.push(`${indentation}${fontFamily[name].cssVariable}: ${cssFontFamily(stack)};`);
  }
  for (const [name, value] of Object.entries(typography.fontWeight ?? {})) {
    if (fontWeight[name].cssVariable) {
      lines.push(`${indentation}${fontWeight[name].cssVariable}: ${value};`);
    }
  }
  for (const [name, step] of Object.entries(typography.scale ?? {})) {
    if (step.fontSize) {
      lines.push(`${indentation}${scale[name].cssVariable}: ${step.fontSize};`);
    }
    if (step.lineHeight) {
      lines.push(
        `${indentation}${scale[name].lineHeightCssVariable}: ${step.lineHeight};`,
      );
    }
  }
  return lines;
}

function renderProductThemes() {
  const blocks = Object.entries(designTokens.themes).flatMap(([name, theme]) => {
    const resolved = resolveTheme(theme);
    const selector = `html[data-theme="${name}"]`;
    return [
      `${selector} {`,
      ...paletteLines(resolved.colors.light, "  "),
      `  --radius: ${resolved.radius.md};`,
      ...themeTypographyLines(theme, "  "),
      "}",
      "",
      `${selector}.dark {`,
      ...paletteLines(resolved.colors.dark, "  "),
      "}",
      "",
    ];
  });
  return [
    "/*",
    " * Product themes. Generated from packages/design/tokens.json; do not edit.",
    " * Applied via `data-theme=\"<name>\"` on the document root; the `.dark` class",
    " * selects the dark palette. Each palette is complete (core roles plus the",
    " * theme's overrides), as OKLCH channels (\"L C H\") read as oklch(var(--x)).",
    " * Fonts, type steps and --radius are set once and apply in both modes.",
    " * The `html[data-theme]` prefix outranks the base `.dark` class.",
    " */",
    "",
    ...blocks,
  ].join("\n");
}

const penpotToken = (value, type) => ({ $value: value, $type: type });
const penpotNumber = (length) => String(Number(lengthToPoints(length).toFixed(3)));
const penpotWeight = (weight) => penpotToken(String(weight), "fontWeights");
const penpotRadius = (length) => penpotToken(penpotNumber(length), "borderRadius");
const penpotSize = (length) => penpotToken(penpotNumber(length), "fontSizes");

/** A font-family token: a reference for `var(--font-x)`, else the primary face. */
function penpotFamily(stack) {
  const reference = referencedFamily(stack);
  return penpotToken(
    reference ? `{font.family.${reference}}` : [primaryFace(stack, {})],
    "fontFamilies",
  );
}

/** Only what a theme overrides; the core set supplies the rest. */
function penpotThemeOverrides(theme) {
  const { fontFamily, fontWeight, scale } = theme.typography ?? {};
  const sizes = Object.entries(scale ?? {}).filter(([, step]) => step.fontSize);
  const font = {
    ...(fontFamily && { family: mapValues(fontFamily, penpotFamily) }),
    ...(sizes.length > 0 && {
      size: Object.fromEntries(
        sizes.map(([name, step]) => [name, penpotSize(step.fontSize)]),
      ),
    }),
    ...(fontWeight && { weight: mapValues(fontWeight, penpotWeight) }),
  };
  return {
    ...(Object.keys(font).length > 0 && { font }),
    ...(theme.radius && { radius: mapValues(theme.radius, penpotRadius) }),
  };
}

function penpotTokens() {
  const themeNames = Object.keys(designTokens.themes);
  const core = resolveTheme({});
  const setNames = [
    "vllnt/core",
    ...themeNames.flatMap((name) => modes.map((mode) => `vllnt/${name}/${mode}`)),
  ];

  const sets = {
    "vllnt/core": {
      font: {
        family: mapValues(core.fontFamily, penpotFamily),
        size: mapValues(core.scale, (step) => penpotSize(step.fontSize)),
        weight: mapValues(core.fontWeight, penpotWeight),
      },
      radius: mapValues(core.radius, penpotRadius),
      spacing: mapValues(designTokens.spacing.scale, (value) =>
        penpotToken(penpotNumber(value), "spacing"),
      ),
    },
  };

  for (const [name, theme] of Object.entries(designTokens.themes)) {
    const resolved = resolveTheme(theme);
    for (const mode of modes) {
      sets[`vllnt/${name}/${mode}`] = {
        color: Object.fromEntries(
          Object.entries(designTokens.color.semantic).map(([role, color]) => [
            color.cssVariable.slice(2),
            penpotToken(
              oklchToHex(resolved.colors[mode][role]).toUpperCase(),
              "color",
            ),
          ]),
        ),
        ...penpotThemeOverrides(theme),
      };
    }
  }

  const themes = themeNames.flatMap((name) =>
    modes.map((mode) => ({
      group: name,
      name: mode === "dark" ? "Dark" : "Light",
      selectedTokenSets: Object.fromEntries(
        setNames.map((setName) => [
          setName,
          setName === "vllnt/core" || setName === `vllnt/${name}/${mode}`
            ? "enabled"
            : "disabled",
        ]),
      ),
    })),
  );

  return `${JSON.stringify(
    { ...sets, $themes: themes, $metadata: { tokenSetOrder: setNames } },
    null,
    2,
  )}\n`;
}

function renderGeneratedTypeScript() {
  const serialize = (value) => JSON.stringify(value, null, 2);
  return [
    "/* This file is generated from packages/design. Do not edit directly. */",
    "",
    `export const designTokens = ${serialize(designTokens)} as const;`,
    "",
    `export const componentContracts = ${serialize(componentContracts)} as const;`,
    "",
    `export const nativeTokens = ${serialize(nativeTokens())} as const;`,
    "",
    "/** Product themes resolved to native units: sRGB hex, points, primary font faces. */",
    `export const productThemes = ${serialize(productThemeTokens())} as const;`,
    "",
    "/** Plain object for Tamagui's `createTokens`; this package does not depend on Tamagui. */",
    `export const tamaguiTokens = ${serialize(tamaguiTokens())} as const;`,
    "",
    "/** Plain object for Tamagui's `createTamagui({ themes })`, keyed `<theme>_<mode>`. */",
    `export const tamaguiThemes = ${serialize(tamaguiThemes())} as const;`,
    "",
    "export type BadgeVariant =",
    "  (typeof componentContracts.components.badge.variants)[number];",
    "export type ButtonSize =",
    "  (typeof componentContracts.components.button.sizes)[number];",
    "export type ButtonVariant =",
    "  (typeof componentContracts.components.button.variants)[number];",
    "export type CardPart =",
    "  (typeof componentContracts.components.card.parts)[number];",
    "export type HeadingLevel =",
    "  (typeof componentContracts.components.heading.levels)[number];",
    "export type TextSize =",
    "  (typeof componentContracts.components.text.sizes)[number];",
    "export type TextTone =",
    "  (typeof componentContracts.components.text.tones)[number];",
    "export type TextWeight =",
    "  (typeof componentContracts.components.text.weights)[number];",
    "export type SemanticColorName = keyof typeof nativeTokens.color.light;",
    "export type ProductThemeName = keyof typeof productThemes;",
    "export type TamaguiThemeName = keyof typeof tamaguiThemes;",
    "",
  ].join("\n");
}

validateSource();

const currentStyles = await readFile(paths.uiStyles, "utf8");
const outputs = new Map([
  [paths.uiDefaultTheme, renderDefaultTheme()],
  [paths.uiProductThemes, renderProductThemes()],
  [paths.uiStyles, replaceStylesThemeBlock(currentStyles)],
  [paths.coreGenerated, renderGeneratedTypeScript()],
  [paths.penpotTokens, penpotTokens()],
  [paths.coreTokens, await readFile(paths.tokens, "utf8")],
  [paths.coreTokensSchema, await readFile(paths.tokensSchema, "utf8")],
  [paths.coreContracts, await readFile(paths.contracts, "utf8")],
  [paths.coreContractsSchema, await readFile(paths.contractsSchema, "utf8")],
]);

const stale = [];
for (const [path, expected] of outputs) {
  let actual = "";
  try {
    actual = await readFile(path, "utf8");
  } catch {
    actual = "";
  }
  if (actual === expected) continue;
  stale.push(path.slice(repositoryRoot.length + 1));
  if (!checkOnly) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, expected);
  }
}

if (checkOnly && stale.length > 0) {
  console.error("Generated token artifacts are stale:");
  for (const path of stale) console.error(`  - ${path}`);
  console.error("Run: pnpm tokens:generate");
  process.exit(1);
}

if (stale.length === 0) {
  console.log("Token artifacts are in sync.");
} else {
  console.log(`Generated ${stale.length} token artifact(s).`);
}
