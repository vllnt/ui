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
const maiaExport = readJson("sources/maia-tokens.penpot.json");
const productsCss = readText("../ui/themes/products.css");

const modes = ["dark", "light"];
const themeNames = ["maia", "paas"];
const penpotTypes = [
  "borderRadius",
  "color",
  "fontFamilies",
  "fontSizes",
  "fontWeights",
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
  it("orders one core set and a dark and light set per product theme", () => {
    const expected = [
      "vllnt/core",
      ...themeNames.flatMap((name) =>
        modes.map((mode) => `vllnt/${name}/${mode}`),
      ),
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
      themeNames.flatMap((name) => [`${name}/Dark`, `${name}/Light`]),
    );
    for (const theme of penpot.$themes) {
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
        const colors = penpot[`vllnt/${name}/${mode}`].color;
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

describe("Maia mapping", () => {
  const colorMap = {
    accent: "muted",
    background: "background",
    border: "border",
    card: "surface-raised",
    destructive: "status.unsupported",
    "diff-added": "diff.added",
    "diff-removed": "diff.removed",
    foreground: "foreground",
    info: "status.candidate",
    input: "input",
    muted: "muted",
    "muted-foreground": "muted-foreground",
    popover: "surface-raised",
    primary: "accent",
    "primary-foreground": "accent-foreground",
    success: "status.implemented",
    warning: "status.deprecated",
  };

  for (const mode of modes) {
    it(`reproduces the exported ${mode} colors`, () => {
      const exported = maiaExport[`Maia/${mode}`].color;
      const generated = penpot[`vllnt/maia/${mode}`].color;
      const exportedHex = (path) =>
        path
          .split(".")
          .reduce((node, key) => node[key], exported)
          .$value.toUpperCase();
      for (const [role, source] of Object.entries(colorMap)) {
        assert.equal(generated[role].$value, exportedHex(source), role);
      }
      assert.equal(
        generated["muted-foreground"].$value,
        exportedHex("status.planned"),
        "neutral status is muted-foreground",
      );
    });
  }

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

  it("reproduces the exported radius and families", () => {
    const radius = maiaExport["Maia/core"].radius;
    const generated = penpot["vllnt/maia/dark"];
    for (const step of ["sm", "md", "lg", "xl"]) {
      assert.equal(generated.radius[step].$value, radius[step].$value, step);
    }
    const family = maiaExport["Maia/core"].font.family;
    assert.deepEqual(generated.font.family.sans.$value, family.sans.$value);
    assert.deepEqual(generated.font.family.mono.$value, family.mono.$value);
  });

  it("sets the approved type scale", () => {
    const sizes = penpot["vllnt/maia/dark"].font.size;
    const weights = penpot["vllnt/maia/dark"].font.weight;
    assert.deepEqual(
      Object.fromEntries(
        Object.entries(sizes).map(([step, token]) => [step, token.$value]),
      ),
      {
        bodySmall: "13",
        body: "14",
        caption: "12",
        display: "28",
        h5: "20",
        h6: "15",
        label: "11",
      },
    );
    assert.equal(weights.display.$value, "700");
    assert.equal(weights.heading.$value, "600");
    assert.equal(weights.label.$value, "700");
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

describe("generator", () => {
  it("never reads the design source copies", () => {
    assert.doesNotMatch(
      readText("scripts/generate-tokens.mjs"),
      /sources\/|\.penpot\.json/,
    );
  });
});
