import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

import * as nativeUi from "../index";

/**
 * Render-coverage guard for the public API.
 *
 * Every PascalCase function exported from `src/index.ts` is a component. Each
 * one must appear as a JSX element in at least one test or fixture, directly
 * or through an import alias. Add a render test or an accessibility fixture
 * when this test names a missing export.
 */

const sourceFile = /\.tsx?$/;
const testLocation = /(?:^|[/\\])tests[/\\]|\.test\.tsx?$/;
const jsxTag = /<[A-Z]\w*(?=[\s/>])/g;
const importAlias = /\b[A-Z]\w* as [A-Z]\w*\b/g;

/** Joins the text of every test and fixture file under `src` except this one. */
function readTestSources(): string {
  const testPath: unknown = expect.getState().testPath;
  if (typeof testPath !== "string") {
    throw new TypeError("Jest did not report the path of this test file.");
  }
  const sourceDirectory = dirname(dirname(testPath));
  return readdirSync(sourceDirectory, { encoding: "utf8", recursive: true })
    .filter((file) => sourceFile.test(file) && testLocation.test(file))
    .map((file) => join(sourceDirectory, file))
    .filter((path) => path !== testPath)
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");
}

/** Collects the component names that `sources` render as JSX elements. */
function renderedComponentNames(sources: string): Set<string> {
  const names = new Set(
    (sources.match(jsxTag) ?? []).map((tag) => tag.slice(1)),
  );
  const aliases = (sources.match(importAlias) ?? []).map((pair) =>
    pair.split(" as "),
  );
  for (const [original, alias] of aliases) {
    if (original !== undefined && alias !== undefined && names.has(alias)) {
      names.add(original);
    }
  }
  return names;
}

it("renders every exported component in at least one test or fixture", () => {
  const exportedComponents = Object.entries(nativeUi)
    .filter(
      ([name, value]) => /^[A-Z]/.test(name) && typeof value === "function",
    )
    .map(([name]) => name);
  const rendered = renderedComponentNames(readTestSources());

  expect(exportedComponents).toEqual(
    expect.arrayContaining(["Button", "SimpleTerminal"]),
  );
  expect(exportedComponents.filter((name) => !rendered.has(name))).toEqual([]);
});
