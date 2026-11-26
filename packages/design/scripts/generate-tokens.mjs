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

// Renderer-specific adjustment: the pure-black dark surfaces are web-only for
// now. The native base palette keeps its #050505 page and the lifted card,
// popover and muted values, because native components draw tracks and
// skeletons with `muted` alone and would vanish on a near-black page.
const nativeColorOverrides = {
  dark: {
    background: "#050505",
    card: "#0a0a0a",
    popover: "#0a0a0a",
    muted: "#262626",
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

/** Radius role names (D14). Fixed in every theme, so a theme cannot override them. */
const radiusRoles = ["control", "surface"];

/** Page gutter spacing tokens (F5): aliases of a spacing scale step, named as in the Penpot libraries. */
const spacingRoles = ["page-gutter", "page-gutter-tablet", "page-gutter-desktop"];

/** The scale step inside a `{spacing.4}` reference. */
const spacingStep = (reference) => /^\{spacing\.([0-9]+)\}$/.exec(reference)?.[1];

/** A spacing role's length: the scale value its alias points at. */
const spacingRoleValue = (role) =>
  designTokens.spacing.scale[spacingStep(designTokens.spacing[role].value)];

/** One shadow layer as a CSS `box-shadow` layer. */
const cssShadowLayer = (layer) =>
  `${layer.inset ? "inset " : ""}${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${layer.color}`;

/** Leaves of a nested `{ value, role }` token group as `[path, leaf]` pairs. */
function tokenLeaves(group, path) {
  return Object.entries(group).flatMap(([key, node]) => {
    if (typeof node.value === "string") return [[[...path, key], node]];
    if (typeof node.light === "string") return [];
    return tokenLeaves(node, [...path, key]);
  });
}

/** `--size-target-min` for the path `["size", "target", "min"]`. */
const pathVariable = (path) => `--${path.join("-")}`;

/** The path inside a `{size.target.min}` reference. */
const referencePath = (reference) => /^\{([a-z][a-z0-9.-]*)\}$/.exec(reference)?.[1].split(".");

const sizeLeaves = tokenLeaves(designTokens.size, ["size"]);
const opacityLeaves = tokenLeaves(designTokens.opacity, ["opacity"]);

// Glass material (#684). Names and values follow the Penpot libraries (glass
// default r5): token `a.b.c` is the CSS variable `--a-b-c` and the Penpot token
// `a.b.c`.
const glassLeaves = [
  ...tokenLeaves(designTokens.blur, ["blur"]),
  ...tokenLeaves(designTokens.material.glass, ["material", "glass"]),
  ...tokenLeaves(designTokens.depth, ["depth"]),
];

const isReference = (value) => value.startsWith("{");
const isHexAlpha = (value) => /^#[0-9A-F]{8}$/.test(value);

/** Tokens with a light and a dark value; the libraries keep them in the mode sets. */
const glassModeTokens = [
  [["color", "glass-border"], designTokens.color["glass-border"]],
  [["color", "glass-input"], designTokens.color["glass-input"]],
  [["color", "glass-muted-foreground"], designTokens.color["glass-muted-foreground"]],
  [["material", "highlight", "top"], designTokens.material.highlight.top],
  ...Object.entries(designTokens.material.glass)
    .filter(([, node]) => typeof node.light === "string")
    .map(([key, node]) => [["material", "glass", key], node]),
];

/** Tokens drawn at a glass opacity are written as bare OKLCH channels, so the caller adds the alpha. */
const channelTokens = new Set(["material.glass.tint"]);

/** Semantic colour role names (`card`, `muted-foreground`), the CSS variables without `--`. */
const semanticRoleNames = new Set(
  Object.values(designTokens.color.semantic).map((color) => color.cssVariable.slice(2)),
);

/** A `{...}` token reference as a CSS value: a semantic role is an `oklch()` colour, anything else its variable. */
function cssReference(reference, channels) {
  const path = referencePath(reference);
  assert(path !== undefined, `${reference} is not a token reference.`);
  if (path[0] === "color" && path.length === 2 && semanticRoleNames.has(path[1])) {
    return channels ? `var(--${path[1]})` : `oklch(var(--${path[1]}))`;
  }
  return `var(${pathVariable(path)})`;
}

const cssGlassValue = (path, value) =>
  isReference(value) ? cssReference(value, channelTokens.has(path.join("."))) : value;

/** The Penpot type of a glass token, from its path. */
function glassPenpotType(path) {
  const leaf = path.at(-1);
  if (path[0] === "blur" || leaf === "offset") return "number";
  if (path[0] === "shadow" || leaf === "shadow") return "shadow";
  if (path.includes("opacity") || leaf.endsWith("opacity") || (path[0] === "depth" && leaf === "tint")) {
    return "opacity";
  }
  return "color";
}

/** The shadow `depth.z-0.shadow` carries in the libraries: one transparent layer. */
const noShadow = [
  { offsetX: "0", offsetY: "0", blur: "0", spread: "0", color: "#00000000", inset: false },
];

/** A glass token's Penpot value: references pass through, lengths become numbers. */
function penpotGlassToken(path, value) {
  const type = glassPenpotType(path);
  if (isReference(value)) return penpotToken(value, type);
  if (type === "number") return penpotToken(penpotNumber(value), type);
  if (type === "shadow") return penpotToken(noShadow, type);
  return penpotToken(value, type);
}

/** A nested `{ value, role }` glass group as Penpot tokens. */
function penpotGlassGroup(group, path) {
  const single = Object.fromEntries(
    Object.entries(group).filter(([, node]) => typeof node.light !== "string"),
  );
  return mapValues(single, (node, key) =>
    typeof node.value === "string"
      ? penpotGlassToken([...path, key], node.value)
      : penpotGlassGroup(node, [...path, key]),
  );
}

/** The `vllnt/material/solid` set: a dotted token name to its solid value, nested for Penpot. */
function penpotSolidSet() {
  const set = {};
  for (const [name, value] of Object.entries(designTokens.material.solid)) {
    const path = name.split(".");
    const parent = path
      .slice(0, -1)
      .reduce((node, key) => (node[key] ??= {}), set);
    parent[path.at(-1)] = penpotGlassToken(path, value);
  }
  return set;
}

const solidSetName = "vllnt/material/solid";

/** A mode colour as a Penpot value: `#RRGGBBAA` as written, OKLCH channels as hex. */
const penpotModeColor = (value) =>
  isHexAlpha(value) ? value : oklchToHex(value).toUpperCase();

/** A per-mode glass token for one mode: an opacity as written, a colour as hex. */
function penpotModeToken(path, value) {
  const type = glassPenpotType(path);
  return penpotToken(type === "opacity" ? value : penpotModeColor(value), type);
}

/** The per-mode glass tokens under `root` (`material`) for one mode, nested by path. */
function penpotModeGroup(root, mode) {
  const group = {};
  for (const [path, token] of glassModeTokens.filter(([tokenPath]) => tokenPath[0] === root)) {
    const parent = path.slice(1, -1).reduce((node, key) => (node[key] ??= {}), group);
    parent[path.at(-1)] = penpotModeToken(path, token[mode]);
  }
  return group;
}

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
      assert(!radiusRoles.includes(step), `Theme ${name}.radius.${step} is a fixed radius role.`);
    }
    for (const [token, value] of Object.entries(theme.opacity ?? {})) {
      assert(token in designTokens.opacity, `Theme ${name}.opacity.${token} is not a core opacity.`);
      assert(isOpacity(value), `Theme ${name}.opacity.${token} must be a number from 0 to 1.`);
    }
  }
}

