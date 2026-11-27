import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const designDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");

const readText = (path) => readFileSync(join(designDirectory, path), "utf8");
const readJson = (path) => JSON.parse(readText(path));

const tokens = readJson("tokens.json");
const penpot = readJson("generated/penpot-tokens.json");
const cssFiles = {
  "themes/default.css": readText("../ui/themes/default.css"),
  "styles.css": readText("../ui/styles.css"),
};
const productsCss = readText("../ui/themes/products.css");
const uiCoreTs = readText("../ui-core/src/generated/design-tokens.ts");

/** A token of a Penpot set at a dotted path. */
const penpotToken = (set, path) =>
  path.split(".").reduce((node, key) => node?.[key], penpot[set]);

/**
 * The glass-default r5 recipe (Penpot Foundations and Atoms, 21 Nov 2026):
 * `vllnt/core` entries as `[path, type, value]`. A reference value is the
 * Penpot reference string. Depth offsets are numbers here; Penpot holds the
 * same numbers as `depth.N.z` dimension tokens.
 */
const r5Core = [
  ["blur.glass.sm", "number", "8"],
  ["blur.glass.md", "number", "12"],
  ["blur.glass.lg", "number", "24"],
  ["material.glass.opacity.sm", "opacity", "0.6"],
  ["material.glass.opacity.md", "opacity", "0.72"],
  ["material.glass.opacity.lg", "opacity", "0.82"],
  ["material.glass.opacity.xl", "opacity", "0.9"],
  [
    "material.glass.opacity.default",
    "opacity",
    "{material.glass.opacity.lg}",
  ],
  ["material.glass.tint", "color", "{color.background}"],
  ["material.glass.highlight", "color", "{material.highlight.top}"],
  ["material.glass.hairline", "color", "{color.glass-border}"],
  ["depth.z-0.offset", "number", "0"],
  ["depth.z-1.offset", "number", "2"],
  ["depth.z-2.offset", "number", "8"],
  ["depth.z-3.offset", "number", "16"],
  ["depth.z-4.offset", "number", "32"],
  ["depth.z-0.tint", "opacity", "{material.glass.opacity.default}"],
  ["depth.z-1.tint", "opacity", "{material.glass.opacity.default}"],
  ["depth.z-2.tint", "opacity", "{material.glass.opacity.default}"],
  ["depth.z-3.tint", "opacity", "{material.glass.opacity.xl}"],
  ["depth.z-4.tint", "opacity", "{material.glass.opacity.xl}"],
  ["depth.z-1.shadow", "shadow", "{shadow.raised}"],
  ["depth.z-2.shadow", "shadow", "{shadow.overlay}"],
  ["depth.z-3.shadow", "shadow", "{shadow.floating}"],
  ["depth.z-4.shadow", "shadow", "{shadow.floating}"],
];

/**
 * The glass-default r8 recipe (Penpot Molecules, 22 Nov 2026), on top of r5.
 * `vllnt/core` entries as `[path, type, value]`, then the per-mode entries as
 * `[path, type, { light, dark }]`. Dark default tint is the AA-raised value.
 */
const r8Core = [
  ["blur.glass.default", "number", "20"],
  [
    "shadow.glass",
    "shadow",
    [
      { blur: "2", color: "#0000000D", offsetY: "1" },
      { blur: "14", color: "#0000000F", offsetY: "4" },
    ],
  ],
  [
    "shadow.glass-floating",
    "shadow",
    [
      { blur: "2", color: "#00000014", offsetY: "1" },
      { blur: "28", color: "#0000001F", offsetY: "10" },
    ],
  ],
];

const r8Modes = [
  ["material.glass.tint-top", "color", { dark: "#1C1C1CB2", light: "#FFFFFFA3" }],
  ["material.glass.tint-bottom", "color", { dark: "#1414149C", light: "#FFFFFF80" }],
  ["material.glass.tint-dense-top", "color", { dark: "#121212E0", light: "#FFFFFFE6" }],
  ["material.glass.tint-dense-bottom", "color", { dark: "#121212D1", light: "#FFFFFFD6" }],
  ["material.glass.hairline-edge", "color", { dark: "#FFFFFF1A", light: "#00000014" }],
  ["material.glass.sheen-opacity", "opacity", { dark: "0.17", light: "1" }],
  ["color.glass-muted-foreground", "color", { dark: "#D4D4D4", light: "#404040" }],
  ["color.glass-input", "color", { dark: "#A3A3A3", light: "#595959" }],
];

