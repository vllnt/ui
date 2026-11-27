import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const designDirectory = join(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = join(designDirectory, "..", "..");

const generatorInputs = [
  "packages/design/component-contracts.json",
  "packages/design/component-contracts.schema.json",
  "packages/design/scripts/generate-tokens.mjs",
  "packages/design/sources",
  "packages/design/tokens.json",
  "packages/design/tokens.schema.json",
  "packages/ui/styles.css",
  "packages/ui/themes",
];

const generatedOutputs = [
  "packages/design/generated/penpot-tokens.json",
  "packages/ui-core/component-contracts.json",
  "packages/ui-core/component-contracts.schema.json",
  "packages/ui-core/src/generated/design-tokens.ts",
  "packages/ui-core/tokens.json",
  "packages/ui-core/tokens.schema.json",
  "packages/ui/styles.css",
  "packages/ui/themes/default.css",
  "packages/ui/themes/products.css",
];

const readText = (path) => readFileSync(join(designDirectory, path), "utf8");
const readJson = (path) => JSON.parse(readText(path));

const tokens = readJson("tokens.json");
const penpot = readJson("generated/penpot-tokens.json");
const maiaExport = readJson("sources/maia-tokens.penpot.json");
const productsCss = readText("../ui/themes/products.css");

const modes = ["dark", "light"];
const themeNames = ["maia", "paas"];
/** Material themes (glass tokens): they enable the solid set on top of core. */
const materialThemes = [
  "material/Solid",
  "transparency/Reduced",
  "contrast/Increased",
];
const penpotTypes = [
  "borderRadius",
  "color",
  "fontFamilies",
  "fontSizes",
  "fontWeights",
  "number",
  "opacity",
  "shadow",
  "sizing",
  "spacing",
];

/** Leaves of a DTCG group as `[dotted.path, token]` pairs. */
function leaves(group, path = []) {
  return Object.entries(group).flatMap(([key, value]) =>
    "$value" in value
      ? [[[...path, key].join("."), value]]
      : leaves(value, [...path, key]),
  );
}

function cssBlock(selector) {
  const start = productsCss.indexOf(`${selector} {`);
  assert.notEqual(start, -1, `products.css has no ${selector} block`);
  return productsCss.slice(start, productsCss.indexOf("}", start));
}

const semanticVariables = Object.values(tokens.color.semantic).map(
  (color) => color.cssVariable,
);

describe("penpot-tokens.json", () => {
  it("orders one core set, a dark and light set per product theme, then the solid material set", () => {
    const expected = [
      "vllnt/core",
      ...themeNames.flatMap((name) =>
        modes.map((mode) => `vllnt/${name}/${mode}`),
      ),
      "vllnt/material/solid",
    ];
    assert.deepEqual(penpot.$metadata.tokenSetOrder, expected);
    assert.deepEqual(
      Object.keys(penpot).filter((key) => !key.startsWith("$")),
      expected,
    );
  });

  it("groups a Dark and a Light theme per product, enabling core plus one set", () => {
    assert.deepEqual(
      penpot.$themes.map(({ group, name }) => `${group}/${name}`),
      [
        ...themeNames.flatMap((name) => [`${name}/Dark`, `${name}/Light`]),
        ...materialThemes,
      ],
    );
    for (const theme of penpot.$themes.filter(
      ({ group }) => themeNames.includes(group),
    )) {
      const enabled = Object.entries(theme.selectedTokenSets)
        .filter(([, state]) => state === "enabled")
        .map(([set]) => set);
      assert.deepEqual(enabled, [
        "vllnt/core",
        `vllnt/${theme.group}/${theme.name.toLowerCase()}`,
      ]);
      assert.deepEqual(
        Object.keys(theme.selectedTokenSets),
        penpot.$metadata.tokenSetOrder,
      );
    }
  });

  it("uses only Penpot token types", () => {
    const all = penpot.$metadata.tokenSetOrder.flatMap((set) =>
      leaves(penpot[set]),
    );
    assert.ok(all.length > 0);
    for (const [path, token] of all) {
      assert.ok(penpotTypes.includes(token.$type), `${path}: ${token.$type}`);
    }
  });

  it("gives every product set a hex color for every semantic role", () => {
    const roles = semanticVariables.map((variable) => variable.slice(2)).sort();
    for (const name of themeNames) {
      for (const mode of modes) {
        // `badge-label` is a group of references to these roles, not a role.
        const { "badge-label": badgeLabel, ...allColors } =
          penpot[`vllnt/${name}/${mode}`].color;
        assert.ok(badgeLabel);
        // `glass-*` are the glass material roles, covered by glass-tokens.test.mjs.
        const colors = Object.fromEntries(
          Object.entries(allColors).filter(([key]) => !key.startsWith("glass-")),
        );
        assert.deepEqual(Object.keys(colors).sort(), roles);
        for (const token of Object.values(colors)) {
          assert.match(token.$value, /^#[\dA-F]{6}$/);
        }
      }
    }
  });

  it("adds the approved core steps", () => {
    const core = penpot["vllnt/core"];
    assert.equal(core.spacing[5].$value, "20");
    assert.equal(core.spacing[10].$value, "40");
    assert.equal(core.radius.xl.$value, "16");
  });
});

/**
 * Maia is the default (owner decision 27 Nov 2026, issue #768): the flat monochrome
 * workbench look is the core theme, so the Maia theme overrides nothing and is kept only
 * so `data-theme="maia"` stays valid. The export copy in `sources/` is the 8 Nov pink
 * export. It is provenance and no longer drives any value, so the tests that compared
 * Maia's colours, radius, faces and scale with it are replaced by the tests below.
 * The generator test further down still reads it.
 */
const inkPrimary = { dark: "#FFFFFF", light: "#000000" };

describe("Maia is the default", () => {
  it("overrides nothing", () => {
    assert.deepEqual(Object.keys(tokens.themes.maia).sort(), ["description", "label"]);
  });

  for (const mode of modes) {
    it(`gives the ${mode} palette the core values`, () => {
      // PaaS overrides no colour either, so both sets hold the core palette.
      assert.deepEqual(
        penpot[`vllnt/maia/${mode}`].color,
        penpot[`vllnt/paas/${mode}`].color,
      );
    });

    it(`makes the ${mode} primary the ink colour, not the exported pink accent`, () => {
      const generated = penpot[`vllnt/maia/${mode}`].color;
      assert.equal(generated.primary.$value, inkPrimary[mode]);
      assert.equal(generated.primary.$value, generated.foreground.$value);
      assert.notEqual(
        generated.primary.$value,
        maiaExport[`Maia/${mode}`].color.accent.$value.toUpperCase(),
      );
    });

    it(`adds no ${mode} radius, face, weight or type step: it inherits core`, () => {
      const generated = penpot[`vllnt/maia/${mode}`];
      assert.equal(generated.radius, undefined);
      assert.equal(generated.font, undefined);
    });
  }

  it("declares the same palette as the default in products.css", () => {
    const defaultCss = readText("../ui/themes/default.css");
    const block = (css, selector) => css.slice(css.indexOf(`${selector} {`), css.indexOf("}", css.indexOf(`${selector} {`)));
    for (const [selector, base] of [
      ['html[data-theme="maia"]', ":root"],
      ['html[data-theme="maia"].dark', ".dark"],
    ]) {
      const maia = block(productsCss, selector);
      const core = block(defaultCss, base);
      for (const variable of semanticVariables) {
        const pattern = new RegExp(`${variable}: ([^;]+);`);
        assert.equal(maia.match(pattern)?.[1], core.match(pattern)?.[1], `${selector} ${variable}`);
      }
    }
  });

  it("keeps the export's state aliases on the roles the PR maps them to", () => {
    const state = maiaExport["Maia/dark"].color.state;
    const roleByState = {
      attention: "warning",
      done: "success",
      failed: "destructive",
      idle: "muted-foreground",
      running: "info",
    };
    const roleByStatus = {
      "color.status.candidate": "info",
      "color.status.deprecated": "warning",
      "color.status.implemented": "success",
      "color.status.planned": "muted-foreground",
      "color.status.unsupported": "destructive",
    };
    for (const [name, role] of Object.entries(roleByState)) {
      const status = state[name].$value.slice(1, -1);
      assert.equal(roleByStatus[status], role, name);
    }
  });
});

describe("core type scale (dense workbench)", () => {
  it("sets the approved sizes and line heights", () => {
    const scale = tokens.typography.scale;
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(scale).map(([step, token]) => [step, [token.fontSize, token.lineHeight]]),
      ),
      {
        display: ["1.75rem", "1.1"],
        h1: ["1.25rem", "1.3"],
        h2: ["0.875rem", "1.4"],
        h3: ["0.8125rem", "1.4"],
        h4: ["0.8125rem", "1.4"],
        h5: ["0.8125rem", "1.4"],
        h6: ["0.8125rem", "1.4"],
        bodyLarge: ["0.9375rem", "1.6"],
        body: ["0.875rem", "1.5"],
        bodySmall: ["0.8125rem", "1.45"],
        caption: ["0.75rem", "1.4"],
        label: ["0.6875rem", "1.4"],
      },
    );
  });

  it("writes the sizes to Penpot in points and uses no weight 700", () => {
    const { size, weight } = penpot["vllnt/core"].font;
    assert.deepEqual(
      Object.fromEntries(Object.entries(size).map(([step, token]) => [step, token.$value])),
      {
        display: "28",
        h1: "20",
        h2: "14",
        h3: "13",
        h4: "13",
        h5: "13",
        h6: "13",
        bodyLarge: "15",
        body: "14",
        bodySmall: "13",
        caption: "12",
        label: "11",
      },
    );
    assert.equal(weight.heading.$value, "500");
    assert.equal(weight.display.$value, "600");
    for (const [name, token] of Object.entries(weight)) {
      assert.notEqual(token.$value, "700", `${name}: no weight 700`);
    }
  });
});

