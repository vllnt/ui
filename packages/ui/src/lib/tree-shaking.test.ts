import { execFileSync } from "node:child_process";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const components = join(import.meta.dirname, "../components");
const esbuildCli = join(
  import.meta.dirname,
  "../../node_modules/esbuild/bin/esbuild",
);

/**
 * The code a bundler keeps when a page imports `exportName` from `file` and
 * nothing else. esbuild runs as its own process: its API refuses to load in the
 * jsdom environment these tests share.
 */
function bundleOf(exportName: string, file: string): string {
  return execFileSync(
    process.execPath,
    [
      esbuildCli,
      "--bundle",
      "--format=esm",
      "--jsx=automatic",
      "--loader=ts",
      "--minify",
      "--packages=external",
    ],
    {
      encoding: "utf8",
      input: `export { ${exportName} } from ${JSON.stringify(join(components, file))};`,
    },
  );
}

/**
 * Importing one export must not load the rest of its module. A top-level
 * `X.displayName = "X"` statement, a `X.Part = ...` static or a call a bundler
 * cannot prove pure each keep every export of the module alive, so the page
 * pays for parts it never renders. Each case names a class string that
 * belongs to the code the page should not get.
 */
describe("tree shaking", () => {
  it.each([
    {
      dropped: "vllnt-glass-scrim",
      exportName: "DialogHeader",
      file: "atoms/dialog/dialog.tsx",
      kept: "space-y-1.5",
    },
    {
      dropped: "justify-center py-1",
      exportName: "SelectGroup",
      file: "atoms/select/select.tsx",
      kept: "SelectGroup",
    },
    {
      dropped: "vllnt-radix-popover",
      exportName: "Popover",
      file: "atoms/popover/popover.tsx",
      kept: "Popover",
    },
    {
      dropped: "vllnt-glass-scrim",
      exportName: "Command",
      file: "molecules/command/command.tsx",
      kept: "Command",
    },
  ])(
    "$exportName alone leaves out what it does not use",
    ({ dropped, exportName, file, kept }) => {
      const code = bundleOf(exportName, file);

      expect(code).toContain(kept);
      expect(code).not.toContain(dropped);
    },
  );

  it("keeps a part when it is imported", () => {
    const code = bundleOf("DialogOverlay", "atoms/dialog/dialog.tsx");

    expect(code).toContain("vllnt-glass-scrim");
  });

  it("keeps the statics of a compound component with its root", () => {
    const code = bundleOf("Tabs", "atoms/tabs/tabs.tsx");

    expect(code).toContain("TabsList");
    expect(code).toContain("TabsTrigger");
    expect(code).toContain("TabsContent");
  });
});