const isOpacity = (value) => /^(?:0(?:\.[0-9]+)?|1(?:\.0+)?)$/.test(value);

/** `{color.<role>}` references must name a semantic color; `{size.<name>}` a size token. */
function validateTokenGroups(colorRoles) {
  for (const [group, path] of [
    [designTokens.color["badge-label"], ["color", "badge-label"]],
    [designTokens.brand.status, ["brand", "status"]],
  ]) {
    for (const [leafPath, leaf] of tokenLeaves(group, path)) {
      const role = /^\{color\.([a-z-]+)\}$/.exec(leaf.value)?.[1];
      assert(
        colorRoles.has(role),
        `${leafPath.join(".")} must reference a semantic color as {color.<role>}.`,
      );
    }
  }

  const sizeNames = new Set(sizeLeaves.map(([path]) => path.join(".")));
  for (const [path, leaf] of sizeLeaves) {
    assert(
      /^[0-9]+(?:\.[0-9]+)?(?:px|rem)$/.test(leaf.value),
      `${path.join(".")} must be a px or rem length.`,
    );
    if (leaf.coarse !== undefined) {
      assert(
        sizeNames.has(referencePath(leaf.coarse)?.join(".")),
        `${path.join(".")}.coarse must reference a size token.`,
      );
    }
  }

  for (const [path, leaf] of opacityLeaves) {
    assert(isOpacity(leaf.value), `${path.join(".")} must be a number from 0 to 1.`);
  }
  for (const role of radiusRoles) {
    assert(role in designTokens.radius, `radius.${role} is missing.`);
  }
  for (const role of spacingRoles) {
    assert(
      spacingRoleValue(role) !== undefined,
      `spacing.${role} must reference a spacing scale step as {spacing.<step>}.`,
    );
  }
  for (const [name, token] of Object.entries(designTokens.shadow)) {
    for (const mode of modes) {
      assert(token[mode].length > 0, `shadow.${name}.${mode} needs at least one layer.`);
    }
  }
}

