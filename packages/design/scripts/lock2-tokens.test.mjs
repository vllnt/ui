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
const defaultCss = readText("../ui/themes/default.css");
const stylesCss = readText("../ui/styles.css");
const productsCss = readText("../ui/themes/products.css");

const modes = ["dark", "light"];
const themeNames = ["maia", "paas"];

/** Token at a dotted path inside one Penpot set. */
function penpotToken(set, path) {
  return path.split(".").reduce((node, key) => node?.[key], penpot[set]);
}

/**
 * Names and values the Penpot libraries carry (lock 2 readback, 18 Nov 2026:
 * vllnt/core, vllnt/mode/{light,dark}, vllnt/density/touch). Code must use the
 * same names; radius and size values are the D14 and D16 owner decisions.
 */
const libraryBadgeLabels = {
  danger: "{color.destructive}",
  info: "{color.info}",
  success: "{color.success}",
  warning: "{color.warning}",
};

const libraryBrandStatus = {
  candidate: "{color.info}",
  deprecated: "{color.warning}",
  implemented: "{color.success}",
  planned: "{color.muted-foreground}",
  unsupported: "{color.destructive}",
};

describe("color.badge-label", () => {
  for (const name of themeNames) {
    for (const mode of modes) {
      it(`gives vllnt/${name}/${mode} the library's four tones`, () => {
        const group = penpot[`vllnt/${name}/${mode}`].color["badge-label"];
        assert.deepEqual(Object.keys(group).sort(), Object.keys(libraryBadgeLabels));
        for (const [tone, value] of Object.entries(libraryBadgeLabels)) {
          assert.deepEqual(group[tone], { $value: value, $type: "color" }, tone);
        }
      });
    }
  }

  it("points every tone at an existing semantic color role", () => {
    const roles = new Set(
      Object.values(tokens.color.semantic).map((color) => color.cssVariable.slice(2)),
    );
    for (const [tone, token] of Object.entries(tokens.color["badge-label"])) {
      const role = /^\{color\.([a-z-]+)\}$/.exec(token.value)?.[1];
      assert.ok(roles.has(role), `${tone}: ${token.value}`);
    }
  });

  it("stays out of the web stylesheets, which use the roles directly", () => {
    for (const css of [defaultCss, stylesCss, productsCss]) {
      assert.doesNotMatch(css, /badge-label/);
    }
  });
});

describe("brand.status", () => {
  it("sets all five statuses in light and dark on vllnt/core", () => {
    const status = penpot["vllnt/core"].brand.status;
    assert.deepEqual(Object.keys(status).sort(), Object.keys(libraryBrandStatus));
    for (const [name, value] of Object.entries(libraryBrandStatus)) {
      for (const mode of modes) {
        assert.deepEqual(
          status[name][mode],
          { $value: value, $type: "color" },
          `${name}.${mode}`,
        );
      }
    }
  });

  it("is not set in a product set, as in the library", () => {
    for (const name of themeNames) {
      for (const mode of modes) {
        assert.equal(penpot[`vllnt/${name}/${mode}`].brand, undefined);
      }
    }
  });
});

describe("radius roles (D14)", () => {
  it("adds control 6 and surface 8 and leaves md, lg and xl alone", () => {
    assert.equal(tokens.radius.control, "0.375rem");
    assert.equal(tokens.radius.surface, "0.5rem");
    assert.deepEqual(
      [tokens.radius.sm, tokens.radius.md, tokens.radius.lg, tokens.radius.xl],
      ["0.25rem", "0.5rem", "0.75rem", "1rem"],
    );
    const core = penpot["vllnt/core"].radius;
    assert.deepEqual(core.control, { $value: "6", $type: "borderRadius" });
    assert.deepEqual(core.surface, { $value: "8", $type: "borderRadius" });
    assert.equal(core.md.$value, "8");
  });

  it("exposes both roles as CSS variables on the web", () => {
    for (const css of [defaultCss, stylesCss]) {
      assert.match(css, /--radius-control: 0\.375rem;/);
      assert.match(css, /--radius-surface: 0\.5rem;/);
    }
  });
});

describe("touch targets (D16)", () => {
  it("sets size.target.min 44 and size.control-xs 32 in Penpot", () => {
    const core = penpot["vllnt/core"];
    assert.deepEqual(penpotToken("vllnt/core", "size.target.min"), {
      $value: "44",
      $type: "sizing",
    });
    assert.deepEqual(core.size["control-xs"], { $value: "32", $type: "sizing" });
  });

  for (const [name, css] of [
    ["themes/default.css", defaultCss],
    ["styles.css", stylesCss],
  ]) {
    it(`declares both sizes in :root of ${name}`, () => {
      assert.match(css, /--size-control-xs: 2rem;/);
      assert.match(css, /--size-target-min: 2\.75rem;/);
    });

    it(`raises only size.control-xs to the minimum target under a coarse pointer in ${name}`, () => {
      const blocks = css.match(/@media \(pointer: coarse\) \{[^@]*?\n\s*\}\n\s*\}/g) ?? [];
      assert.equal(blocks.length, 1, "one coarse-pointer block");
      const declarations = blocks[0].match(/--[a-z-]+: [^;]+;/g);
      assert.deepEqual(declarations, ["--size-control-xs: var(--size-target-min);"]);
      assert.match(blocks[0], /:root \{/);
    });
  }

  it("keeps the coarse-pointer rule data in tokens.json", () => {
    assert.equal(tokens.size["control-xs"].coarse, "{size.target.min}");
    assert.equal(tokens.size.target.min.coarse, undefined);
  });
});

describe("opacity.grain and opacity.contact (D12)", () => {
  it("sets both to 1 in core, with the library's PaaS override of 0", () => {
    for (const token of ["grain", "contact"]) {
      assert.deepEqual(penpot["vllnt/core"].opacity[token], {
        $value: "1",
        $type: "opacity",
      });
      assert.equal(tokens.themes.paas.opacity[token], "0");
      for (const mode of modes) {
        assert.deepEqual(penpot[`vllnt/paas/${mode}`].opacity[token], {
          $value: "0",
          $type: "opacity",
        });
        assert.equal(penpot[`vllnt/maia/${mode}`].opacity, undefined);
      }
    }
  });

  it("exposes both as CSS variables, off in the PaaS theme only", () => {
    for (const css of [defaultCss, stylesCss]) {
      assert.match(css, /--opacity-grain: 1;/);
      assert.match(css, /--opacity-contact: 1;/);
    }
    const paas = productsCss.slice(
      productsCss.indexOf('html[data-theme="paas"] {'),
      productsCss.indexOf('html[data-theme="paas"].dark {'),
    );
    assert.match(paas, /--opacity-grain: 0;/);
    assert.match(paas, /--opacity-contact: 0;/);
    assert.doesNotMatch(
      productsCss.slice(0, productsCss.indexOf('html[data-theme="paas"] {')),
      /--opacity-/,
    );
  });
});
