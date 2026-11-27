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

const readText = (path) => readFileSync(join(repositoryRoot, path), "utf8");
const readJson = (path) => JSON.parse(readText(path));

/** The `nativeTokens` object of a generated `design-tokens.ts`; it is a JSON literal. */
const readNativeTokens = (typescript) =>
  JSON.parse(
    /export const nativeTokens = (\{[\s\S]*?\n\}) as const;/.exec(typescript)[1],
  );

const modes = ["dark", "light"];

/** A shadow with no layers, in React Native units. */
const noShadow = {
  elevation: 0,
  shadowColor: "#000000",
  shadowOffset: { height: 0, width: 0 },
  shadowOpacity: 0,
  shadowRadius: 0,
};

const tokens = readJson("packages/design/tokens.json");
const penpot = readJson("packages/design/generated/penpot-tokens.json");
const native = readNativeTokens(
  readText("packages/ui-core/src/generated/design-tokens.ts"),
);

/** An independent source for OKLCH-channel colours: the Penpot output holds them as hex. */
const penpotHex = (mode, name) =>
  penpot[`vllnt/maia/${mode}`].color[name].$value.toLowerCase();

const generatorInputs = [
  "packages/design/component-contracts.json",
  "packages/design/component-contracts.schema.json",
  "packages/design/scripts/generate-tokens.mjs",
  "packages/design/tokens.json",
  "packages/design/tokens.schema.json",
  "packages/ui/styles.css",
];