/** `vllnt/material/solid`: every glass opacity 1, card tint, border lines, no blur, raised shadows. */
const solidSet = {
  "blur.glass.default": ["number", "0"],
  "material.glass.hairline-edge": ["color", "{color.border}"],
  "material.glass.sheen-opacity": ["opacity", "0"],
  "material.glass.tint-bottom": ["color", "{color.card}"],
  "material.glass.tint-dense-bottom": ["color", "{color.card}"],
  "material.glass.tint-dense-top": ["color", "{color.card}"],
  "material.glass.tint-top": ["color", "{color.card}"],
  "shadow.glass": ["shadow", "{shadow.raised}"],
  "shadow.glass-floating": ["shadow", "{shadow.floating}"],
  "blur.glass.lg": ["number", "0"],
  "blur.glass.md": ["number", "0"],
  "blur.glass.sm": ["number", "0"],
  "material.glass.hairline": ["color", "{color.border}"],
  "material.glass.highlight": ["color", "{color.border}"],
  "material.glass.opacity.lg": ["opacity", "1"],
  "material.glass.opacity.md": ["opacity", "1"],
  "material.glass.opacity.sm": ["opacity", "1"],
  "material.glass.opacity.xl": ["opacity", "1"],
  "material.glass.tint": ["color", "{color.card}"],
};

/** Body of the first block that opens with `header {`, braces balanced. */
function blockBody(css, header) {
  const start = css.indexOf(`${header} {`);
  assert.notEqual(start, -1, `missing ${header}`);
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1;
    if (css[index] === "}") depth -= 1;
    if (depth === 0) return css.slice(open + 1, index);
  }
  throw new Error(`unbalanced ${header}`);
}

const declaration = (body, name) =>
  body.match(new RegExp(`--${name}:\\s*([^;]+);`))?.[1].trim();

describe("glass tokens match the Penpot glass-default r5 recipe", () => {
  for (const [path, type, value] of r5Core) {
    it(`vllnt/core ${path} is ${value}`, () => {
      const token = penpotToken("vllnt/core", path);
      assert.ok(token, `${path} is missing from vllnt/core`);
      assert.equal(token.$type, type);
      assert.equal(token.$value, value);
    });
  }

  for (const [path, type, value] of r8Core) {
    it(`r8 vllnt/core ${path}`, () => {
      const token = penpotToken("vllnt/core", path);
      assert.ok(token, `${path} is missing from vllnt/core`);
      assert.equal(token.$type, type);
      if (type === "shadow") {
        assert.deepEqual(
          token.$value.map(({ blur, color, offsetY }) => ({ blur, color, offsetY })),
          value,
        );
      } else {
        assert.equal(token.$value, value);
      }
    });
  }

  for (const [path, type, values] of r8Modes) {
    for (const product of ["maia", "paas"]) {
      for (const mode of ["light", "dark"]) {
        it(`r8 vllnt/${product}/${mode} ${path} is ${values[mode]}`, () => {
          const token = penpotToken(`vllnt/${product}/${mode}`, path);
          assert.ok(token, `${path} is missing`);
          assert.equal(token.$type, type);
          assert.equal(token.$value, values[mode]);
        });
      }
    }
  }

  it("keeps the solid-depth zero shadow transparent", () => {
    const [layer] = penpotToken("vllnt/core", "depth.z-0.shadow").$value;
    assert.equal(layer.color, "#00000000");
    assert.equal(layer.blur, "0");
  });

  it("sets the highlight and hairline per mode", () => {
    const expected = {
      dark: { hairline: "#FFFFFF2E", highlight: "#FFFFFF2E" },
      light: { hairline: "#00000024", highlight: "#FFFFFFCC" },
    };
    for (const product of ["maia", "paas"]) {
      for (const [mode, values] of Object.entries(expected)) {
        const set = `vllnt/${product}/${mode}`;
        assert.equal(
          penpotToken(set, "color.glass-border").$value,
          values.hairline,
          `${set} hairline`,
        );
        assert.equal(
          penpotToken(set, "material.highlight.top").$value,
          values.highlight,
          `${set} highlight`,
        );
      }
    }
  });

  it("lists the solid set exactly: the ten r5 tokens and the nine r8 tokens, nothing else", () => {
    const solid = penpot["vllnt/material/solid"];
    const leaves = [];
    const walk = (node, path) => {
      for (const [key, value] of Object.entries(node)) {
        if ("$value" in value) leaves.push([[...path, key].join("."), value]);
        else walk(value, [...path, key]);
      }
    };
    walk(solid, []);
    assert.deepEqual(
      Object.fromEntries(
        leaves.map(([path, token]) => [path, [token.$type, token.$value]]),
      ),
      solidSet,
    );
  });

  it("adds the Solid, Reduced transparency and Increased contrast themes, each enabling only the solid set", () => {
    const themes = penpot.$themes.filter(({ group }) =>
      ["contrast", "material", "transparency"].includes(group),
    );
    assert.deepEqual(
      themes.map(({ group, name }) => `${group}/${name}`),
      ["material/Solid", "transparency/Reduced", "contrast/Increased"],
    );
    for (const theme of themes) {
      const enabled = Object.entries(theme.selectedTokenSets)
        .filter(([, state]) => state === "enabled")
        .map(([set]) => set);
      assert.deepEqual(enabled, ["vllnt/material/solid"], theme.name);
    }
  });

  it("keeps the blur ceiling at blur.glass.lg = 24 and the pane blur at blur.glass.default = 20", () => {
    const blurs = Object.values(tokens.blur.glass).map(({ value }) =>
      Number.parseFloat(value),
    );
    assert.equal(Math.max(...blurs), 24);
    assert.equal(tokens.blur.glass.lg.value, "24px");
    assert.equal(tokens.blur.glass.default.value, "20px");
  });
});