describe("tokens.json themes", () => {
  it("defines PaaS without colors, an accent or a radius override", () => {
    assert.equal(tokens.themes.paas.color, undefined);
    assert.equal(tokens.themes.paas.radius, undefined);
    assert.equal(tokens.themes.paas.defaultMode, "dark");
  });

  it("sets JetBrains Mono for every PaaS family", () => {
    const families = Object.values(tokens.themes.paas.typography.fontFamily);
    assert.equal(families.length, 3);
    for (const family of families) {
      assert.match(family, /^'JetBrains Mono'/);
    }
  });
});

describe("core fonts", () => {
  const { fontFamily } = tokens.typography;
  const defaultCss = readText("../ui/themes/default.css");
  const stylesCss = readText("../ui/styles.css");
  const uiCoreTokens = readText("../ui-core/tokens.json");
  const uiCoreTs = readText("../ui-core/src/generated/design-tokens.ts");

  const coreStack =
    "'JetBrains Mono', ui-monospace, \"SF Mono\", SFMono-Regular, Menlo, Consolas, \"Liberation Mono\", monospace";

  it("sets JetBrains Mono first in the core sans stack, then the monospace system fallbacks", () => {
    assert.equal(fontFamily.sans.value, coreStack);
    assert.match(fontFamily.sans.value, /monospace$/);
  });

  it("sets the same stack for the core mono face", () => {
    assert.equal(fontFamily.mono.value, coreStack);
  });

  it("keeps the display face pointing at sans", () => {
    assert.equal(fontFamily.display.value, "var(--font-sans)");
  });

  it("writes the same core stacks to every generated surface", () => {
    for (const [name, css] of [
      ["themes/default.css", defaultCss],
      ["styles.css", stylesCss],
    ]) {
      const stack =
        '"JetBrains Mono", ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
      assert.ok(css.includes(`--font-sans: ${stack};`), `${name} sans`);
      assert.ok(css.includes(`--font-mono: ${stack};`), `${name} mono`);
      assert.match(css, /--font-display: var\(--font-sans\);/, name);
    }
    assert.equal(uiCoreTokens, readText("tokens.json"));
    // design-tokens.ts holds JSON, so the stack's double quotes are escaped there.
    const inJson = (stack) => JSON.stringify(stack).slice(1, -1);
    assert.ok(uiCoreTs.includes(inJson(fontFamily.sans.value)), "ui-core design-tokens.ts sans");
    assert.ok(uiCoreTs.includes(inJson(fontFamily.mono.value)), "ui-core design-tokens.ts mono");
    assert.deepEqual(penpot["vllnt/core"].font.family.sans.$value, ["JetBrains Mono"]);
    assert.deepEqual(penpot["vllnt/core"].font.family.mono.$value, ["JetBrains Mono"]);
    assert.equal(penpot["vllnt/core"].font.family.display.$value, "{font.family.sans}");
  });

  it("keeps the product theme stacks: Maia inherits the core stack, PaaS sets its own JetBrains Mono stack", () => {
    const jetbrains =
      "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";
    assert.equal(tokens.themes.maia.typography, undefined);
    assert.deepEqual(tokens.themes.paas.typography.fontFamily, {
      sans: jetbrains,
      display: jetbrains,
      mono: jetbrains,
    });
    const doubleQuoted = (stack) => stack.replaceAll("'", '"');
    assert.deepEqual(productsCss.match(/--font-(?:sans|display|mono): .*;/g), [
      `--font-sans: ${doubleQuoted(jetbrains)};`,
      `--font-display: ${doubleQuoted(jetbrains)};`,
      `--font-mono: ${doubleQuoted(jetbrains)};`,
    ]);
    assert.equal(penpot["vllnt/maia/dark"].font, undefined);
    for (const mode of modes) {
      for (const face of ["sans", "display", "mono"]) {
        assert.deepEqual(
          penpot[`vllnt/paas/${mode}`].font.family[face].$value,
          ["JetBrains Mono"],
          `paas ${mode} ${face}`,
        );
      }
    }
  });
});

