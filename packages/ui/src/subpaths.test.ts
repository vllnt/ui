import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { collectSubpaths, renderSubpath } from "../scripts/subpaths";

const componentsIndex = readFileSync(
  join(__dirname, "components/index.ts"),
  "utf8",
);
const rootIndex = readFileSync(join(__dirname, "index.ts"), "utf8");
const subpaths = collectSubpaths(componentsIndex, rootIndex);

function exportedNames(name: string): string[] {
  const subpath = subpaths.find((candidate) => candidate.name === name);
  if (!subpath) throw new Error(`No subpath ${name}`);
  return [
    ...subpath.modules.flatMap(({ names }) =>
      names.map(({ exported }) => exported),
    ),
    ...subpath.types,
  ].sort();
}

describe("subpath exports", () => {
  it("gives every component directory in the barrel one subpath", () => {
    const directories = new Set(
      [...componentsIndex.matchAll(/from "\.\/[a-z]+\/([^/"]+)/g)].map(
        (match) => match[1],
      ),
    );

    expect(subpaths.map(({ name }) => name).sort()).toEqual(
      [...directories, "utils"].sort(),
    );
  });

  it("exports each barrel name from exactly one subpath", () => {
    const barrelNames = [
      ...componentsIndex.matchAll(/export (?:type )?\{([^}]*)\}/g),
    ]
      .flatMap((match) => match[1]?.split(",") ?? [])
      .flatMap((name) => {
        const exported = name
          .replace(/^\s*type\s+/, "")
          .split(/\s+as\s+/)
          .at(-1)
          ?.trim();
        return exported ? [exported] : [];
      });
    const subpathNames = subpaths
      .filter(({ name }) => name !== "utils")
      .flatMap(({ name }) => exportedNames(name));

    expect(subpathNames.sort()).toEqual([...new Set(barrelNames)].sort());
  });

  it("keeps runtime and type names apart", () => {
    expect(exportedNames("button")).toEqual([
      "Button",
      "ButtonProps",
      "UnstyledButton",
      "UnstyledButtonProps",
      "buttonVariants",
    ]);
    const button = subpaths.find(({ name }) => name === "button");
    expect(button?.types).toEqual(["ButtonProps", "UnstyledButtonProps"]);
    expect(button?.modules).toEqual([
      {
        names: [
          { exported: "Button", local: "Button" },
          { exported: "buttonVariants", local: "buttonVariants" },
        ],
        specifier: "./components/atoms/button/button",
      },
      {
        names: [{ exported: "UnstyledButton", local: "UnstyledButton" }],
        specifier: "./components/atoms/button/unstyled-button",
      },
    ]);
  });

  it("adds utils for cn and cx", () => {
    expect(exportedNames("utils")).toEqual(["cn", "cx"]);
  });

  it("groups every module of a directory under its subpath", () => {
    expect(
      subpaths
        .find(({ name }) => name === "chart")
        ?.modules.map(({ specifier }) => specifier),
    ).toEqual([
      "./components/organisms/chart/area-chart",
      "./components/organisms/chart/bar-chart",
      "./components/organisms/chart/line-chart",
    ]);
  });

  it("renders re-exports with no client directive and keeps renames", () => {
    const files = renderSubpath(
      {
        modules: [
          {
            names: [
              { exported: "Alias", local: "Original" },
              { exported: "Same", local: "Same" },
            ],
            specifier: "./components/atoms/demo/demo",
          },
        ],
        name: "demo",
        types: ["DemoProps"],
      },
      (specifier) => `../${specifier.slice(2)}.js`,
    );

    expect(files.module).toContain(
      'export { Original as Alias, Same } from "../components/atoms/demo/demo.js";',
    );
    expect(files.module).not.toContain("use client");
    expect(files.declarations).toContain(
      'export { Alias, Same, type DemoProps } from "../index.js";',
    );
  });

  it("refuses barrel exports it cannot mirror", () => {
    expect(() =>
      collectSubpaths('export * from "./atoms/button/button";', rootIndex),
    ).toThrow("unsupported export");
    expect(() =>
      collectSubpaths(
        'export { Utils } from "./atoms/utils/utils";',
        rootIndex,
      ),
    ).toThrow('Subpath "utils" is both a component and a library.');
    expect(() =>
      collectSubpaths(`${componentsIndex}\nexport const X = 1;`, rootIndex),
    ).toThrow("unsupported statement");
    expect(() =>
      collectSubpaths('export { Foo } from "../lib/foo";', rootIndex),
    ).toThrow("unsupported export");
    expect(() =>
      collectSubpaths('export { Foo } from "./foo";', rootIndex),
    ).toThrow("unsupported export");
    expect(() => collectSubpaths(componentsIndex, "")).toThrow(
      "no longer exports ./lib/",
    );
  });
});