/** Body of the rule whose selector list is `selectors`, found at or after `from`. */
function scopeBody(css, selectors, from = 0) {
  const escape = (text) => text.replaceAll(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`);
  const pattern = new RegExp(
    String.raw`\n\s*${selectors.map(escape).join(String.raw`,\s*`)}\s*\{`,
  );
  const match = pattern.exec(css.slice(from));
  assert.ok(match, `missing ${selectors.join(", ")}`);
  return blockBody(css.slice(from), match[0].trim().slice(0, -1).trimEnd());
}

describe("glass CSS", () => {
  const glassScope = {
    dark: ['.dark[data-glass="on"]', '.dark [data-glass="on"]', '[data-glass="on"] .dark'],
    light: ['[data-glass="on"]'],
  };
  const solidSwitches = [
    ':root[data-glass="off"] [data-glass="on"]',
    ':root[data-glass="off"] [data-glass="on"] .dark',
    '[data-material="solid"]',
    '[data-material="solid"] [data-glass="on"]',
    '[data-material="solid"] [data-glass="on"] .dark',
  ];
  const conditions = {
    media:
      "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)",
    supports:
      "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))",
  };

  /** The solid material: every glass opacity 1, card tint, border lines, no blur, no backdrop filter. */
  function assertSolid(body, label) {
    for (const name of [
      "material-glass-opacity-sm",
      "material-glass-opacity-md",
      "material-glass-opacity-lg",
      "material-glass-opacity-xl",
    ]) {
      assert.equal(declaration(body, name), "1", `${label} ${name}`);
    }
    assert.equal(declaration(body, "material-glass-tint"), "var(--card)", label);
    assert.equal(declaration(body, "material-glass-hairline"), "oklch(var(--border))", label);
    assert.equal(declaration(body, "material-glass-highlight"), "oklch(var(--border))", label);
    for (const name of [
      "material-glass-tint-top",
      "material-glass-tint-bottom",
      "material-glass-tint-dense-top",
      "material-glass-tint-dense-bottom",
    ]) {
      assert.equal(declaration(body, name), "oklch(var(--card))", `${label} ${name}`);
    }
    assert.equal(declaration(body, "material-glass-hairline-edge"), "oklch(var(--border))", label);
    assert.equal(declaration(body, "material-glass-sheen-opacity"), "0", label);
    assert.equal(declaration(body, "shadow-glass"), "var(--shadow-raised)", label);
    assert.equal(declaration(body, "shadow-glass-floating"), "var(--shadow-floating)", label);
    for (const name of ["blur-glass-sm", "blur-glass-md", "blur-glass-lg", "blur-glass-default"]) {
      assert.equal(declaration(body, name), "0px", `${label} ${name}`);
    }
    assert.equal(declaration(body, "vllnt-glass-backdrop"), "none", label);
    assert.equal(declaration(body, "color-glass-muted-foreground"), "var(--muted-foreground)", label);
    assert.equal(declaration(body, "color-glass-input"), "var(--input)", label);
  }

  for (const [file, css] of Object.entries(cssFiles)) {
    describe(file, () => {
      const root = css.slice(0, css.indexOf(".dark {"));
      const dark = blockBody(css, ".dark");

      it("is solid by default: :root carries the solid values, not the glass ones", () => {
        assertSolid(root, ":root");
        assert.equal(declaration(root, "material-glass-opacity-default"), "var(--material-glass-opacity-lg)");
      });

      it("keeps one value for the glass tokens the solid set leaves alone", () => {
        assert.equal(declaration(root, "color-glass-border"), "#00000024");
        assert.equal(declaration(root, "material-highlight-top"), "#FFFFFFCC");
        assert.equal(declaration(root, "depth-z-2-offset"), "8px");
        assert.equal(declaration(dark, "color-glass-border"), "#FFFFFF2E");
        assert.equal(declaration(dark, "material-highlight-top"), "#FFFFFF2E");
      });

      it("re-declares the variables that read another variable in .dark", () => {
        assert.equal(declaration(dark, "material-glass-opacity-default"), "var(--material-glass-opacity-lg)");
        assert.equal(declaration(dark, "depth-z-3-tint"), "var(--material-glass-opacity-xl)");
        assert.equal(declaration(dark, "material-glass-tint"), "var(--card)");
        assert.equal(declaration(dark, "shadow-glass"), "var(--shadow-raised)");
        assert.equal(declaration(dark, "color-glass-input"), "var(--input)");
      });

      it("declares the glass values in the light opt-in scope", () => {
        const body = scopeBody(css, glassScope.light);
        for (const [name, value] of [
          ["blur-glass-sm", "8px"],
          ["blur-glass-md", "12px"],
          ["blur-glass-lg", "24px"],
          ["blur-glass-default", "20px"],
          ["material-glass-opacity-sm", "0.6"],
          ["material-glass-opacity-md", "0.72"],
          ["material-glass-opacity-lg", "0.82"],
          ["material-glass-opacity-xl", "0.9"],
          ["material-glass-opacity-default", "var(--material-glass-opacity-lg)"],
          ["material-glass-tint", "var(--background)"],
          ["material-glass-highlight", "var(--material-highlight-top)"],
          ["material-glass-hairline", "var(--color-glass-border)"],
          ["shadow-glass", "0px 1px 2px 0px #0000000D, 0px 4px 14px 0px #0000000F"],
          ["vllnt-glass-backdrop", "initial"],
        ]) {
          assert.equal(declaration(body, name), value, name);
        }
        for (const [path, , values] of r8Modes) {
          const name = path.replaceAll(".", "-");
          const written = declaration(body, name);
          // The glass text roles are channels; the tints are hex.
          if (path.startsWith("material.")) {
            assert.equal(written?.toUpperCase(), values.light.toUpperCase(), `${name} light`);
          } else {
            assert.ok(written, `${name} light`);
          }
        }
      });

      it("declares the dark glass values in the dark opt-in scope", () => {
        const body = scopeBody(css, glassScope.dark);
        for (const [path, , values] of r8Modes.filter(([path]) => path.startsWith("material."))) {
          const name = path.replaceAll(".", "-");
          assert.equal(declaration(body, name)?.toUpperCase(), values.dark.toUpperCase(), `${name} dark`);
        }
        assert.equal(declaration(body, "shadow-glass"), "0px 1px 2px 0px #00000066, 0px 4px 14px 0px #0000004D");
        assert.equal(declaration(body, "shadow-glass-floating"), "0px 1px 2px 0px #00000080, 0px 10px 28px 0px #00000080");
        assert.equal(declaration(body, "material-glass-tint"), "var(--background)");
        assert.equal(declaration(body, "vllnt-glass-backdrop"), "initial");
      });

      for (const [key, header] of Object.entries(conditions)) {
        it(`turns the opt-in scope solid again in ${key}`, () => {
          const at = css.indexOf(header);
          assert.notEqual(at, -1, `missing ${header}`);
          const body = scopeBody(css, [...glassScope.light, ...glassScope.dark], at);
          assertSolid(body, key);
          assert.ok(at > css.indexOf(glassScope.light[0]), `${key} must come after the opt-in scope`);
        });
      }

      it('switches glass off with html[data-glass="off"] and per element with data-material="solid"', () => {
        const body = scopeBody(css, solidSwitches);
        assertSolid(body, "switches");
        assert.ok(
          css.indexOf(solidSwitches[0]) > css.indexOf(conditions.supports),
          "the switches must come after the fallbacks",
        );
      });
    });
  }

  it("leaves the product themes on the base glass tokens", () => {
    assert.doesNotMatch(productsCss, /--(blur-glass|material-glass|depth-z)/);
  });

  it("writes the glass tokens to the ui-core TypeScript output", () => {
    assert.match(uiCoreTs, /material/);
    assert.match(uiCoreTs, /"24px"/);
  });
});