describe("products.css", () => {
  for (const name of themeNames) {
    for (const mode of modes) {
      it(`declares a complete ${name} ${mode} palette`, () => {
        const selector =
          mode === "dark"
            ? `html[data-theme="${name}"].dark`
            : `html[data-theme="${name}"]`;
        const block = cssBlock(selector);
        for (const variable of semanticVariables) {
          assert.match(block, new RegExp(`${variable}: `), variable);
        }
      });
    }
  }

  it("keeps Maia's product status names out of every generated stylesheet", () => {
    const pattern = /implemented|candidate|deprecated|unsupported|planned|attention/i;
    for (const path of ["../ui/themes/products.css", "../ui/themes/default.css"]) {
      assert.doesNotMatch(readText(path), pattern, path);
    }
  });
});

/** Run the generator in a scratch copy of the repository, after `mutate` edits its `sources/`. */
function generateWithSources(mutate) {
  const root = mkdtempSync(join(tmpdir(), "design-sources-"));
  try {
    for (const path of generatorInputs) {
      cpSync(join(repositoryRoot, path), join(root, path), { recursive: true });
    }
    mutate(join(root, "packages/design/sources"));
    const run = spawnSync(
      process.execPath,
      ["packages/design/scripts/generate-tokens.mjs"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(run.status, 0, run.stderr);
    return Object.fromEntries(
      generatedOutputs.map((path) => [
        path,
        readFileSync(join(root, path), "utf8"),
      ]),
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

describe("generator", () => {
  const maiaCopy = "maia-tokens.penpot.json";
  const expected = Object.fromEntries(
    generatedOutputs.map((path) => [
      path,
      readFileSync(join(repositoryRoot, path), "utf8"),
    ]),
  );
  const mutations = {
    "a changed": (sources) => {
      const copy = join(sources, maiaCopy);
      writeFileSync(
        copy,
        readFileSync(copy, "utf8").replaceAll(/#[\dA-Fa-f]{6}\b/g, "#010203"),
      );
    },
    "a corrupt": (sources) => writeFileSync(join(sources, maiaCopy), "not json"),
    "a missing": (sources) => rmSync(sources, { force: true, recursive: true }),
  };

  for (const [name, mutate] of Object.entries(mutations)) {
    it(`writes the same outputs with ${name} design source copy`, () => {
      assert.deepEqual(generateWithSources(mutate), expected);
    });
  }
});