/** Run the generator in a scratch copy of the repository whose `tokens.json` `mutate` edited. */
function generateWithTokens(mutate) {
  const root = mkdtempSync(join(tmpdir(), "native-glass-"));
  try {
    for (const path of generatorInputs) {
      cpSync(join(repositoryRoot, path), join(root, path), { recursive: true });
    }
    const tokensPath = join(root, "packages/design/tokens.json");
    const copy = JSON.parse(readFileSync(tokensPath, "utf8"));
    mutate(copy);
    writeFileSync(tokensPath, JSON.stringify(copy, null, 2));
    const run = spawnSync(
      process.execPath,
      ["packages/design/scripts/generate-tokens.mjs"],
      { cwd: root, encoding: "utf8" },
    );
    assert.equal(run.status, 0, run.stderr);
    return readNativeTokens(
      readFileSync(join(root, "packages/ui-core/src/generated/design-tokens.ts"), "utf8"),
    );
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

describe("nativeTokens.glass is derived from tokens.json", () => {
  for (const mode of modes) {
    describe(mode, () => {
      const glass = native.glass[mode];

      it("takes every tint step from material.glass, as lowercase #rrggbbaa", () => {
        assert.deepEqual(glass.tint, {
          top: tokens.material.glass["tint-top"][mode].toLowerCase(),
          bottom: tokens.material.glass["tint-bottom"][mode].toLowerCase(),
          denseTop: tokens.material.glass["tint-dense-top"][mode].toLowerCase(),
          denseBottom: tokens.material.glass["tint-dense-bottom"][mode].toLowerCase(),
        });
      });

      it("takes the hairline from color.glass-border", () => {
        assert.equal(glass.hairline, tokens.color["glass-border"][mode].toLowerCase());
      });

      it("takes the glass text roles from color.glass-*, and foreground from the base role", () => {
        assert.equal(glass.mutedForeground, penpotHex(mode, "glass-muted-foreground"));
        assert.equal(glass.input, penpotHex(mode, "glass-input"));
        assert.equal(glass.foreground, native.color[mode].foreground);
      });

      it("takes every blur radius from blur.glass, in points", () => {
        assert.deepEqual(
          glass.blur,
          Object.fromEntries(
            Object.entries(tokens.blur.glass).map(([name, leaf]) => [
              name,
              Number.parseFloat(leaf.value),
            ]),
          ),
        );
      });

      it("has a solid fallback with the same shape as the glass group", () => {
        const { solid, ...surface } = glass;
        const shape = (value) =>
          Object.fromEntries(
            Object.entries(value)
              .sort(([first], [second]) => first.localeCompare(second))
              .map(([key, child]) => [key, typeof child === "object" ? shape(child) : typeof child]),
          );
        assert.deepEqual(shape(solid), shape(surface));
      });

      it("resolves the solid fallback to the opaque native colours, with no blur", () => {
        const { color } = native;
        const { solid } = glass;
        assert.deepEqual(Object.values(solid.tint), Array(4).fill(color[mode].card));
        assert.equal(solid.hairline, color[mode].border);
        assert.equal(solid.foreground, color[mode].foreground);
        assert.equal(solid.mutedForeground, color[mode].mutedForeground);
        assert.equal(solid.input, color[mode].input);
        assert.deepEqual(Object.values(solid.blur), Array(4).fill(0));
        for (const value of Object.values(solid.tint)) {
          assert.match(value, /^#[0-9a-f]{6}$/, "an opaque colour has no alpha");
        }
      });
    });
  }

  it("maps the shadows to the documented React Native rule", () => {
    for (const mode of modes) {
      assert.deepEqual(Object.keys(native.glass[mode].shadow), ["glass", "glassFloating"]);
    }
    // light shadow.glass: layers 0 1 2 #0000000D and 0 4 14 #0000000F. The 14 px layer
    // blurs most, so it wins: radius 14 / 2, opacity 0x0F / 255, elevation (4 + 7) / 2.
    assert.deepEqual(native.glass.light.shadow.glass, {
      elevation: 6,
      shadowColor: "#000000",
      shadowOffset: { height: 4, width: 0 },
      shadowOpacity: 0.059,
      shadowRadius: 7,
    });
    // dark shadow.glass-floating: 0 1 2 and 0 10 28, both #00000080. Equal alpha, so blur decides.
    assert.deepEqual(native.glass.dark.shadow.glassFloating, {
      elevation: 12,
      shadowColor: "#000000",
      shadowOffset: { height: 10, width: 0 },
      shadowOpacity: 0.502,
      shadowRadius: 14,
    });
    // The solid fallback maps shadow.raised and shadow.floating, which are none: no layers, no shadow.
    for (const mode of modes) {
      for (const name of ["glass", "glassFloating"]) {
        assert.deepEqual(native.glass[mode].solid.shadow[name], noShadow, `${mode} solid ${name}`);
      }
    }
  });

  it("maps a shadow with no layers to a shadow with every field zero", () => {
    const generated = generateWithTokens((copy) => {
      copy.shadow.glass.light = [];
    });
    assert.deepEqual(generated.glass.light.shadow.glass, noShadow);
    assert.deepEqual(generated.glass.dark.shadow.glass, native.glass.dark.shadow.glass);
  });

  it("skips inset layers and picks the layer with the largest blur, then the higher alpha", () => {
    const generated = generateWithTokens((copy) => {
      const layer = (offsetX, offsetY, blur, color, inset = false) => ({
        blur,
        color,
        inset,
        offsetX,
        offsetY,
        spread: "0",
      });
      copy.shadow.glass.light = [
        layer("0", "1", "4", "#000000FF"),
        layer("0", "0", "99", "#FFFFFF80", true),
        layer("2", "6", "20", "#FF000040"),
        layer("-3", "8", "20", "#00FF0080"),
      ];
    });
    assert.deepEqual(generated.glass.light.shadow.glass, {
      elevation: 9,
      shadowColor: "#00ff00",
      shadowOffset: { height: 8, width: -3 },
      shadowOpacity: 0.502,
      shadowRadius: 10,
    });
  });

  it("changes the native output when tokens.json changes: nothing is typed by hand", () => {
    const generated = generateWithTokens((copy) => {
      copy.material.glass["tint-top"].light = "#123456AB";
      copy.material.glass["tint-dense-bottom"].dark = "#654321CD";
      copy.color["glass-border"].dark = "#ABCDEF12";
      copy.color["glass-input"].light = "0 0 0";
      copy.blur.glass.sm.value = "9px";
      copy.material.solid["material.glass.tint-top"] = "{color.popover}";
      copy.material.solid["material.glass.hairline"] = "{color.glass-border}";
      copy.material.solid["shadow.glass"] = "{shadow.glass-floating}";
    });
    const { dark, light } = generated.glass;
    assert.equal(light.tint.top, "#123456ab");
    assert.equal(dark.tint.denseBottom, "#654321cd");
    assert.equal(dark.hairline, "#abcdef12");
    assert.equal(light.input, "#000000");
    assert.equal(light.blur.sm, 9);
    assert.equal(light.solid.tint.top, generated.color.light.popover);
    assert.equal(dark.solid.tint.top, generated.color.dark.popover);
    assert.equal(dark.solid.hairline, "#abcdef12");
    // shadow.glass-floating, light: 0 1 2 #00000014 and 0 10 28 #0000001F. The 28 px layer wins.
    assert.deepEqual(light.solid.shadow.glass, {
      elevation: 12,
      shadowColor: "#000000",
      shadowOffset: { height: 10, width: 0 },
      shadowOpacity: 0.122,
      shadowRadius: 14,
    });
    // Untouched values stay put.
    assert.equal(dark.tint.top, native.glass.dark.tint.top);
    assert.equal(light.tint.bottom, native.glass.light.tint.bottom);
    assert.equal(dark.blur.sm, 9, "blur is the same in both modes");
    assert.deepEqual(light.shadow, native.glass.light.shadow);
  });
});