/** Glass tokens: references resolve, the budget ceiling holds, and solid overrides every glass token. */
function validateGlassTokens() {
  const known = new Set([
    ...glassLeaves.map(([path]) => path.join(".")),
    ...glassModeTokens.map(([path]) => path.join(".")),
    ...Object.keys(designTokens.shadow).map((name) => `shadow.${name}`),
    ...[...semanticRoleNames].map((role) => `color.${role}`),
  ]);
  for (const [path, leaf] of glassLeaves) {
    const name = path.join(".");
    if (isReference(leaf.value)) {
      assert(
        known.has(referencePath(leaf.value)?.join(".")),
        `${name} references ${leaf.value}, which is not a token.`,
      );
    } else if (path[0] === "blur" || path.at(-1) === "offset") {
      assert(/^[0-9]+(?:\.[0-9]+)?px$/.test(leaf.value), `${name} must be a px length.`);
    } else if (path.includes("opacity")) {
      assert(isOpacity(leaf.value), `${name} must be a number from 0 to 1.`);
    }
  }
  for (const [path, token] of glassModeTokens) {
    for (const mode of modes) {
      const valid =
        glassPenpotType(path) === "opacity"
          ? isOpacity(token[mode])
          : isHexAlpha(token[mode]) || /^[0-9.]+ [0-9.]+ [0-9.]+$/.test(token[mode]);
      assert(valid, `${path.join(".")}.${mode} must be #RRGGBBAA, OKLCH channels or an opacity.`);
    }
  }

  const blurs = glassLeaves.filter(([path]) => path[0] === "blur").map(([, leaf]) => parseFloat(leaf.value));
  assert(
    Math.max(...blurs) === parseFloat(designTokens.blur.glass.lg.value),
    "blur.glass.lg must be the largest blur step: it is the backdrop-filter budget ceiling.",
  );

  const solid = Object.keys(designTokens.material.solid);
  const overridable = [
    ...glassLeaves.map(([path]) => path.join(".")),
    ...glassModeTokens.map(([path]) => path.join(".")),
    "shadow.glass",
    "shadow.glass-floating",
  ].filter(
    (name) =>
      name.startsWith("blur.") ||
      name.startsWith("shadow.") ||
      (name.startsWith("material.glass.") && name !== "material.glass.opacity.default"),
  );
  assert(
    solid.slice().sort().join() === overridable.slice().sort().join(),
    `material.solid must override exactly: ${overridable.join(", ")}.`,
  );
  for (const [name, value] of Object.entries(designTokens.material.solid)) {
    assert(
      !isReference(value) || known.has(referencePath(value)?.join(".")),
      `material.solid.${name} references ${value}, which is not a token.`,
    );
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

  validateTokenGroups(
    new Set(colorEntries.map(([, color]) => color.cssVariable.slice(2))),
  );
  validateGlassTokens();
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

/** Radius roles, sizes and opacities the web reads directly. Colour aliases stay out: web code uses the role. */
function scalarLines(indentation) {
  return [
    ...radiusRoles.map(
      (role) => `${indentation}--radius-${role}: ${designTokens.radius[role]};`,
    ),
    ...spacingRoles.map(
      (role) => `${indentation}--spacing-${role}: ${spacingRoleValue(role)};`,
    ),
    ...[...sizeLeaves, ...opacityLeaves].map(
      ([path, leaf]) => `${indentation}${pathVariable(path)}: ${leaf.value};`,
    ),
    ...glassLines(glassLeaves, indentation),
    ...glassModeLines("light", indentation),
  ];
}

/** Glass tokens as CSS variables; a reference becomes `var()` of the token it names. */
function glassLines(leaves, indentation) {
  return leaves.map(
    ([path, leaf]) => `${indentation}${pathVariable(path)}: ${cssGlassValue(path, leaf.value)};`,
  );
}

/** Glass colours that differ per mode, as CSS variables for one mode. */
function glassModeLines(mode, indentation) {
  return glassModeTokens.map(
    ([path, token]) => `${indentation}${pathVariable(path)}: ${token[mode]};`,
  );
}

/**
 * Dark scope: the glass tokens that point at a mode-dependent value. A `var()`
 * resolves where it is declared, so a nested `.dark` scope has to declare them
 * again to read the dark roles.
 */
function glassDarkLines(indentation) {
  return [
    ...glassModeLines("dark", indentation),
    ...glassLines(
      glassLeaves.filter(([, leaf]) => isReference(leaf.value)),
      indentation,
    ),
  ];
}

/**
 * Glass tokens that follow the ones the solid set overrides (the default
 * opacity, the depth tints). A `var()` resolves where it is declared, so a
 * `data-material="solid"` surface has to declare them again to follow its own
 * values instead of the root's.
 */
function solidDerivedLeaves() {
  const overridden = new Set(Object.keys(designTokens.material.solid));
  const derived = [];
  let grew = true;
  while (grew) {
    grew = false;
    for (const leaf of glassLeaves) {
      const name = leaf[0].join(".");
      const target = isReference(leaf[1].value) ? referencePath(leaf[1].value).join(".") : undefined;
      if (!overridden.has(name) && !derived.includes(leaf) && overridden.has(target)) {
        derived.push(leaf);
        overridden.add(name);
        grew = true;
      }
    }
  }
  return derived;
}

/**
 * The vllnt/material/solid set as CSS variables. Besides the tokens it
 * restores two things the Penpot set leaves to the component: the glass text
 * roles fall back to the base roles, and the filter is removed instead of
 * blurred by 0, so no backdrop root is created.
 */
function solidLines(indentation) {
  return [
    ...Object.entries(designTokens.material.solid).map(([name, value]) => {
      const path = name.split(".");
      return `${indentation}${pathVariable(path)}: ${cssGlassValue(path, value)};`;
    }),
    ...glassLines(solidDerivedLeaves(), indentation),
    `${indentation}--color-glass-input: var(--input);`,
    `${indentation}--color-glass-muted-foreground: var(--muted-foreground);`,
    `${indentation}--vllnt-glass-backdrop: none;`,
  ];
}

/** Conditions that turn glass into solid, with no script. Each one is a CSS at-rule. */
const solidConditions = [
  "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)",
  "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))",
];

/** Automatic solid fallbacks, the `data-glass="off"` app switch and the per-surface `data-material="solid"`. */
function solidBlocks(indentation) {
  const inner = `${indentation}  `;
  const body = `${inner}  `;
  return [
    `${indentation}/* Solid material: the vllnt/material/solid values replace the glass tokens. */`,
    ...solidConditions.flatMap((condition) => [
      `${indentation}${condition} {`,
      `${inner}:root,`,
      `${inner}.dark {`,
      ...solidLines(body),
      `${inner}}`,
      `${indentation}}`,
    ]),
    `${indentation}:root[data-glass="off"],`,
    `${indentation}:root[data-glass="off"] .dark,`,
    `${indentation}[data-material="solid"] {`,
    ...solidLines(inner),
    `${indentation}}`,
  ];
}

/** `--shadow-<name>`: the token's layers for one mode as a CSS `box-shadow` value. */
function shadowLines(mode, indentation) {
  return Object.entries(designTokens.shadow).map(
    ([name, token]) =>
      `${indentation}--shadow-${name}: ${token[mode].map(cssShadowLayer).join(", ")};`,
  );
}

/** Under a coarse pointer, each size token with a `coarse` reference takes that token's value. */
function coarsePointerLines(indentation) {
  const rules = sizeLeaves
    .filter(([, leaf]) => leaf.coarse !== undefined)
    .map(
      ([path, leaf]) =>
        `${indentation}    ${pathVariable(path)}: var(${pathVariable(referencePath(leaf.coarse))});`,
    );
  if (rules.length === 0) return [];
  return [
    `${indentation}@media (pointer: coarse) {`,
    `${indentation}  :root {`,
    ...rules,
    `${indentation}  }`,
    `${indentation}}`,
  ];
}

function renderDefaultTheme() {
  return [
    '/* Default theme variables. Values are OKLCH channels ("L C H"), consumed as oklch(var(--x)). */',
    ":root {",
    ...declarationLines("light", "  "),
    ...typographyLines("  "),
    ...scalarLines("  "),
    ...shadowLines("light", "  "),
    "}",
    ".dark {",
    ...declarationLines("dark", "  "),
    ...shadowLines("dark", "  "),
    ...glassDarkLines("  "),
    "}",
    ...coarsePointerLines(""),
    ...solidBlocks(""),
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
    ...scalarLines("    "),
    ...shadowLines("light", "    "),
    "  }",
    "  .dark {",
    ...declarationLines("dark", "    "),
    ...shadowLines("dark", "    "),
    ...glassDarkLines("    "),
    "  }",
    ...coarsePointerLines("  "),
    ...solidBlocks("  "),
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

// Native glass. Every value is read from the glass tokens above, so a change in
// tokens.json reaches native on the next generation. Names follow the token
// names, camelCased like the native colour roles: `glass-muted-foreground` is
// `mutedForeground`, `tint-dense-top` is `tint.denseTop`, `glass-floating` is
// `glassFloating`.

const camelCase = (name) => name.replaceAll(/-([a-z])/g, (_, letter) => letter.toUpperCase());

/** The `semantic` key (`mutedForeground`) of each colour role named by its CSS variable (`muted-foreground`). */
const semanticKeyByRole = Object.fromEntries(
  Object.entries(designTokens.color.semantic).map(([key, color]) => [
    color.cssVariable.slice(2),
    key,
  ]),
);

/** The shadow tokens a glass surface draws. */
const glassShadowNames = ["glass", "glass-floating"];

/** The glass tint steps, `tint-top` to `tint-dense-bottom`: the mode tokens whose name starts with `tint-`. */
const glassTintSteps = Object.entries(designTokens.material.glass)
  .filter(([name, node]) => name.startsWith("tint-") && typeof node.light === "string")
  .map(([name]) => name);

/** A glass colour for React Native: `#rrggbbaa` as written, OKLCH channels as `#rrggbb`. */
function nativeModeColor(value) {
  if (isHexAlpha(value)) return value.toLowerCase();
  assert(/^[0-9.]+ [0-9.]+ [0-9.]+$/.test(value), `${value} is not #RRGGBBAA or OKLCH channels.`);
  return oklchToHex(value);
}

/**
 * A glass colour value: a mode value, or a `{color.<role>}` reference. A
 * semantic role takes the native palette, so the solid fallback is the colour
 * a native Card draws, not the web one.
 */
function nativeGlassColor(value, mode, palette) {
  if (!isReference(value)) return nativeModeColor(value);
  const path = referencePath(value);
  assert(
    path?.length === 2 && path[0] === "color",
    `${value} must be a {color.<role>} reference to resolve for native glass.`,
  );
  const key = semanticKeyByRole[path[1]];
  if (key !== undefined) return palette[key];
  assert(designTokens.color[path[1]]?.[mode] !== undefined, `${value} is not a colour token.`);
  return nativeModeColor(designTokens.color[path[1]][mode]);
}

/** A glass blur radius in points; a literal `px` length. */
function nativeBlur(name, value) {
  assert(/^[0-9]+(?:\.[0-9]+)?px$/.test(value), `blur.glass.${name} must be a px length for native glass.`);
  return lengthToPoints(value);
}

/** The layers of a `{shadow.<name>}` reference, for one mode. */
function referencedShadowLayers(reference, mode) {
  const path = referencePath(reference);
  assert(
    path?.length === 2 && path[0] === "shadow" && path[1] in designTokens.shadow,
    `${reference} must be a {shadow.<name>} reference to resolve for native glass.`,
  );
  return designTokens.shadow[path[1]][mode];
}

/**
 * A shadow token as a React Native shadow. A CSS shadow has many layers and a
 * spread; React Native has one outer shadow, so:
 *
 * - Inset layers and `spread` are dropped. Native has neither.
 * - The layer drawn is the one with the largest blur, the visible ambient
 *   shadow; a tie goes to the higher alpha, then to the first layer. The small
 *   contact layer that comes with it is lost.
 * - `shadowColor` is that layer's RGB and `shadowOpacity` its alpha, so the
 *   alpha is not applied twice. `shadowOffset` is its offset in points.
 * - `shadowRadius` is the blur radius / 2. CSS blur is a gaussian of
 *   sigma = blur / 2, which is what iOS `shadowRadius` is.
 * - Android `elevation` (dp) is round((offsetY + blur / 2) / 2): the mean of
 *   the key-light offset and the half blur. Material elevation is about its
 *   key-light offset and half its penumbra blur, and this reproduces the
 *   Material 4, 8, 16 and 24 dp shadows within 2 dp. Android draws the
 *   elevation shadow itself, so it ignores `shadowOpacity` and `shadowRadius`.
 */
function nativeShadow(name, layers) {
  const outer = layers.filter((layer) => !layer.inset);
  assert(outer.length > 0, `${name} needs a layer that is not inset for native.`);
  for (const layer of outer) {
    assert(isHexAlpha(layer.color), `${name} layer color ${layer.color} must be #RRGGBBAA.`);
  }
  const alpha = (layer) => Number.parseInt(layer.color.slice(7), 16);
  const layer = outer.reduce((best, next) => {
    const larger = Number(next.blur) - Number(best.blur) || alpha(next) - alpha(best);
    return larger > 0 ? next : best;
  });
  const blur = Number(layer.blur);
  const offsetY = Number(layer.offsetY);
  return {
    elevation: Math.max(0, Math.round((offsetY + blur / 2) / 2)),
    shadowColor: layer.color.slice(0, 7).toLowerCase(),
    shadowOffset: { height: offsetY, width: Number(layer.offsetX) },
    shadowOpacity: Number((alpha(layer) / 255).toFixed(3)),
    shadowRadius: blur / 2,
  };
}

/** Where the glass values of one mode come from: the glass tokens. */
const glassSource = (mode) => ({
  blur: (name) => designTokens.blur.glass[name].value,
  hairline: designTokens.material.glass.hairline.value,
  input: designTokens.color["glass-input"][mode],
  mutedForeground: designTokens.color["glass-muted-foreground"][mode],
  shadow: (name) => designTokens.shadow[name][mode],
  tint: (step) => designTokens.material.glass[step][mode],
});

/**
 * Where the solid fallback comes from: the `material.solid` set that overrides
 * the glass tokens. As on the web (`solidLines`), the glass text roles fall
 * back to the base roles, which the set leaves to the renderer.
 */
const solidSource = (mode) => {
  const solid = designTokens.material.solid;
  return {
    blur: (name) => solid[`blur.glass.${name}`],
    hairline: solid["material.glass.hairline"],
    input: "{color.input}",
    mutedForeground: "{color.muted-foreground}",
    shadow: (name) => referencedShadowLayers(solid[`shadow.${name}`], mode),
    tint: (step) => solid[`material.glass.${step}`],
  };
};

/** One glass surface of one mode, in native units, from `source`. */
function nativeGlassSurface(mode, palette, source) {
  const color = (value) => nativeGlassColor(value, mode, palette);
  return {
    blur: mapValues(designTokens.blur.glass, (_, name) => nativeBlur(name, source.blur(name))),
    foreground: palette.foreground,
    hairline: color(source.hairline),
    input: color(source.input),
    mutedForeground: color(source.mutedForeground),
    shadow: Object.fromEntries(
      glassShadowNames.map((name) => [
        camelCase(name),
        nativeShadow(`shadow.${name}`, source.shadow(name)),
      ]),
    ),
    tint: Object.fromEntries(
      glassTintSteps.map((step) => [camelCase(step.slice("tint-".length)), color(source.tint(step))]),
    ),
  };
}

/** The glass group of one mode: the surface, and `solid`, the same surface with glass off. */
const nativeGlass = (mode, palette) => ({
  ...nativeGlassSurface(mode, palette, glassSource(mode)),
  solid: nativeGlassSurface(mode, palette, solidSource(mode)),
});

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
    glass: Object.fromEntries(modes.map((mode) => [mode, nativeGlass(mode, colors[mode])])),
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

/** CSS custom properties for the opacities a theme overrides (nothing it inherits). */
function themeOpacityLines(theme, indentation) {
  return Object.entries(theme.opacity ?? {}).map(
    ([name, value]) => `${indentation}--opacity-${name}: ${value};`,
  );
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
      ...themeOpacityLines(theme, "  "),
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

/** A nested `{ value, role }` group as Penpot tokens; `convert` maps each leaf's value. */
function penpotGroup(group, convert) {
  return mapValues(group, (node) =>
    typeof node.value === "string" ? convert(node.value) : penpotGroup(node, convert),
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
    ...(theme.opacity && {
      opacity: mapValues(theme.opacity, (value) => penpotToken(value, "opacity")),
    }),
    ...(theme.radius && { radius: mapValues(theme.radius, penpotRadius) }),
  };
}

function penpotTokens() {
  const themeNames = Object.keys(designTokens.themes);
  const core = resolveTheme({});
  const setNames = [
    "vllnt/core",
    ...themeNames.flatMap((name) => modes.map((mode) => `vllnt/${name}/${mode}`)),
    solidSetName,
  ];

  const colorReference = (value) => penpotToken(value, "color");

  const sets = {
    "vllnt/core": {
      blur: penpotGlassGroup(designTokens.blur, ["blur"]),
      brand: {
        status: penpotGroup(designTokens.brand.status, colorReference),
      },
      depth: penpotGlassGroup(designTokens.depth, ["depth"]),
      font: {
        family: mapValues(core.fontFamily, penpotFamily),
        size: mapValues(core.scale, (step) => penpotSize(step.fontSize)),
        weight: mapValues(core.fontWeight, penpotWeight),
      },
      material: {
        glass: penpotGlassGroup(designTokens.material.glass, ["material", "glass"]),
      },
      opacity: penpotGroup(designTokens.opacity, (value) =>
        penpotToken(value, "opacity"),
      ),
      radius: mapValues(core.radius, penpotRadius),
      shadow: mapValues(designTokens.shadow, (token) =>
        penpotToken(token.light, "shadow"),
      ),
      size: penpotGroup(designTokens.size, (value) =>
        penpotToken(penpotNumber(value), "sizing"),
      ),
      spacing: {
        ...mapValues(designTokens.spacing.scale, (value) =>
          penpotToken(penpotNumber(value), "spacing"),
        ),
        ...Object.fromEntries(
          spacingRoles.map((role) => [
            role,
            penpotToken(designTokens.spacing[role].value, "spacing"),
          ]),
        ),
      },
    },
  };

  for (const [name, theme] of Object.entries(designTokens.themes)) {
    const resolved = resolveTheme(theme);
    for (const mode of modes) {
      sets[`vllnt/${name}/${mode}`] = {
        color: {
          ...Object.fromEntries(
            Object.entries(designTokens.color.semantic).map(([role, color]) => [
              color.cssVariable.slice(2),
              penpotToken(
                oklchToHex(resolved.colors[mode][role]).toUpperCase(),
                "color",
              ),
            ]),
          ),
          ...Object.fromEntries(
            glassModeTokens
              .filter(([path]) => path[0] === "color")
              .map(([path, token]) => [path[1], penpotModeToken(path, token[mode])]),
          ),
          "badge-label": penpotGroup(
            designTokens.color["badge-label"],
            colorReference,
          ),
        },
        material: penpotModeGroup("material", mode),
        ...(mode === "dark" && {
          shadow: mapValues(designTokens.shadow, (token) =>
            penpotToken(token.dark, "shadow"),
          ),
        }),
        ...penpotThemeOverrides(theme),
      };
    }
  }

  sets[solidSetName] = penpotSolidSet();

  const themes = [
    ...themeNames.flatMap((name) =>
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
    ),
    // The libraries' material/Solid, transparency/Reduced and contrast/Increased
    // themes all switch the solid set on.
    ...[
      ["material", "Solid"],
      ["transparency", "Reduced"],
      ["contrast", "Increased"],
    ].map(([group, name]) => ({
      group,
      name,
      selectedTokenSets: Object.fromEntries(
        setNames.map((setName) => [setName, setName === solidSetName ? "enabled" : "disabled"]),
      ),
    })),
  ];

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
