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
  tokens: join(designDirectory, "tokens.json"),
  tokensSchema: join(designDirectory, "tokens.schema.json"),
  uiDefaultTheme: join(repositoryRoot, "packages/ui/themes/default.css"),
  uiStyles: join(repositoryRoot, "packages/ui/styles.css"),
};

const parseJson = async (path) => JSON.parse(await readFile(path, "utf8"));
const [designTokens, componentContracts] = await Promise.all([
  parseJson(paths.tokens),
  parseJson(paths.contracts),
]);

// Renderer-specific accessibility adjustments preserve the authored web theme:
// native uses small destructive labels and DESIGN.md bans pure-black backgrounds.
const nativeColorOverrides = {
  dark: {
    background: "#050505",
  },
  light: {
    destructive: "#c92f32",
  },
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
  "border",
  "input",
  "ring",
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
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
      const channels = color[mode].split(/\s+/).map(Number);
      assert(
        channels.length === 3 && channels.every(Number.isFinite),
        `Color ${name}.${mode} must contain three OKLCH channels.`,
      );
      assert(
        channels[0] >= 0 && channels[0] <= 1 && channels[1] >= 0,
        `Color ${name}.${mode} has out-of-range OKLCH channels.`,
      );
    }
  }

  for (const [name, step] of Object.entries(designTokens.typography?.scale ?? {})) {
    assert(step.cssVariable, `Typography ${name} is missing cssVariable.`);
    assert(
      step.lineHeightCssVariable,
      `Typography ${name} is missing lineHeightCssVariable.`,
    );
  }

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
      ["primary", "primaryForeground"],
      ["secondary", "secondaryForeground"],
    ]) {
      assert(
        contrastRatio(colors[mode][surface], colors[mode][foreground]) >= 4.5,
        `Native ${mode} ${surface}/${foreground} contrast must be at least 4.5:1.`,
      );
    }
  }

  const spacing = Object.fromEntries(
    Object.entries(designTokens.spacing.scale).map(([name, value]) => [
      name,
      remToPoints(value),
    ]),
  );
  const radius = Object.fromEntries(
    Object.entries(designTokens.radius).map(([name, value]) => [
      name,
      value.endsWith("rem") ? remToPoints(value) : Number.parseFloat(value),
    ]),
  );
  const typeScale = Object.fromEntries(
    Object.entries(designTokens.typography.scale).map(([name, step]) => {
      const fontSize = remToPoints(step.fontSize);
      return [
        name,
        {
          fontSize,
          lineHeight: Number((fontSize * Number(step.lineHeight)).toFixed(3)),
        },
      ];
    }),
  );
  const fontWeight = Object.fromEntries(
    Object.entries(designTokens.typography.fontWeight).map(([name, weight]) => [
      name,
      weight.value,
    ]),
  );
  const duration = Object.fromEntries(
    Object.entries(designTokens.motion.duration).map(([name, value]) => [
      name,
      milliseconds(value),
    ]),
  );

  return {
    color: colors,
    motion: { duration },
    radius,
    spacing,
    typography: { fontWeight, scale: typeScale },
  };
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
    "",
  ].join("\n");
}

validateSource();

const currentStyles = await readFile(paths.uiStyles, "utf8");
const outputs = new Map([
  [paths.uiDefaultTheme, renderDefaultTheme()],
  [paths.uiStyles, replaceStylesThemeBlock(currentStyles)],
  [paths.coreGenerated, renderGeneratedTypeScript()],
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
