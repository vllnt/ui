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

describe("caption and label weights (D29 Q42)", () => {
  it("matches the library core: caption 400, label 500", () => {
    assert.equal(tokens.typography.fontWeight.caption.value, 400);
    assert.equal(tokens.typography.fontWeight.label.value, 500);
    assert.equal(penpotToken("vllnt/core", "font.weight.caption").$value, "400");
    assert.equal(penpotToken("vllnt/core", "font.weight.label").$value, "500");
  });

  it("keeps the Maia Ink scale: caption 500, label 600", () => {
    assert.equal(penpotToken("vllnt/maia/dark", "font.weight.caption").$value, "500");
    assert.equal(penpotToken("vllnt/maia/dark", "font.weight.label").$value, "600");
  });

  for (const [name, css] of [
    ["themes/default.css", defaultCss],
    ["styles.css", stylesCss],
  ]) {
    it(`declares --font-weight-label: 500 in ${name}`, () => {
      assert.match(css, /--font-weight-label: 500;/);
    });
  }
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

/** One shadow layer in the libraries' token format (all offsets in px, strings). */
const shadowLayer = (offsetY, blur, color, inset = false) => ({
  blur: String(blur),
  color,
  inset,
  offsetX: "0",
  offsetY: String(offsetY),
  spread: "0",
});

/**
 * The libraries' shadow tokens (lock 2 readback, 18 Nov 2026): `vllnt/core` holds the
 * light value, `vllnt/mode/dark` the dark one. The additive and increased-contrast
 * sets hold no shadow (every layer is transparent); code has no such mode.
 */
const libraryShadows = {
  floating: {
    dark: [shadowLayer(16, 40, "#00000099"), shadowLayer(1, 0, "#FFFFFF29", true)],
    light: [shadowLayer(16, 40, "#0000002E")],
  },
  overlay: {
    dark: [shadowLayer(8, 24, "#00000080"), shadowLayer(1, 0, "#FFFFFF1F", true)],
    light: [shadowLayer(8, 24, "#00000024")],
  },
  raised: {
    dark: [
      shadowLayer(1, 3, "#00000066"),
      shadowLayer(1, 2, "#0000003D"),
      shadowLayer(1, 0, "#FFFFFF14", true),
    ],
    light: [shadowLayer(1, 3, "#0000001A"), shadowLayer(1, 2, "#0000000F")],
  },
};

describe("shadow tokens (K-shadow-overlay)", () => {
  it("sets raised, overlay and floating on vllnt/core with the library's light layers", () => {
    const core = penpot["vllnt/core"].shadow;
    assert.deepEqual(Object.keys(core).sort(), Object.keys(libraryShadows));
    for (const [name, layers] of Object.entries(libraryShadows)) {
      assert.deepEqual(core[name], { $type: "shadow", $value: layers.light }, name);
    }
  });

  it("makes shadow.overlay the 0/8/24 black 14% drop shadow", () => {
    const [layer, ...rest] = penpot["vllnt/core"].shadow.overlay.$value;
    assert.equal(rest.length, 0);
    assert.deepEqual(
      [layer.offsetX, layer.offsetY, layer.blur, layer.spread, layer.color],
      ["0", "8", "24", "0", "#00000024"],
    );
    const alpha = Number.parseInt(layer.color.slice(7), 16) / 255;
    assert.ok(alpha > 0.139 && alpha < 0.142, `alpha ${alpha}`);
  });

  for (const name of themeNames) {
    it(`gives vllnt/${name}/dark the library's dark layers and vllnt/${name}/light none`, () => {
      const dark = penpot[`vllnt/${name}/dark`].shadow;
      for (const [token, layers] of Object.entries(libraryShadows)) {
        assert.deepEqual(dark[token], { $type: "shadow", $value: layers.dark }, token);
      }
      assert.equal(penpot[`vllnt/${name}/light`].shadow, undefined);
    });
  }

  it("exposes --shadow-* in :root for light and in .dark for dark", () => {
    const cssLayer = (layer) =>
      `${layer.inset ? "inset " : ""}${layer.offsetX}px ${layer.offsetY}px ${layer.blur}px ${layer.spread}px ${layer.color}`;
    for (const css of [defaultCss, stylesCss]) {
      const dark = css.slice(css.indexOf(".dark {"));
      const light = css.slice(0, css.indexOf(".dark {"));
      for (const [name, layers] of Object.entries(libraryShadows)) {
        assert.ok(
          light.includes(`--shadow-${name}: ${layers.light.map(cssLayer).join(", ")};`),
          `light ${name}`,
        );
        assert.ok(
          dark.includes(`--shadow-${name}: ${layers.dark.map(cssLayer).join(", ")};`),
          `dark ${name}`,
        );
      }
    }
  });

  it("leaves elevation.* as it was: it is not a library token set", () => {
    assert.deepEqual(Object.keys(tokens.elevation), ["none", "sm", "md", "lg"]);
    for (const set of penpot.$metadata.tokenSetOrder) {
      assert.equal(penpot[set].elevation, undefined, set);
    }
  });
});

/**
 * The page column of the live shared site shell: side padding 20 px, 48 px from
 * 768 px and 96 px from 1200 px, at most 1440 px wide. The tokens equal those
 * numbers, so the Penpot libraries (which follow the code values) and the shell
 * agree. The breakpoints are the shell's own and are not tokens.
 */
describe("page column tokens (spacing.page-gutter, -tablet, -desktop and size.page-max)", () => {
  const gutters = [
    ["page-gutter", "5", "20", "1.25rem"],
    ["page-gutter-tablet", "12", "48", "3rem"],
    ["page-gutter-desktop", "24", "96", "6rem"],
  ];

  it("aliases spacing steps 5, 12 and 24 in vllnt/core", () => {
    const spacing = penpot["vllnt/core"].spacing;
    for (const [name, step, pixels] of gutters) {
      assert.deepEqual(spacing[name], { $type: "spacing", $value: `{spacing.${step}}` }, name);
      assert.equal(spacing[step].$value, pixels, `spacing.${step}`);
    }
  });

  it("no longer carries the 16 / 32 pair", () => {
    assert.equal(penpot["vllnt/core"].spacing["page-gutter-wide"], undefined);
    for (const css of [defaultCss, stylesCss]) {
      assert.doesNotMatch(css, /--spacing-page-gutter-wide/);
    }
  });

  it("exposes each as a CSS variable with the resolved length", () => {
    for (const css of [defaultCss, stylesCss]) {
      for (const [name, , , length] of gutters) {
        assert.match(css, new RegExp(`--spacing-${name}: ${length};`), name);
      }
    }
  });

  it("sets size.page-max to 1440 in vllnt/core and 90rem in CSS", () => {
    assert.deepEqual(penpot["vllnt/core"].size["page-max"], { $type: "sizing", $value: "1440" });
    for (const css of [defaultCss, stylesCss]) {
      assert.match(css, /--size-page-max: 90rem;/);
    }
  });
});

describe("size.measure-narrow (F7)", () => {
  it("is 480 in vllnt/core and 30rem in CSS", () => {
    assert.deepEqual(penpot["vllnt/core"].size["measure-narrow"], {
      $type: "sizing",
      $value: "480",
    });
    for (const css of [defaultCss, stylesCss]) {
      assert.match(css, /--size-measure-narrow: 30rem;/);
    }
  });
});

/** WCAG relative luminance and contrast ratio of two `#RRGGBB` colours. */
function contrastRatio(first, second) {
  const luminance = (hex) => {
    const [red, green, blue] = [1, 3, 5]
      .map((index) => Number.parseInt(hex.slice(index, index + 2), 16) / 255)
      .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  };
  const [high, low] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
}

describe("color.input (K-input-border-contrast)", () => {
  const libraryInput = { dark: "#696969", light: "#858585" };

  for (const mode of modes) {
    it(`matches the library's ${mode} value`, () => {
      assert.equal(penpot[`vllnt/paas/${mode}`].color.input.$value, libraryInput[mode]);
    });

    it(`keeps 3:1 against the ${mode} background, card and popover`, () => {
      const { color } = penpot[`vllnt/paas/${mode}`];
      for (const surface of ["background", "card", "popover"]) {
        const ratio = contrastRatio(color.input.$value, color[surface].$value);
        assert.ok(ratio >= 3, `${surface}: ${ratio.toFixed(2)}`);
      }
    });
  }

  it("reaches 3:1 on the light muted band, which the old value (2.85) missed", () => {
    const { color } = penpot["vllnt/paas/light"];
    assert.ok(contrastRatio(color.input.$value, color.muted.$value) >= 3);
  });
});

describe("Maia Ink (K-ink-regen)", () => {
  it("has no accent: the primary is the foreground colour in both modes", () => {
    for (const mode of modes) {
      const { color } = penpot[`vllnt/maia/${mode}`];
      assert.equal(color.primary.$value, color.foreground.$value, mode);
    }
  });

  it("keeps the light primary pure black on purpose, while core keeps #171717", () => {
    assert.equal(penpot["vllnt/maia/light"].color.primary.$value, "#000000");
    assert.equal(penpot["vllnt/paas/light"].color.primary.$value, "#171717");
  });

  it("carries no Figtree and none of the old pink accent hexes in the tokens or the stylesheets", () => {
    const sources = [
      JSON.stringify(tokens.themes.maia),
      JSON.stringify(penpot["vllnt/maia/light"]),
      JSON.stringify(penpot["vllnt/maia/dark"]),
      productsCss.slice(
        productsCss.indexOf('html[data-theme="maia"] {'),
        productsCss.indexOf('html[data-theme="paas"] {'),
      ),
    ];
    for (const source of sources) {
      assert.doesNotMatch(source, /Figtree|F46CBF|BE148B/i);
    }
  });
});
