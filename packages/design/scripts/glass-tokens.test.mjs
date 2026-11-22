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

describe("glass CSS", () => {
  const solidHeaders = {
    media:
      "@media (prefers-reduced-transparency: reduce), (prefers-contrast: more), (forced-colors: active)",
    off: '[data-material="solid"]',
    supports:
      "@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px)))",
  };

  for (const [file, css] of Object.entries(cssFiles)) {
    describe(file, () => {
      it("declares the glass defaults in :root", () => {
        for (const [name, value] of [
          ["blur-glass-sm", "8px"],
          ["blur-glass-md", "12px"],
          ["blur-glass-lg", "24px"],
          ["material-glass-opacity-sm", "0.6"],
          ["material-glass-opacity-md", "0.72"],
          ["material-glass-opacity-lg", "0.82"],
          ["material-glass-opacity-xl", "0.9"],
        ]) {
          assert.equal(declaration(css, name), value, name);
        }
        assert.equal(
          declaration(css, "material-glass-opacity-default"),
          "var(--material-glass-opacity-lg)",
        );
      });

      it("declares the r8 glass tokens in :root and .dark", () => {
        const root = css.slice(0, css.indexOf(".dark {"));
        const dark = blockBody(css, ".dark");
        for (const [path, , values] of r8Modes.filter(([path]) => path.startsWith("material."))) {
          const name = path.replaceAll(".", "-");
          assert.equal(declaration(root, name)?.toUpperCase(), values.light.toUpperCase(), `${name} light`);
          assert.equal(declaration(dark, name)?.toUpperCase(), values.dark.toUpperCase(), `${name} dark`);
        }
        assert.equal(declaration(root, "blur-glass-default"), "20px");
        assert.equal(
          declaration(root, "shadow-glass"),
          "0px 1px 2px 0px #0000000D, 0px 4px 14px 0px #0000000F",
        );
        assert.equal(
          declaration(dark, "shadow-glass-floating"),
          "0px 1px 2px 0px #00000080, 0px 10px 28px 0px #00000080",
        );
      });

      for (const [key, header] of Object.entries(solidHeaders)) {
        it(`turns glass solid in ${key}`, () => {
          const body = blockBody(css, header);
          for (const name of [
            "material-glass-opacity-sm",
            "material-glass-opacity-md",
            "material-glass-opacity-lg",
            "material-glass-opacity-xl",
          ]) {
            assert.equal(declaration(body, name), "1", name);
          }
          assert.equal(declaration(body, "material-glass-tint"), "var(--card)");
          assert.equal(
            declaration(body, "material-glass-hairline"),
            "oklch(var(--border))",
          );
          assert.equal(
            declaration(body, "material-glass-highlight"),
            "oklch(var(--border))",
          );
          for (const name of [
            "material-glass-tint-top",
            "material-glass-tint-bottom",
            "material-glass-tint-dense-top",
            "material-glass-tint-dense-bottom",
          ]) {
            assert.equal(declaration(body, name), "oklch(var(--card))", name);
          }
          assert.equal(
            declaration(body, "material-glass-hairline-edge"),
            "oklch(var(--border))",
          );
          assert.equal(declaration(body, "material-glass-sheen-opacity"), "0");
          assert.equal(declaration(body, "shadow-glass"), "var(--shadow-raised)");
          assert.equal(declaration(body, "shadow-glass-floating"), "var(--shadow-floating)");
          for (const name of [
            "blur-glass-sm",
            "blur-glass-md",
            "blur-glass-lg",
            "blur-glass-default",
          ]) {
            assert.equal(declaration(body, name), "0px", name);
          }
          assert.equal(declaration(body, "vllnt-glass-backdrop"), "none");
          assert.equal(
            declaration(body, "color-glass-muted-foreground"),
            "var(--muted-foreground)",
          );
          assert.equal(declaration(body, "color-glass-input"), "var(--input)");
        });
      }

      it('switches glass off with html[data-glass="off"] and per element with data-material="solid"', () => {
        const selectorList = css
          .slice(0, css.indexOf('[data-material="solid"] {'))
          .split("\n")
          .slice(-3)
          .map((line) => line.trim())
          .join(" ");
        assert.equal(
          selectorList,
          ':root[data-glass="off"], :root[data-glass="off"] .dark, ',
        );
      });

      it("re-declares the derived glass variables in .dark", () => {
        const dark = blockBody(css, ".dark");
        assert.equal(
          declaration(dark, "material-glass-opacity-default"),
          "var(--material-glass-opacity-lg)",
        );
        assert.equal(
          declaration(dark, "depth-z-3-tint"),
          "var(--material-glass-opacity-xl)",
        );
        assert.equal(declaration(dark, "color-glass-border"), "#FFFFFF2E");
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
